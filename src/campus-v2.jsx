import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock3, MapPin, Trophy, Zap, Plus, ShieldCheck, Newspaper, Medal, CalendarDays, Users, Activity, ArrowUpRight } from 'lucide-react';
import { publicAsset } from './assets.js';
import { sampleArticles } from './news-data.js';
import './campus-v2.css';

const SPORTS = ['Cricket', 'Football', 'Chess'];
const PHOTOS = {"Cricket":"https://images.unsplash.com/photo-1759733841123-b8e1d75ee45c?auto=format&fit=crop&w=1000&q=82","Football":"https://images.unsplash.com/photo-1770937331389-e0c0549aff5d?auto=format&fit=crop&w=1000&q=82","Chess":"https://images.unsplash.com/photo-1677816156435-e844da620fa9?auto=format&fit=crop&w=1000&q=82"};
const LOCAL_FALLBACK = {Cricket:'/images/teams/cricket/team-india.jpg',Football:'/images/players/football/lionel-messi.jpg'};
const SPORT_PATHS = {"Cricket":["M11.105 18.79l-1 .992a4.159 4.159 0 0 1 -6.038 -5.715l.157 -.166l8.282 -8.401l1.5 1.5l3.45 -3.391a2.08 2.08 0 0 1 3.057 2.815l-.116 .126l-3.391 3.45l1.5 1.5l-3.668 3.617","M10.5 7.5l6 6","M11 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"],"Football":["M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0","M12 7l4.76 3.45l-1.76 5.55h-6l-1.76 -5.55l4.76 -3.45","M12 7v-4m3 13l2.5 3m-.74 -8.55l3.74 -1.45m-11.44 7.05l-2.56 2.95m.74 -8.55l-3.74 -1.45"],"Chess":["M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8","M9 3l1 3l-3.491 2.148a1 1 0 0 0 .524 1.852h2.967l-2.073 6h7.961l.112 -5c0 -3 -1.09 -5.983 -4 -7c-1.94 -.678 -2.94 -1.011 -3 -1"]};
// Sport icons from Tabler Icons (MIT); see public/images/SPORT-CREDITS.md.
function SportIcon({sport}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{(SPORT_PATHS[sport]||[]).map(path=><path key={path} d={path}/>)}</svg>;
}
function SportPhoto({sport}) {
  const [attempt,setAttempt]=useState(0);
  const url=attempt===0?PHOTOS[sport]:attempt===1&&LOCAL_FALLBACK[sport]?publicAsset(LOCAL_FALLBACK[sport]):null;
  return url?<img className="cp2-sport-photo" src={url} alt="" loading="lazy" onError={()=>setAttempt(n=>n+1)}/>:<div className="cp2-sport-illustration" aria-hidden="true"><SportIcon sport={sport}/></div>;
}
function rankPlayers(matches,users) {
  const map=new Map();
  for(const m of matches) {
    if(m.status!=='Completed'||!m.result)continue;
    for(const side of ['home','away']){
      const id=side==='home'?m.hostId:m.opponentId;if(!id)continue;
      const p=map.get(id)||{id,name:users.find(u=>u.id===id)?.name||m[side],played:0,wins:0,draws:0};
      p.played++;if(m.result.winner===side)p.wins++;else if(m.result.winner==='draw')p.draws++;
      map.set(id,p);
    }
  }
  return [...map.values()].sort((a,b)=>b.wins-a.wins||b.draws-a.draws||a.played-b.played||a.name.localeCompare(b.name));
}
const defaults = sport => ({sport,team:'',venue:'',when:'',size:sport==='Chess'?1:5,length:sport==='Cricket'?5:30});
const emptyScore = {home:'',away:'',homeWickets:'',awayWickets:'',chess:'draw'};

