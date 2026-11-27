import React,{useState} from 'react';
import { Swords, ArrowUpRight } from 'lucide-react';
import { recordsFor } from './chess-head-to-head-data.js';
export function ChessHeadToHead({a,b}){
 const rows=recordsFor(a.name,b.name);
 const [selected,setSelected]=useState(0);
 const r=rows[selected]||rows[0];
 if(!r)return <section className="h2h-panel"><header><Swords size={23}/><h2>Head-to-head</h2></header><p>No verified direct-game record in this dataset for {a.name} and {b.name}. This does not mean they have never played.</p><a href="https://www.365chess.com/" target="_blank" rel="noreferrer">Search game archive <ArrowUpRight size={15}/></a></section>;
 const total=r.w+r.d+r.l,pct=n=>(100*n/total).toFixed(1),score=(n)=>(100*(n+r.d/2)/total).toFixed(1);
 return <section className="h2h-panel"><header><Swords size={23}/><h2>Head-to-head</h2><span>{total} games</span></header><div className="h2h-scope" role="group" aria-label="Record scope">{rows.map((x,i)=><button key={x.scope} className={i===selected?'active':''} aria-pressed={i===selected} onClick={()=>setSelected(i)}>{x.scope}</button>)}</div><p>{r.date} · {r.note}</p>
 <div className="h2h-names"><strong>{a.name}</strong><span>vs</span><strong>{b.name}</strong></div>
 <div className="h2h-result"><div><strong className={r.w>r.l?'h2h-gold':''}>{r.w}</strong><span>Wins</span></div><div><strong>{r.d}</strong><span>Draws</span></div><div><strong className={r.l>r.w?'h2h-gold':''}>{r.l}</strong><span>Wins</span></div></div>
 <div className="h2h-bar" role="img" aria-label={a.name+' wins '+pct(r.w)+'%, draws '+pct(r.d)+'%, '+b.name+' wins '+pct(r.l)+'%'}>{[[r.w,'left'],[r.d,'draw'],[r.l,'right']].map(([v,k])=><div key={k} className={k} style={{width:pct(v)+'%'}}/>)}</div>
 <div className="h2h-split"><span>{pct(r.w)}% wins</span><span>{pct(r.d)}% draws</span><span>{pct(r.l)}% wins</span></div>
 <div className="h2h-detail"><div><strong>{r.l}</strong><span>{a.name} losses</span></div><div><strong>{r.w}</strong><span>{b.name} losses</span></div><div><strong>{score(r.w)}%</strong><span>{a.name} score</span></div><div><strong>{score(r.l)}%</strong><span>{b.name} score</span></div></div>
 <footer><small>Score = wins + half the draws, divided by games. Scopes are separate, not additive. Not live career totals.</small><a href={r.url} target="_blank" rel="noreferrer">View record source <ArrowUpRight size={15}/></a></footer></section>
}
