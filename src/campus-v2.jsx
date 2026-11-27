import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock3, MapPin, Trophy, Zap, Plus, ShieldCheck, Newspaper } from 'lucide-react';
import './campus-v2.css';

const SPORTS = ['Cricket', 'Football', 'Chess'];
const ICONS = { Cricket:'🏏', Football:'⚽', Chess:'♞' };
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
export function HomeV2({browse,setSport,db,me}) {
  const reduced=useReducedMotion();
  const open=(s='All')=>{setSport(s);browse('Find Matches');};
  const casual=db.casualMatches||[];
  return <motion.main className="cp2" key="home-v2" initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <section className="cp2-hero">
      <div className="cp2-hero-copy"><span className="cp2-kicker">CAMPUSPLAY / THE STUDENT SPORTS NETWORK</span>
      <h1>Less waiting.<br/><em>More playing.</em></h1><p>Make the most of your college break. Challenge an opponent, play on campus, or compete for the championship.</p>
      <div className="cp2-actions"><button className="cp2-primary" onClick={()=>open()}>Find a match <ArrowRight size={19}/></button><button className="cp2-secondary" onClick={()=>browse('Tournaments')}>Explore tournaments</button></div></div>
      <div className="cp2-hero-art" aria-hidden="true"><div className="cp2-orbit"><Zap size={104} strokeWidth={1.2}/></div><span>01 / PLAY YOUR GAME</span></div>
    </section>
    <div className="cp2-section-head"><div><span className="cp2-kicker">TWO WAYS TO PLAY</span><h2>What's your game today?</h2></div><span className="cp2-muted">Hi, {me.name.split(' ')[0]}</span></div>
    <section className="cp2-modes">
      <motion.article whileHover={reduced?{}:{y:-4}} className="cp2-mode"><Zap size={30}/><span className="cp2-kicker">QUICK PLAY</span><h3>One match. One opponent.</h3><p>No leagues or series. Get a game going between classes.</p><button className="cp2-primary" onClick={()=>open()}>Start playing <ArrowRight size={17}/></button></motion.article>
      <motion.article whileHover={reduced?{}:{y:-4}} className="cp2-mode cp2-compete"><Trophy size={30}/><span className="cp2-kicker">COMPETITIVE PLAY</span><h3>Earn your place at the top.</h3><p>Register for organized competitions and follow fixtures, standings and results.</p><button className="cp2-secondary" onClick={()=>browse('Tournaments')}>View competitions <ArrowRight size={17}/></button></motion.article>
    </section>
    <div className="cp2-section-head"><h2>Choose your sport</h2></div><section className="cp2-sports">{SPORTS.map(s=><button key={s} className="cp2-sport" onClick={()=>open(s)}><span>{ICONS[s]}</span><strong>{s}</strong><ArrowRight size={18}/></button>)}</section>
    <div className="cp2-section-head"><h2>Quick Play activity</h2><button className="cp2-link" onClick={()=>open()}>View matches <ArrowRight size={16}/></button></div>
    <section className="cp2-stats">{[['Open challenges',casual.filter(m=>m.status==='Open').length],['Ready to play',casual.filter(m=>m.status==='Ready').length],['Confirmed results',casual.filter(m=>m.status==='Completed').length]].map(([label,n])=><div key={label}><strong>{n}</strong><span>{label}</span></div>)}</section>
    <section className="cp2-news-teaser"><Newspaper size={28}/><div><h2>Beyond the game</h2><p>Explore the CampusPlay newsroom and sports stories.</p></div><button className="cp2-secondary" onClick={()=>browse('News')}>Read stories <ArrowRight size={17}/></button></section>
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
    <div className="cp2-section-head cp2-page-title"><div><span className="cp2-kicker">CASUAL MATCHMAKING</span><h1>Quick Play.</h1><p>Two sides. One game. No tournament required.</p></div><button className="cp2-primary" disabled={guest} onClick={()=>{setCreating(v=>!v);setError('');setDraft(defaults(SPORTS.includes(sport)?sport:'Cricket'));}}><Plus size={20}/>{creating?'Close':'Create challenge'}</button></div>
    <p className="cp2-demo"><ShieldCheck size={16}/> Demo profiles and matches are stored on this browser only. Switch profile to test both sides.</p>
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
    {error&&<p className="cp2-error" role="alert">{error}</p>}
    {visible.length===0&&<div className="cp2-card cp2-empty"><Zap size={30}/><h2>No matches yet</h2><p>Start a challenge or change your filters.</p>{!guest&&<button className="cp2-primary" onClick={()=>setCreating(true)}>Create a match</button>}</div>}
    <section className="cp2-match-grid">{visible.map(m=><motion.article layout={!reduced} className="cp2-card" key={m.id}>
      <div className="cp2-match-meta"><span>{ICONS[m.sport]} {m.sport}</span><span className="cp2-status">{m.status}</span></div>
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
    <div className="cp2-footer"><button className="cp2-link" onClick={()=>browse('Legacy Matches')}>Previous pickup matches</button><button className="cp2-link" onClick={()=>browse('Tournaments')}>Looking for a tournament? <ArrowRight size={15}/></button></div>
  </motion.main>;
}
