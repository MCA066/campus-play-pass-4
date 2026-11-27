import React,{useEffect,useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {ArrowLeftRight,ArrowUpRight,UserRound,BarChart3,Trophy} from 'lucide-react';
import {players,metricSets} from './compare-data.js';
import {publicAsset} from './assets.js';
import './compare-players.css';

const sports=Object.keys(players), defaults={Football:[0,1],Cricket:[0,1],Chess:[0,1]};
const cache=new Map();
const wikiURL=(name)=>'https://en.wikipedia.org/wiki/'+encodeURIComponent(name.replaceAll(' ','_'));
const api=(base,params)=>base+'?'+new URLSearchParams({...params,format:'json',origin:'*'});
function strip(s){return String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').trim();}
async function portrait(name){
 if(cache.has(name))return cache.get(name);
 const p=fetch(api('https://en.wikipedia.org/w/api.php',{action:'query',prop:'pageimages',titles:name,redirects:'1',pithumbsize:'900',pilicense:'free'})).then(r=>{if(!r.ok)throw Error('Image unavailable');return r.json()}).then(async json=>{
 const page=Object.values(json.query?.pages||{})[0];if(!page?.pageimage)return null;
 const file='File:'+page.pageimage;
 const info=await fetch(api('https://commons.wikimedia.org/w/api.php',{action:'query',prop:'imageinfo',titles:file,iiprop:'url|extmetadata',iiurlwidth:'900'})).then(r=>r.json());
 const image=Object.values(info.query?.pages||{})[0]?.imageinfo?.[0];const meta=image?.extmetadata;
 if(!image?.thumburl||!meta?.LicenseShortName?.value||!meta?.Artist?.value)return null;
 return {url:image.thumburl,credit:strip(meta.Artist.value),license:strip(meta.LicenseShortName.value),source:image.descriptionurl,licenseURL:meta.LicenseUrl?.value};
 }).catch(()=>null);cache.set(name,p);return p;
}
function PlayerImage({p}){const [image,setImage]=useState(null),[failed,setFailed]=useState(false),[loading,setLoading]=useState(!p.local);
 useEffect(()=>{let alive=true;if(p.local){setImage({url:publicAsset(p.local),source:publicAsset('/images/ATTRIBUTION.md'),credit:'Repository image credits'});setLoading(false);}else{portrait(p.wiki).then(i=>{if(alive){setImage(i);setLoading(false)}})}return()=>{alive=false}},[p]);
 return <><div className="cmp-photo">{image&&!failed?<img src={image.url} alt={p.name} onError={()=>setFailed(true)}/>:<div className="cmp-fallback"><UserRound size={48}/><span>{loading?'Loading portrait':'Portrait unavailable'}</span></div>}</div>{image&&!failed&&<div className="cmp-credit"><a href={image.source||wikiURL(p.wiki)} target="_blank" rel="noreferrer">{image.credit||'Image source'}</a>{image.license&&<> · {image.licenseURL?<a href={image.licenseURL} target="_blank" rel="noreferrer">{image.license}</a>:image.license}</>} · cropped</div>}</>;
}
function PlayerCard({p,side,options,onChange,other}){return <article className="cmp-player"><label>Player {side}<select value={p.name} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x.name} disabled={x.name===other.name}>{x.name}</option>)}</select></label><PlayerImage key={p.name} p={p}/><div className="cmp-identity"><h2>{p.name}</h2><p>{p.country} · {p.role}</p><span className="cmp-achievement"><Trophy size={17}/>{p.highlight}</span><small>{p.year}</small><div className="cmp-sources">{p.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.name}<ArrowUpRight size={12}/></a>)}</div></div></article>}
const format=n=>n==null?'—':n.toLocaleString('en-US',{maximumFractionDigits:2});
function MetricRow({label,a,b,metric,reduced,compare}){const both=Number.isFinite(a)&&Number.isFinite(b),max=both?Math.max(a,b,1):1,low=metric==='economy';const leadA=both&&compare&&(low?a<b:a>b),leadB=both&&compare&&(low?b<a:b>a);return <div className="cmp-metric"><div className="cmp-metric-line"><strong className={leadA?'cmp-lead':''}>{format(a)}</strong><span>{label}</span><strong className={leadB?'cmp-lead':''}>{format(b)}</strong></div>{both&&<div className="cmp-bars"><div><motion.i initial={reduced?false:{width:0}} animate={{width:(a/max*100)+'%'}} className={leadA?'cmp-leading':''}/></div><div><motion.i initial={reduced?false:{width:0}} animate={{width:(b/max*100)+'%'}} className={leadB?'cmp-leading':''}/></div></div>}</div>}
export function ComparePlayers(){const [sport,setSport]=useState('Football'),[pair,setPair]=useState(defaults.Football),[onlyCommon,setOnlyCommon]=useState(false);const reduced=useReducedMotion(),list=players[sport],a=list[pair[0]],b=list[pair[1]];
 const selectSport=s=>{setSport(s);setPair(defaults[s]);setOnlyCommon(false)};
 const pick=(side,name)=>setPair(old=>old.map((x,i)=>i===side?list.findIndex(p=>p.name===name):x));
 const presets={Football:[[0,1],[9,10],[3,5],[7,8]],Cricket:[[0,1],[2,3],[7,8],[11,12]],Chess:[[0,1],[0,2],[6,4],[7,6]]}[sport];
 const crossRole=sport==='Football'&&(a.role==='Goalkeeper'||b.role==='Goalkeeper')||sport==='Cricket'&&(a.role==='Bowler'||b.role==='Bowler');
 return <motion.main className="page-wrap cmp-page" initial={reduced?false:{opacity:0,y:6}} animate={{opacity:1,y:0}}><div className="cmp-heading"><BarChart3 size={32}/><div><h1>Compare Players</h1><p>{Object.values(players).flat().length} players · Select any two from the same sport</p></div></div><div className="cmp-tabs" role="group" aria-label="Sport">{sports.map(s=><button key={s} className={sport===s?'active':''} aria-pressed={sport===s} onClick={()=>selectSport(s)}>{s} <span>{players[s].length}</span></button>)}</div><div className="cmp-presets"><strong>Quick comparisons</strong>{presets.map(([x,y])=><button key={x+'-'+y} onClick={()=>setPair([x,y])}>{list[x].name} vs {list[y].name}</button>)}</div><div className="cmp-duel"><PlayerCard p={a} side="1" options={list} other={b} onChange={n=>pick(0,n)}/><div className="cmp-vs"><span>VS</span><button aria-label="Swap players" title="Swap players" onClick={()=>setPair(([x,y])=>[y,x])}><ArrowLeftRight size={21}/></button></div><PlayerCard p={b} side="2" options={list} other={a} onChange={n=>pick(1,n)}/></div><section className="cmp-stats"><header><div><h2>{sport==='Cricket'?'ODI career statistics':sport==='Football'?'International career statistics':'FIDE ratings'}</h2><p>Gold highlights the higher figure (lower for bowling economy). Not an overall player rating.</p></div><label><input type="checkbox" checked={onlyCommon} onChange={e=>setOnlyCommon(e.target.checked)}/> Common stats only</label></header>{crossRole&&<p className="cmp-note">Different playing roles: batting or scoring totals alone do not measure goalkeeping, defending or bowling ability.</p>}{metricSets[sport].filter(([k])=>!onlyCommon||Number.isFinite(a.stats[k])&&Number.isFinite(b.stats[k])).map(([k,label])=><MetricRow key={k} label={label} a={a.stats[k]} b={b.stats[k]} metric={k} reduced={reduced} compare={!(crossRole&&['goals','rate','runs','avg','strike','hundreds','fifties','high'].includes(k))}/>)}</section><p className="cmp-note">Figures are sourced snapshots with different coverage dates, not live totals. A dash means unavailable in this dataset. Football excludes club goals; ODI statistics exclude Tests, T20Is and IPL. Chess peak ratings are not era-adjusted. No head-to-head result or overall winner is inferred.</p></motion.main>
}
