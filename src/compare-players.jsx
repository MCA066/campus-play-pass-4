import React,{useEffect,useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {ArrowLeftRight,ArrowUpRight,UserRound,BarChart3,Trophy} from 'lucide-react';
import {players,groups} from './compare-data.js';
import {publicAsset} from './assets.js';
import './compare-players.css';
import { ChessHeadToHead } from './chess-head-to-head.jsx';
import { FootballHeadToHead } from './football-head-to-head.jsx';

const sports=Object.keys(players), defaults={Football:[0,1],Cricket:[0,1],Chess:[0,1]};
const cache=new Map();
const wikiURL=(name)=>'https://en.wikipedia.org/wiki/'+encodeURIComponent(name.replaceAll(' ','_'));
const api=(base,params)=>base+'?'+new URLSearchParams({...params,format:'json',origin:'*'});
function strip(s){return String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').trim();}
async function portrait(name){
 if(cache.has(name))return cache.get(name);
 const p=fetch(api('https://en.wikipedia.org/w/api.php',{action:'query',prop:'pageimages',titles:name,redirects:'1',pithumbsize:'1000',pilicense:'free'})).then(r=>{if(!r.ok)throw Error('Image unavailable');return r.json()}).then(async json=>{
 const page=Object.values(json.query?.pages||{})[0];if(!page?.pageimage)return null;
 const file='File:'+page.pageimage;
 const info=await fetch(api('https://commons.wikimedia.org/w/api.php',{action:'query',prop:'imageinfo',titles:file,iiprop:'url|extmetadata',iiurlwidth:'1000'})).then(r=>r.json());
 const image=Object.values(info.query?.pages||{})[0]?.imageinfo?.[0];const meta=image?.extmetadata;
 if(!image?.thumburl||!meta?.LicenseShortName?.value||!meta?.Artist?.value)return null;
 return {url:image.thumburl,credit:strip(meta.Artist.value),license:strip(meta.LicenseShortName.value),source:image.descriptionurl,licenseURL:meta.LicenseUrl?.value};
 }).catch(()=>null);cache.set(name,p);p.then(result=>{if(!result&&cache.get(name)===p)cache.delete(name)});return p;
}
function PlayerImage({p}){
 const local=p.local?{url:publicAsset(p.local),source:publicAsset('/images/ATTRIBUTION.md'),credit:'Repository image credits'}:null;
 const [image,setImage]=useState(local),[failed,setFailed]=useState(false),[loading,setLoading]=useState(!local),[retryRemote,setRetryRemote]=useState(false);
 useEffect(()=>{let alive=true;if(!local||retryRemote){setLoading(true);portrait(p.wiki).then(i=>{if(alive){setImage(i);setFailed(false);setLoading(false)}})}return()=>{alive=false}},[p.name,retryRemote]);
 const fail=()=>{if(local&&!retryRemote){setImage(null);setRetryRemote(true);setLoading(true)}else{setFailed(true);setLoading(false)}};
 const ready=image&&!failed;
 return <><div className="cmp-photo cp-portrait-frame" aria-busy={loading}>{ready?<img src={image.url} alt={p.name} decoding="async" onError={fail}/>:<div className="cmp-fallback"><UserRound size={42}/><strong>{p.name.split(' ').map(n=>n[0]).slice(0,3).join('')}</strong><span>{loading?'Loading portrait':'Portrait unavailable'}</span></div>}</div><div className="cmp-credit">{ready?<><a href={image.source||wikiURL(p.wiki)} target="_blank" rel="noreferrer" title={image.credit||'Image source'}>{image.credit||"Photo credit"}</a>{image.license&&<> · {image.licenseURL?<a href={image.licenseURL} target="_blank" rel="noreferrer">{image.license}</a>:image.license}</>}</>:<a href={wikiURL(p.wiki)} target="_blank" rel="noreferrer">Player profile</a>}</div></>;
}
function PlayerCard({p,side,options,onChange,other}){return <article className="cmp-player"><label>Player {side}<select value={p.name} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x.name} disabled={x.name===other.name}>{x.name}</option>)}</select></label><PlayerImage key={p.name} p={p}/><div className="cmp-identity"><h2>{p.name}</h2><p>{p.country} · {p.role}</p><span className="cmp-achievement"><Trophy size={17}/>{p.highlight}</span><small>{p.year}</small><div className="cmp-sources">{p.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.name}<ArrowUpRight size={12}/></a>)}</div></div></article>}