export function resultFor(match, form) {
  if(match.sport==='Chess') {
    if(!['home','away','draw'].includes(form.chess)) throw Error('Choose a chess result.');
    return {winner:form.chess,home:form.chess==='home'?1:form.chess==='draw'?0.5:0,away:form.chess==='away'?1:form.chess==='draw'?0.5:0};
  }
  const integer = (v,max=9999) => {
    if(String(v).trim()==='' || !Number.isInteger(Number(v)) || Number(v)<0 || Number(v)>max) throw Error('Enter valid non-negative whole numbers.');
    return Number(v);
  };
  const home=integer(form.home),away=integer(form.away);
  const result={home,away,winner:home===away?'draw':home>away?'home':'away'};
  if(match.sport==='Cricket') {
    result.homeWickets=integer(form.homeWickets,Math.max(0,match.size-1));
    result.awayWickets=integer(form.awayWickets,Math.max(0,match.size-1));
  }
  return result;
}
function outcome(m) {
  const r=m.result;
  if(!r) return '';
  if(r.winner==='draw') return m.sport==='Cricket'?'Match tied':'Draw';
  return (r.winner==='home'?m.home:m.away)+' won';
}
function score(m, side) {
  if(!m.result)return '—';
  return m.sport==='Cricket'?m.result[side]+'/'+m.result[side+'Wickets']:String(m.result[side]);
}
function format(m) {
  return m.sport==='Cricket'?m.size+' v '+m.size+' · '+m.length+' overs':m.sport==='Football'?m.size+' v '+m.size+' · '+m.length+' min':'1 v 1 · '+m.length+' min per player';
}
function dateLabel(s) {const d=new Date(s);return s&&!Number.isNaN(d.getTime())?d.toLocaleString([],{dateStyle:'medium',timeStyle:'short'}):'Flexible time';}
export function HomeV2({browse,setSport,db,me,openArticle}) {
  const reduced=useReducedMotion();
  const open=(s='All')=>{setSport(s);browse('Find Matches');};
  const casual=db.casualMatches||[];
  const [rankSport,setRankSport]=useState('All');
  const ranked=rankPlayers(casual.filter(m=>rankSport==='All'||m.sport===rankSport),db.users||[]).slice(0,5);
  const events=(db.tournaments||[]).filter(t=>t.status!=='completed').sort((a,b)=>String(a.startDate).localeCompare(String(b.startDate))).slice(0,3);
  const upcoming=casual.filter(m=>['Open','Ready'].includes(m.status)&&new Date(m.when).getTime()>=Date.now()).sort((a,b)=>new Date(a.when)-new Date(b.when)).slice(0,3);
  return <motion.main className="cp2 cp2-dashboard" key="home-v2" initial={reduced?false:{opacity:0,y:5}} animate={{opacity:1,y:0}}>
    <div className="cp2-section-head cp2-page-title"><div><h1>Home</h1><p className="cp2-welcome">Welcome, {me.name.split(" ")[0]}</p></div><button className="cp2-primary" onClick={()=>open()}>Find a match <ArrowRight size={18}/></button></div>
    <section className="cp2-modes">
      <article className="cp2-mode"><div className="cp2-mode-icon"><Zap size={29}/></div><h2>Quick Play</h2><p>One match between two teams or players.</p><button className="cp2-primary" onClick={()=>open()}>Find or create match <ArrowRight size={17}/></button></article>
      <article className="cp2-mode cp2-compete"><div className="cp2-mode-icon"><Trophy size={29}/></div><h2>Tournaments</h2><p>Register, manage fixtures and track results.</p><button className="cp2-primary" onClick={()=>browse('Tournaments')}>View tournaments <ArrowRight size={17}/></button></article>
    </section>
    <div className="cp2-section-head"><h2>Sports</h2></div><section className="cp2-sports">{SPORTS.map(s=><button key={s} className="cp2-sport" onClick={()=>open(s)}><SportPhoto sport={s}/><span className="cp2-sport-icon"><SportIcon sport={s}/></span><strong>{s}</strong><ArrowRight size={18}/></button>)}</section><section className="cp2-card hof-home-link"><div><Trophy size={25}/><h2>Online chess</h2><p>Play a friend, replay saved games or play on one device.</p></div><button className="cp2-primary" onClick={()=>browse("Online Chess")}>Play chess <ArrowRight size={17}/></button></section><p className="cp2-photo-credits">Editorial photos · <a href={publicAsset('/images/SPORT-CREDITS.md')} target="_blank" rel="noreferrer">Image credits</a></p>
    <div className="cp2-section-head"><h2>Quick Play overview</h2><button className="cp2-link" onClick={()=>open()}>All matches <ArrowRight size={16}/></button></div>
    <section className="cp2-stats">{[['Open',casual.filter(m=>m.status==='Open').length],['Accepted',casual.filter(m=>m.status==='Ready').length],['Completed',casual.filter(m=>m.status==='Completed').length]].map(([label,n])=><div key={label}><strong>{n}</strong><span>{label}</span></div>)}</section>
    <div className="cp2-section-head"><h2>Matches & competitions</h2></div>
    <section className="cp2-content-grid"><article className="cp2-card cp2-list-card"><div className="cp2-list-heading"><h3><CalendarDays size={21}/> Upcoming Quick Play</h3><button className="cp2-link" onClick={()=>open()}>View all <ArrowRight size={15}/></button></div>{upcoming.length?upcoming.map(m=><button className="cp2-list-row" key={m.id} onClick={()=>open(m.sport)}><span className="cp2-list-icon"><SportIcon sport={m.sport}/></span><span><strong>{m.home} vs {m.away||"Open spot"}</strong><small>{m.venue} · {dateLabel(m.when)}</small></span><ArrowRight size={17}/></button>):<p className="cp2-empty-line">No upcoming challenges.</p>}</article><article className="cp2-card cp2-list-card"><div className="cp2-list-heading"><h3><Trophy size={21}/> Tournaments</h3><button className="cp2-link" onClick={()=>browse("Tournaments")}>View all <ArrowRight size={15}/></button></div>{events.length?events.map(t=><button className="cp2-list-row" key={t.id} onClick={()=>browse("Tournaments")}><span className="cp2-list-icon"><SportIcon sport={t.sport}/></span><span><strong>{t.name}</strong><small>{t.sport} · {t.status.replaceAll("-"," ")}</small></span><ArrowRight size={17}/></button>):<p className="cp2-empty-line">No active tournaments.</p>}</article></section>
    <div className="cp2-section-head"><h2>Quick Play leaderboard</h2><div className="cp2-tabs" role="group" aria-label="Leaderboard sport">{["All",...SPORTS].map(s=><button key={s} className={rankSport===s?"selected":""} aria-pressed={rankSport===s} onClick={()=>setRankSport(s)}>{s}</button>)}</div></div><section className="cp2-card cp2-leaderboard">{ranked.length?<table><thead><tr><th>Rank</th><th>Captain / Player</th><th>Played</th><th>Wins</th><th>Draws</th></tr></thead><tbody>{ranked.map((p,i)=><tr key={p.id}><td>{i===0?<Medal size={21} className="cp2-gold-icon"/>:i+1}</td><td>{p.name}</td><td>{p.played}</td><td>{p.wins}</td><td>{p.draws}</td></tr>)}</tbody></table>:<div className="cp2-rank-empty"><Medal size={30}/><p>Confirmed match results will appear here.</p></div>}</section>
    <div className="cp2-section-head"><h2>My matches</h2><button className="cp2-link" onClick={()=>open()}>View all <ArrowRight size={16}/></button></div>
    <section className="cp2-match-grid">{casual.filter(m=>[m.hostId,m.opponentId].includes(me.id)).slice(0,4).map(m=><article className="cp2-card" key={m.id}><div className="cp2-match-meta"><span className="cp2-sport-label"><SportIcon sport={m.sport}/>{m.sport}</span><span>{m.status}</span></div><div className="cp2-versus"><strong>{m.home}</strong><small>VS</small><strong>{m.away||'Open spot'}</strong></div><div className="cp2-detail"><Clock3 size={15}/>{dateLabel(m.when)}</div>{m.result&&<p className="cp2-result">{outcome(m)} · {score(m,'home')} – {score(m,'away')}</p>}</article>)}</section>
    {!casual.some(m=>[m.hostId,m.opponentId].includes(me.id))&&<div className="cp2-card"><p>No matches yet.</p></div>}
    <section className="cp2-card hof-home-link"><div><Users size={26}/><h2>Compare Players</h2><p>Football, cricket and chess career statistics</p></div><button className="cp2-primary" onClick={()=>browse("Compare Players")}>Compare <ArrowRight size={17}/></button></section><section className="cp2-card hof-home-link"><div><Trophy size={26}/><h2>Hall of Fame</h2><p>World records and campus achievements</p></div><button className="cp2-primary" onClick={()=>browse("Hall of Fame")}>Explore records <ArrowRight size={17}/></button></section><div className="cp2-section-head"><h2>News</h2><button className="cp2-link" onClick={()=>browse('News')}>View news <ArrowRight size={16}/></button></div><section className="cp2-news-grid">{[sampleArticles.find(a=>a.sport==='Cricket'),sampleArticles.find(a=>a.sport==='Football'),sampleArticles.find(a=>a.sport==='Chess')].filter(Boolean).map(a=><button key={a.id} className="cp2-news-card" onClick={()=>openArticle(a.id)}><img src={publicAsset(a.image)} alt={a.imageAlt} loading="lazy"/><span className="cp2-news-card-copy"><small>{a.sport} · Sample article</small><strong>{a.title}</strong></span></button>)}</section>
  </motion.main>;
}

