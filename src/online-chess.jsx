import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Copy,History,RotateCcw,ArrowLeft,ArrowRight,Flag,Wifi,Download,Users} from 'lucide-react';
import {readGames,writeGame,rebuild,resultOf,legalMove,cleanName,roomPattern,token} from './online-chess-store.js';
import './online-chess.css';

const chessURL='https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js';
const peerURL='https://cdn.jsdelivr.net/npm/peerjs@1.5.5/+esm';
const chars={w:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟︎'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟︎'}};
const files='abcdefgh';
const date=g=>new Date(g.updated).toLocaleString();
const label=g=>g.result==='*'?'In progress':g.result==='1-0'?'White wins':g.result==='0-1'?'Black wins':'Draw';
const inviteRoom=()=>new URLSearchParams(location.search).get('room')||'';
const roomCode=s=>{try{return new URL(s).searchParams.get('room')||''}catch{return String(s||'').trim()}};
function newGame(mode,name,room=token()){const now=new Date().toISOString();return {id:room,mode,role:mode==='online'?'host':'local',white:cleanName(name),black:mode==='online'?'Waiting for opponent':'Player 2',guestToken:null,moves:[],result:'*',reason:'',created:now,updated:now}}
function guestKey(room){const key='campusplay.chess.guest.'+room;try{let v=localStorage.getItem(key);if(!v){v=token();localStorage.setItem(key,v)}return v}catch{return token()}}
function publicState(g){const {role,guestToken,...data}=g;return data}
export function OnlineChess({me}){
 const [Chess,setChess]=useState(null),[engineError,setEngineError]=useState(''),[game,setGame]=useState(null),[games,setGames]=useState(()=>readGames()),[room,setRoom]=useState(inviteRoom),[name,setName]=useState(me.role==='Guest'?'':me.name),[network,setNetwork]=useState('Offline'),[error,setError]=useState(''),[saved,setSaved]=useState(true),[selected,setSelected]=useState(''),[promotion,setPromotion]=useState(null),[replay,setReplay]=useState(null),[flipped,setFlipped]=useState(false),[pending,setPending]=useState(false);
 const state=useRef(null),peer=useRef(null),conn=useRef(null),epoch=useRef(0),guestIdentity=useRef(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;import(/* @vite-ignore */ chessURL).then(m=>{if(mounted.current)setChess(()=>m.Chess)}).catch(()=>{if(mounted.current)setEngineError('Chess engine could not load. Refresh or check your connection.')});return()=>{mounted.current=false;epoch.current++;conn.current?.close();peer.current?.destroy()}},[]);
 function commit(g){state.current=g;setGame(g);const ok=writeGame(g);setSaved(ok);setGames(readGames());setSelected('');setPromotion(null);setPending(false)}
 function stop(){epoch.current++;const c=conn.current,p=peer.current;conn.current=null;peer.current=null;c?.close();p?.destroy();setNetwork('Offline');setPending(false)}
 function send(payload){if(conn.current?.open){try{conn.current.send(payload);return true}catch{}}return false}
 function broadcast(g){send({type:'state',game:publicState(g)})}
 function hostMove(m,color){try{const next=legalMove(Chess,state.current,m,color);commit(next);broadcast(next)}catch(e){setError(e.message);send({type:'rejected',message:e.message})}}
 async function connect(role,code,initial){
  stop();const run=epoch.current;setNetwork('Connecting…');setError('');
  try{
   const {Peer}=await import(/* @vite-ignore */ peerURL);if(run!==epoch.current||!mounted.current)return;
   const p=role==='host'?new Peer('campusplay-chess-'+code,{debug:0}):new Peer({debug:0});peer.current=p;
   const valid=()=>mounted.current&&epoch.current===run;
   const bind=(c)=>{
    let accepted=false;
    c.on('open',()=>{if(!valid()){c.close();return}if(role==='guest'){conn.current=c;c.send({type:'hello',token:guestIdentity.current,name:cleanName(name)});setNetwork('Joining…')}});
    c.on('data',msg=>{
     if(!valid()||!msg||typeof msg!=='object')return;
     if(role==='host'){
      const current=state.current;if(!current||current.id!==code)return;
      if(msg.type==='hello'){
       if(!roomPattern.test(msg.token||'')||(current.guestToken&&current.guestToken!==msg.token)||(conn.current?.open&&conn.current!==c)){c.send({type:'rejected',message:'Room already has an opponent.'});c.close();return}
       accepted=true;conn.current=c;
       const next={...current,guestToken:msg.token,black:current.guestToken?current.black:cleanName(msg.name),updated:new Date().toISOString()};commit(next);setNetwork('Connected');broadcast(next);return;
      }
      if(!accepted||c!==conn.current)return;
      if(msg.type==='move'&&msg.ply===current.moves.length)hostMove(msg.move,'b');
      else if(msg.type==='move'){broadcast(current);c.send({type:'rejected',message:'Position changed; please try again.'})}
      else if(msg.type==='resign'&&current.result==='*'){const next={...current,result:'1-0',reason:'Black resigned',updated:new Date().toISOString()};commit(next);broadcast(next)}
     }else if(c===conn.current){
      if(msg.type==='rejected'){setError(String(msg.message||'Request rejected').slice(0,140));setPending(false);return}
      if(msg.type!=='state'||msg.game?.id!==code||msg.game.mode!=='online')return;
      try{
       const r=msg.game,g=rebuild(Chess,r.moves),actual=resultOf(g);
       if(!['*','1-0','0-1','1/2-1/2'].includes(r.result)||actual!=='*'&&r.result!==actual||actual==='*'&&r.result!=='*'&&!['White resigned','Black resigned'].includes(r.reason)||r.reason==='White resigned'&&r.result!=='0-1'||r.reason==='Black resigned'&&r.result!=='1-0')throw Error('Invalid game result');
       const old=state.current;if(old?.id===code&&(old.moves.length>r.moves.length||!old.moves.every((m,i)=>m.from===r.moves[i]?.from&&m.to===r.moves[i]?.to&&m.promotion===r.moves[i]?.promotion)||old.result!=='*'&&old.result!==r.result))throw Error('Received a conflicting game history');
       commit({id:code,mode:'online',role:'guest',white:cleanName(r.white),black:cleanName(r.black),moves:r.moves.map(m=>({from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})})),result:r.result,reason:String(r.reason||'').slice(0,80),created:String(r.created||new Date().toISOString()),updated:new Date().toISOString()});setNetwork('Connected');
      }catch(e){setError(e.message);setPending(false)}
     }
    });
    c.on('close',()=>{if(valid()&&conn.current===c){conn.current=null;setNetwork('Disconnected — reconnect to continue');setPending(false)}});
    c.on('error',()=>{if(valid()){setError('Connection interrupted. Reconnect from the saved game.');setNetwork('Disconnected');setPending(false)}});
   };
   p.on('open',()=>{if(!valid())return;if(role==='host')setNetwork('Waiting for opponent');else{const c=p.connect('campusplay-chess-'+code,{reliable:true});conn.current=c;bind(c)}});
   p.on('connection',c=>{if(!valid()||role!=='host'){c.close();return}bind(c)});
   p.on('error',e=>{if(valid()){setNetwork('Connection unavailable');setError(e.type==='peer-unavailable'?'Host is not online. Ask your friend to open the room.':'Could not connect. Try reconnecting or a different network.');setPending(false)}});
   p.on('disconnected',()=>{if(valid()&&!conn.current?.open){setNetwork('Disconnected');setPending(false)}});
  }catch{if(run===epoch.current&&mounted.current){setNetwork('Connection unavailable');setError('Online connection library could not load. Local play remains available.')}}
 }
 function startLocal(){stop();setReplay(null);setFlipped(false);setError('');commit(newGame('local',name))}
 function createRoom(){setReplay(null);setFlipped(false);const g=newGame('online',name);commit(g);setRoom(g.id);connect('host',g.id,g)}
 function joinRoom(){const code=roomCode(room);if(!roomPattern.test(code)){setError('Enter a valid invite link or 32-character room code.');return}const existing=readGames().find(g=>g.id===code);if(existing?.role==='host'){resume(existing);return}state.current=existing||null;setGame(existing||null);setSelected('');setPromotion(null);setReplay(null);setFlipped(true);guestIdentity.current=guestKey(code);connect('guest',code,existing)}
 function resume(g){stop();setError('');setReplay(null);setFlipped(g.role==='guest');commit(g);if(g.result!=='*')return;if(g.mode==='online'){setRoom(g.id);if(g.role==='guest')guestIdentity.current=guestKey(g.id);connect(g.role,g.id,g)}}
 function review(g){stop();state.current=g;setGame(g);setReplay(0);setFlipped(false);setSelected('');setPromotion(null);setError('')}
 const board=useMemo(()=>{if(!Chess)return null;try{return rebuild(Chess,(game?.moves||[]).slice(0,replay===null?undefined:replay))}catch{return new Chess()}},[Chess,game,replay]);
 const full=useMemo(()=>{if(!Chess||!game)return null;try{return rebuild(Chess,game.moves)}catch{return null}},[Chess,game]);
 const color=game?.role==='host'?'w':game?.role==='guest'?'b':null;
 const playable=!!game&&game.result==='*'&&replay===null&&!pending&&(game.mode==='local'||network==='Connected'&&board?.turn()===color);
 const targets=playable&&selected?board.moves({square:selected,verbose:true}):[];
 function move(m){setError('');if(!playable)return;if(game.role==='guest'){if(send({type:'move',move:m,ply:game.moves.length}))setPending(true);else setError('Connection closed. Reconnect to continue.')}else hostMove(m,color);setPromotion(null);setSelected('')}
 function square(s){if(!playable||promotion)return;const p=board.get(s);if(p?.color===board.turn()){setSelected(s===selected?'':s);return}const choices=targets.filter(m=>m.to===s);if(choices.length>1){setPromotion(choices.map(m=>({from:m.from,to:m.to,promotion:m.promotion})));return}if(choices.length===1){const m=choices[0];move({from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})})}}
 function resign(){if(!game||game.result!=='*'||replay!==null||game.mode==='online'&&network!=='Connected')return;if(!window.confirm('Resign this game?'))return;if(game.role==='guest'){if(send({type:'resign'}))setPending(true);return}const side=game.mode==='local'?board.turn():'w';const next={...game,result:side==='w'?'0-1':'1-0',reason:side==='w'?'White resigned':'Black resigned',updated:new Date().toISOString()};commit(next);broadcast(next)}
 async function copyInvite(){if(!game)return;const url=new URL(location.href);url.search='';url.searchParams.set('room',game.id);try{await navigator.clipboard.writeText(url.href);setError('Invite link copied.')}catch{setError('Share room code: '+game.id)}}
 function exportPGN(g){if(!Chess)return;try{const x=rebuild(Chess,g.moves);x.setHeader('Event','CampusPlay chess');x.setHeader('White',g.white);x.setHeader('Black',g.black);x.setHeader('Date',g.created.slice(0,10).replaceAll('-','.'));x.setHeader('Result',g.result);const raw=x.pgn();const pgn=raw.replace(/(?:\s(?:1-0|0-1|1\/2-1\/2|\*))?\s*$/,' '+g.result);const url=URL.createObjectURL(new Blob([pgn],{type:'application/x-chess-pgn'}));const a=document.createElement('a');a.href=url;a.download='campusplay-'+g.id+'.pgn';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch{setError('Could not export this game.')}}
 const squares=Array.from({length:64},(_,i)=>{const row=i>>3,col=i&7;return files[flipped?7-col:col]+(flipped?row+1:8-row)});
 const shownPly=replay===null?(game?.moves.length||0):replay,history=full?.history()||[];
 return <main className="page-wrap oc-page"><header className="oc-heading"><div><h1>Online chess</h1><p>Play a friend or review your games.</p></div><span className="oc-status"><Wifi size={16}/>{network}</span></header>
 <div className="oc-lobby"><label>Display name<input maxLength={60} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><div className="oc-actions"><button className="btn primary" disabled={!Chess} onClick={createRoom}><Users size={17}/> Create online room</button><button className="btn secondary" disabled={!Chess} onClick={startLocal}>Play on this device</button></div><form onSubmit={e=>{e.preventDefault();joinRoom()}}><label>Join with invite link or code<input value={room} onChange={e=>setRoom(e.target.value)} placeholder="Paste invite link"/></label><button className="btn primary" disabled={!Chess}>Join</button></form></div>
 {engineError&&<p role="alert" className="oc-notice">{engineError}</p>}{!Chess&&!engineError&&<p className="oc-notice">Loading chess engine…</p>}{error&&<p className="oc-notice" role="status">{error}</p>}{!saved&&<p className="oc-notice" role="alert">Game could not be saved. Storage is full or blocked. Export PGN before leaving.</p>}
 {game&&board&&<section className="oc-game"><div className="oc-board-panel"><div className="oc-player"><strong>{flipped?game.white:game.black}</strong><span>{flipped?'White':'Black'}</span></div><div className="oc-board" role="group" aria-label="Chessboard">{squares.map(s=>{const p=board.get(s),light=(files.indexOf(s[0])+Number(s[1]))%2===0,legal=targets.some(m=>m.to===s);return <button key={s} className={'oc-square '+(light?'light':'dark')+(selected===s?' selected':'')+(legal?' target':'')} aria-label={s+(p?' '+(p.color==='w'?'white ':'black ')+({p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'})[p.type]:' empty')} onClick={()=>square(s)} disabled={!playable||!!promotion}><span className={'oc-piece '+(p?.color==='w'?'white':'black')}>{p?chars[p.color][p.type]:''}</span>{legal&&<i/>}{(flipped?s[0]==='h':s[0]==='a')&&<small className="rank">{s[1]}</small>}{(flipped?s[1]==='8':s[1]==='1')&&<small className="file">{s[0]}</small>}</button>})}</div><div className="oc-player"><strong>{flipped?game.black:game.white}</strong><span>{flipped?'Black':'White'}</span></div>
 {promotion&&<div className="oc-promotion"><span>Promote to:</span>{promotion.map(m=><button key={m.promotion} onClick={()=>move(m)}>{({q:'Queen',r:'Rook',b:'Bishop',n:'Knight'})[m.promotion]}</button>)}<button onClick={()=>setPromotion(null)}>Cancel</button></div>}
 <div className="oc-actions"><button className="btn secondary" onClick={()=>setFlipped(v=>!v)}><RotateCcw size={15}/> Flip</button><button className="btn secondary" onClick={resign} disabled={game.result!=='*'||replay!==null||pending||game.mode==='online'&&network!=='Connected'}><Flag size={15}/> Resign</button><button className="btn secondary" onClick={()=>exportPGN(game)}><Download size={15}/> PGN</button></div></div>
 <aside className="oc-side"><h2>{replay!==null?'Game replay':label(game)}</h2><p>{replay!==null?'Move '+shownPly+' of '+game.moves.length:game.result==='*'?(board.turn()==='w'?'White':'Black')+' to move'+(board.isCheck()?' · Check':''):game.reason}</p>{game.mode==='online'&&game.role==='host'&&game.result==='*'&&replay===null&&<div className="oc-invite"><button className="btn primary" onClick={copyInvite}><Copy size={16}/> Copy invite link</button><small>Room code: {game.id}</small></div>}{game.mode==='online'&&game.result==='*'&&replay===null&&network!=='Connected'&&network!=='Waiting for opponent'&&<button className="btn secondary" onClick={()=>resume(game)}>Reconnect</button>}<div className="oc-moves"><h3>Moves</h3>{history.length?Array.from({length:Math.ceil(history.length/2)},(_,i)=><div key={i}><span>{i+1}.</span><span>{history[2*i]}</span><span>{history[2*i+1]||'—'}</span></div>):<p>No moves yet</p>}</div>{replay!==null&&<div className="oc-actions"><button className="btn secondary" disabled={replay===0} onClick={()=>setReplay(v=>v-1)} aria-label="Previous move"><ArrowLeft size={17}/></button><button className="btn secondary" disabled={replay>=game.moves.length} onClick={()=>setReplay(v=>v+1)} aria-label="Next move"><ArrowRight size={17}/></button>{game.result==='*'&&<button className="btn primary" onClick={()=>resume(game)}>Resume game</button>}</div>}<small>{saved?'Saved on this browser':'Not saved'} · {game.moves.length} half-moves</small></aside></section>}
 <section className="oc-archive"><h2><History size={22}/> Game history</h2><p>Games are saved after every accepted move, including unfinished games. Saved history is device-local.</p>{games.length?games.map(g=><article key={g.id} className="oc-history-row"><div><strong>{g.white} vs {g.black}</strong><small>{date(g)} · {g.mode==='online'?'Online':'Local'} · {label(g)} · {g.moves.length} half-moves</small></div><div className="oc-actions">{g.result==='*'&&<button className="btn primary" disabled={!Chess} onClick={()=>resume(g)}>Resume</button>}<button className="btn secondary" disabled={!Chess} onClick={()=>review(g)}>Replay</button><button className="btn secondary" disabled={!Chess} onClick={()=>exportPGN(g)}>PGN</button></div></article>):<p>No saved games yet.</p>}</section>
 <p className="oc-footnote">Online rooms are untimed, private-by-invite and peer-to-peer. Both players must connect to play; some networks may block WebRTC. No account authentication, ranked matchmaking or cloud backup. Clearing browser data removes local history.</p></main>
}