const format=(n,k)=>n==null?'—':k==='worldChampion'?(n?'Yes':'No'):n.toLocaleString('en-US',{maximumFractionDigits:2,useGrouping:k!=='firstTitle'});
const neutral=new Set(['caps','matches','uclMatches','uclMinutes','conceded','uclLeft','uclRight','uclHeaders','uclPenalties','firstTitle','testMatches','t20Matches','careerApps','careerPenalties']);
const lower=new Set(['economy','uclMinGoal','concededRate','peakGap','careerMinGoal']);
function leaders(k,a,b,compare){const both=Number.isFinite(a)&&Number.isFinite(b);return {both,a:both&&compare&&!neutral.has(k)&&(lower.has(k)?a<b:a>b),b:both&&compare&&!neutral.has(k)&&(lower.has(k)?b<a:b>a)}}
function MetricRow({label,a,b,k,reduced,compare}){
 const l=leaders(k,a,b,compare),max=l.both?Math.max(a,b,0.01):1,bar=l.both&&!['firstTitle','worldChampion'].includes(k);
 return <div className="cmp-metric"><div className="cmp-metric-side"><strong className={l.a?'cmp-lead':''}>{format(a,k)}</strong>{bar&&<div className="cmp-meter"><motion.i initial={reduced?false:{width:0}} animate={{width:Math.max(0,a/max*100)+'%'}} className={l.a?'cmp-leading':''}/></div>}</div><div className="cmp-label">{label}{lower.has(k)&&<small>Lower is better</small>}</div><div className="cmp-metric-side"><strong className={l.b?'cmp-lead':''}>{format(b,k)}</strong>{bar&&<div className="cmp-meter"><motion.i initial={reduced?false:{width:0}} animate={{width:Math.max(0,b/max*100)+'%'}} className={l.b?'cmp-leading':''}/></div>}</div></div>
}
function ComparisonTable({rows,a,b,compare}){return <div className="cmp-table-wrap"><table className="cmp-data-table"><thead><tr><th>Statistic</th><th>{a.name}</th><th>{b.name}</th><th>Leader</th></tr></thead><tbody>{rows.map(([k,label])=>{const x=a.stats[k],y=b.stats[k],l=leaders(k,x,y,compare);return <tr key={k}><th scope="row">{label}</th><td className={l.a?'cmp-lead':''}>{format(x,k)}</td><td className={l.b?'cmp-lead':''}>{format(y,k)}</td><td>{l.a?a.name:l.b?b.name:l.both&&compare&&!neutral.has(k)&&x===y?'Tied':'—'}</td></tr>})}</tbody></table></div>}
export function ComparePlayers(){
 const [sport,setSport]=useState('Football'),[pair,setPair]=useState(defaults.Football),[onlyCommon,setOnlyCommon]=useState(false),[section,setSection]=useState('All'),[view,setView]=useState('Bars');const reduced=useReducedMotion(),list=players[sport],a=list[pair[0]],b=list[pair[1]];
 const selectSport=s=>{setSport(s);setPair(defaults[s]);setOnlyCommon(false);setSection('All')};
 const pick=(side,name)=>setPair(old=>old.map((x,i)=>i===side?list.findIndex(p=>p.name===name):x));
 const presets={Football:[[0,1],[9,10],[3,5],[7,8]],Cricket:[[0,1],[2,3],[7,8],[11,12]],Chess:[[0,1],[0,2],[6,9],[6,4],[7,6],[4,14],[0,11]]}[sport];
 const keeper=sport==='Football'&&[a,b].some(p=>p.role==='Goalkeeper'),crossRole=keeper&&a.role!==b.role||sport==='Cricket'&&a.role!==b.role&&[a,b].some(p=>p.role==='Bowler');
 const relevant=groups[sport].filter(g=>!g.keeper||keeper);
 const common=relevant.flatMap(g=>g.rows).filter(([k])=>Number.isFinite(a.stats[k])&&Number.isFinite(b.stats[k])).length;
 const displayed=relevant.filter(g=>section==='All'||g.title===section);
 const featured=sport==='Football'?(keeper?['caps','cleanSheets','concededRate']:Number.isFinite(a.stats.careerGoals)&&Number.isFinite(b.stats.careerGoals)?['careerGoals','careerAssists','careerGA']:['goals','uclGoals','uclAssists']):sport==='Cricket'?['runs','avg','hundreds']:['peak','standard','blitz'];
 const labels=Object.fromEntries(relevant.flatMap(g=>g.rows));
 return <motion.main className="page-wrap cmp-page" initial={reduced?false:{opacity:0,y:6}} animate={{opacity:1,y:0}}>
 <div className="cmp-heading"><BarChart3 size={32}/><div><h1>Compare Players</h1><p>{Object.values(players).flat().length} players · Career analytics</p></div></div>
 <div className="cmp-tabs" role="group" aria-label="Sport">{sports.map(s=><button key={s} className={sport===s?'active':''} aria-pressed={sport===s} onClick={()=>selectSport(s)}>{s} <span>{players[s].length}</span></button>)}</div>
 <div className="cmp-presets"><strong>Popular matchups</strong>{presets.map(([x,y])=><button key={x+'-'+y} onClick={()=>{setPair([x,y]);setSection('All')}}>{list[x].name} vs {list[y].name}</button>)}</div>
 <div className="cmp-duel"><PlayerCard p={a} side="1" options={list} other={b} onChange={n=>{pick(0,n);setSection('All')}}/><div className="cmp-vs"><span>VS</span><button aria-label="Swap players" title="Swap players" onClick={()=>setPair(([x,y])=>[y,x])}><ArrowLeftRight size={21}/></button></div><PlayerCard p={b} side="2" options={list} other={a} onChange={n=>{pick(1,n);setSection('All')}}/></div>
 {sport==='Chess'&&<ChessHeadToHead key={a.name+"|"+b.name} a={a} b={b}/>}
 {sport==='Football'&&<FootballHeadToHead a={a} b={b}/>}
 <section className="cmp-overview"><div className="cmp-section-title"><h2>At a glance</h2><span>{common} shared statistics</span></div><div className="cmp-kpis">{featured.map(k=><article key={k}><small>{labels[k]}</small><div><strong>{format(a.stats[k],k)}</strong><span>vs</span><strong>{format(b.stats[k],k)}</strong></div><footer><span>{a.name}</span><span>{b.name}</span></footer></article>)}</div></section>
 <section className="cmp-analysis"><div className="cmp-section-title"><h2>Career breakdown</h2><label><input type="checkbox" checked={onlyCommon} onChange={e=>setOnlyCommon(e.target.checked)}/> Shared stats only</label></div>
 <div className="cmp-view-switch" role="group" aria-label="Statistics layout">{['Bars','Table'].map(v=><button key={v} className={view===v?'active':''} aria-pressed={view===v} onClick={()=>setView(v)}>{v}</button>)}</div><div className="cmp-section-nav" role="group" aria-label="Stat category">{['All',...relevant.map(g=>g.title)].map(s=><button key={s} className={section===s?'active':''} aria-pressed={section===s} onClick={()=>setSection(s)}>{s}</button>)}</div>
 <div className="cmp-column-head"><strong>{a.name}</strong><span>METRIC</span><strong>{b.name}</strong></div>
 {crossRole&&<p className="cmp-note">Different playing roles. Scoring or batting totals do not establish defensive, goalkeeping or bowling ability.</p>}
 <div className="cmp-groups">{displayed.map(g=>{const rows=g.rows.filter(([k])=>!onlyCommon||Number.isFinite(a.stats[k])&&Number.isFinite(b.stats[k]));return <section className="cmp-stat-group" key={g.title}><header><h3>{g.title}</h3><span>{rows.length} metrics</span></header><p>{g.note}</p>{rows.length?(view==='Table'?<ComparisonTable rows={rows} a={a} b={b} compare={!crossRole}/>:rows.map(([k,label])=><MetricRow key={k} k={k} label={label} a={a.stats[k]} b={b.stats[k]} reduced={reduced} compare={!crossRole}/>)):<div className="cmp-empty">No shared statistics available.</div>}</section>})}</div></section>
 <p className="cmp-note">Gold indicates a leading metric where comparison is meaningful. Dates and coverage vary; dashes indicate unavailable data. Champions League totals are not entire club careers. No overall winner is inferred.</p>
 </motion.main>
}