export function QuickPlay({me,matches,update,sport,setSport,browse,say}) {
  const reduced=useReducedMotion();
  const [draft,setDraft]=useState(()=>defaults(SPORTS.includes(sport)?sport:'Cricket'));
  const [creating,setCreating]=useState(false),[mine,setMine]=useState(false),[joining,setJoining]=useState(null),[opponent,setOpponent]=useState(''),[editing,setEditing]=useState(null),[result,setResult]=useState(emptyScore),[error,setError]=useState('');
  const guest=me.role==='Guest';
  const participant=m=>[m.hostId,m.opponentId].includes(me.id);
  const patch=(id,fn)=>update('casualMatches',(old=[])=>old.map(m=>m.id===id?fn(m):m));
  const field=(key,value)=>setDraft(d=>({...d,[key]:value}));
  function create(e) {
    e.preventDefault();setError('');
    if(guest)return;
    const home=draft.sport==='Chess'?me.name:draft.team.trim();
    if(!home||!draft.venue.trim()||!draft.when||!Number.isFinite(new Date(draft.when).getTime())||new Date(draft.when).getTime()<Date.now()){setError('Enter your team, venue and a future start time.');return;}
    const m={...draft,id:crypto.randomUUID(),home,away:'',hostId:me.id,status:'Open',venue:draft.venue.trim(),createdAt:new Date().toISOString()};
    update('casualMatches',(old=[])=>[m,...old]);setCreating(false);setSport('All');setMine(false);setDraft(defaults(draft.sport));say('Challenge created.');
  }
  function accept(m) {
    const away=m.sport==='Chess'?me.name:opponent.trim();
    if(guest||!away||away.toLowerCase()===m.home.toLowerCase()){setError('Enter a different opponent name.');return;}
    patch(m.id,x=>x.status==='Open'&&x.hostId!==me.id?{...x,away,opponentId:me.id,status:'Ready'}:x);
    setJoining(null);setOpponent('');setError('');say('Challenge accepted.');
  }
  function submit(m,e) {
    e.preventDefault();
    try {const r=resultFor(m,result);patch(m.id,x=>x.status==='Ready'&&participant(x)?{...x,result:r,submittedBy:me.id,status:'Awaiting confirmation'}:x);setEditing(null);setError('');say('Result sent for opponent confirmation.');}
    catch(err){setError(err.message);}
  }
  function confirm(m,approved) {
    patch(m.id,x=>x.status==='Awaiting confirmation'&&participant(x)&&x.submittedBy!==me.id?{...x,status:approved?'Completed':'Ready',result:approved?x.result:null,submittedBy:approved?x.submittedBy:null}:x);
    say(approved?'Result confirmed.':'Result returned for correction.');
  }
  const visible=matches.filter(m=>(sport==='All'||m.sport===sport)&&(!mine||participant(m)));
  return <motion.main key="quick-v2" className="cp2" initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}}>
    <div className="cp2-section-head cp2-page-title"><div><h1>Quick Play</h1></div><button className="cp2-primary" disabled={guest} onClick={()=>{setCreating(v=>!v);setError('');setDraft(defaults(SPORTS.includes(sport)?sport:'Cricket'));}}><Plus size={20}/>{creating?'Close':'Create challenge'}</button></div>
    <p className="cp2-demo"><ShieldCheck size={16}/> Demo mode · Data stored on this browser.</p>
    {guest&&<p>Choose a demo player in the header to participate.</p>}
    {creating&&!guest&&<form className="cp2-form cp2-card" onSubmit={create}>
      <h2>Create a match</h2><div className="cp2-fields">
      <label>Sport<select value={draft.sport} onChange={e=>setDraft(defaults(e.target.value))}>{SPORTS.map(s=><option key={s}>{s}</option>)}</select></label>
      {draft.sport!=='Chess'&&<label>Your team<input required maxLength={60} value={draft.team} onChange={e=>field('team',e.target.value)} placeholder="Team name"/></label>}
      <label>Venue<input required maxLength={100} value={draft.venue} onChange={e=>field('venue',e.target.value)} placeholder="Campus ground / hall"/></label>
      <label>Start time<input required type="datetime-local" value={draft.when} onChange={e=>field('when',e.target.value)}/></label>
      {draft.sport!=='Chess'&&<label>Players per side<select value={draft.size} onChange={e=>field('size',Number(e.target.value))}>{[2,3,4,5,6,7,8,9,10,11].map(n=><option key={n} value={n}>{n} v {n}</option>)}</select></label>}
      <label>{draft.sport==='Cricket'?'Overs per side':draft.sport==='Chess'?'Minutes per player':'Match duration'}<select value={draft.length} onChange={e=>field('length',Number(e.target.value))}>{(draft.sport==='Cricket'?[2,3,5,6,10,15,20]:[5,10,15,20,30,45,60]).map(n=><option key={n} value={n}>{n} {draft.sport==='Cricket'?'overs':'min'}</option>)}</select></label>
      </div><button className="cp2-primary">Publish challenge <ArrowRight size={17}/></button>
    </form>}
    <div className="cp2-filter"><div className="cp2-tabs" role="group" aria-label="Filter by sport">{['All',...SPORTS].map(s=><button key={s} aria-pressed={sport===s} className={sport===s?'selected':''} onClick={()=>setSport(s)}>{s}</button>)}</div><label className="cp2-check"><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)}/> My matches</label></div>
    {["All","Chess"].includes(sport)&&<section className="cp2-card hof-home-link"><div><h2>Online chess</h2><p>Invite a friend or view saved games.</p></div><button className="cp2-primary" onClick={()=>browse("Online Chess")}>Play online <ArrowRight size={17}/></button></section>}
    {error&&<p className="cp2-error" role="alert">{error}</p>}
    {visible.length===0&&<div className="cp2-card cp2-empty"><Zap size={30}/><h2>No matches yet</h2><p>Create a challenge or change filters.</p>{!guest&&<button className="cp2-primary" onClick={()=>setCreating(true)}>Create a match</button>}</div>}
    <section className="cp2-match-grid">{visible.map(m=><motion.article layout={!reduced} className="cp2-card" key={m.id}>
      <div className="cp2-match-meta"><span className="cp2-sport-label"><SportIcon sport={m.sport}/>{m.sport}</span><span className="cp2-status">{m.status}</span></div>
      <div className="cp2-versus"><div><strong>{m.home}</strong>{m.result&&<b>{score(m,'home')}</b>}</div><small>VS</small><div><strong>{m.away||'Open spot'}</strong>{m.result&&<b>{score(m,'away')}</b>}</div></div>
      {m.result&&<p className="cp2-result">{outcome(m)} {m.status==='Completed'?'· Confirmed':'· Pending confirmation'}</p>}
      <div className="cp2-detail"><MapPin size={15}/>{m.venue}</div><div className="cp2-detail"><Clock3 size={15}/>{dateLabel(m.when)} · {format(m)}</div>
      <div className="cp2-card-actions">
      {m.status==='Open'&&!guest&&m.hostId!==me.id&&(joining===m.id?<div className="cp2-inline">{m.sport!=='Chess'&&<input aria-label="Opponent team" maxLength={60} value={opponent} onChange={e=>setOpponent(e.target.value)} placeholder="Your team name"/>}<button className="cp2-primary" onClick={()=>accept(m)}>Confirm opponent</button><button className="cp2-secondary" onClick={()=>setJoining(null)}>Back</button></div>:<button className="cp2-primary" onClick={()=>{setJoining(m.id);setOpponent('');setError('');}}>Accept challenge</button>)}
      {m.status==='Open'&&m.hostId===me.id&&<button className="cp2-secondary" onClick={()=>patch(m.id,x=>x.status==='Open'&&x.hostId===me.id?{...x,status:'Cancelled'}:x)}>Cancel challenge</button>}
      {m.status==='Ready'&&participant(m)&&(editing===m.id?<form className="cp2-inline" onSubmit={e=>submit(m,e)}>
        {m.sport==='Chess'?<label>Result<select value={result.chess} onChange={e=>setResult(r=>({...r,chess:e.target.value}))}><option value="home">{m.home} wins</option><option value="away">{m.away} wins</option><option value="draw">Draw</option></select></label>:<div className="cp2-fields">{['home','away'].map(side=><React.Fragment key={side}><label>{m[side]} {m.sport==='Cricket'?'runs':'goals'}<input required type="number" min="0" max="9999" value={result[side]} onChange={e=>setResult(r=>({...r,[side]:e.target.value}))}/></label>{m.sport==='Cricket'&&<label>{m[side]} wickets lost<input required type="number" min="0" max={m.size-1} value={result[side+'Wickets']} onChange={e=>setResult(r=>({...r,[side+'Wickets']:e.target.value}))}/></label>}</React.Fragment>)}</div>}
        <button className="cp2-primary">Submit result</button><button type="button" className="cp2-secondary" onClick={()=>{setEditing(null);setError('');}}>Cancel</button></form>:<button className="cp2-primary" onClick={()=>{setEditing(m.id);setResult(emptyScore);setError('');}}>Record result</button>)}
      {m.status==='Awaiting confirmation'&&participant(m)&&(m.submittedBy===me.id?<p>Waiting for your opponent.</p>:<><button className="cp2-primary" onClick={()=>confirm(m,true)}>Confirm result</button><button className="cp2-secondary" onClick={()=>confirm(m,false)}>Request correction</button></>)}
      </div>
    </motion.article>)}</section>
    <div className="cp2-footer"><button className="cp2-link" onClick={()=>browse('Legacy Matches')}>Pickup matches</button><button className="cp2-link" onClick={()=>browse('Tournaments')}>Tournaments <ArrowRight size={15}/></button></div>
  </motion.main>;
}
