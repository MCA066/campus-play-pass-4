import React from 'react';
import { ArrowLeft, ArrowRight, Search, UserRound } from 'lucide-react';
import { getProfessionalPlayer, nationalCricketTeams, professionalPlayers } from './players-data.js';
import { publicAsset } from './assets.js';

function SportPhoto({src,alt,initials='CP',className=''}) {
  const [failed,setFailed]=React.useState(false);
  return <div className={`sport-photo ${className}${failed?' is-fallback':''}`} role="img" aria-label={alt||'Sports photograph'}>
    {!failed?<img src={publicAsset(src)} alt="" loading="lazy" onError={()=>setFailed(true)}/>:<div className="photo-fallback" aria-hidden="true"><span><UserRound size={23}/></span><b>{initials}</b><small>Photo unavailable</small></div>}
  </div>;
}

function PlayerCard({player,onOpen,featured=false}) {
  return <button className={`directory-player-card${featured?' featured-player-card':''}`} onClick={()=>onOpen(player.id)} aria-label={`View ${player.name}, ${player.sport} ${player.role}`}>
    <SportPhoto src={player.image} alt={`Photograph of ${player.name}`} initials={player.initials} className="player-card-photo"/>
    <div className="directory-player-copy"><span className={`sport-label ${player.sport.toLowerCase()}`}>{player.sport}</span><h3>{player.name}</h3><span className="player-role">{player.role}</span>{featured&&<p>{player.description}</p>}<span className="story-read">View profile <ArrowRight size={14}/></span></div>
  </button>;
}

function PlayerDetail({player,onBack}) {
  if(!player)return <main className="players-page page-wrap"><div className="news-empty"><h1>That player isn’t in this directory.</h1><p>Browse the professional athlete directory for another profile.</p><button className="btn primary" onClick={onBack}><ArrowLeft size={16}/> Back to players</button></div></main>;
  return <main className="players-page page-wrap"><button className="text-link news-back" onClick={onBack}><ArrowLeft size={16}/> All players</button><article className="player-profile-page"><SportPhoto src={player.image} alt={`Photograph of ${player.name}`} initials={player.initials} className="player-profile-photo"/><div className="player-profile-copy"><span className={`sport-label ${player.sport.toLowerCase()}`}>{player.sport}</span><span className="eyebrow muted">PROFESSIONAL ATHLETE</span><h1>{player.name}</h1><p className="player-profile-role">{player.role}</p><p>{player.description}</p><div className="profile-separation-note">This profile is editorial only. Professional athletes are not part of CampusPlay college teams, recruitment, matches, or tournament entries.</div>{player.roleSource&&<a className="player-source-link" href={player.roleSource} target="_blank" rel="noopener noreferrer">Check role source <ArrowRight size={14}/></a>}</div></article></main>;
}

export function PlayersDirectory({slug,onOpen,onBack}) {
  const [sport,setSport]=React.useState('All sports');
  const [query,setQuery]=React.useState('');
  if(slug)return <PlayerDetail player={getProfessionalPlayer(slug)} onBack={onBack}/>;
  const filtered=professionalPlayers.filter(p=>(sport==='All sports'||p.sport===sport)&&(!query||`${p.name} ${p.sport} ${p.role}`.toLowerCase().includes(query.trim().toLowerCase())));
  const featured=professionalPlayers.filter(p=>['virat-kohli','lionel-messi','ravindra-jadeja','sergio-ramos'].includes(p.id));
  return <main className="players-page page-wrap"><div className="page-intro players-heading"><div><div className="eyebrow muted">CAMPUSPLAY · PROFESSIONAL DIRECTORY</div><h1>Players who inspire.</h1><p>Browse professional athletes by sport. Campus participants stay in their own college directory.</p></div></div><section className="featured-players-block"><div className="section-head"><div><div className="eyebrow muted">FEATURED PROFILES</div><h2>Featured players</h2></div><span>Editorial profiles · not joinable</span></div><div className="featured-player-grid">{featured.map(p=><PlayerCard key={p.id} player={p} onOpen={onOpen} featured/>)}</div></section><div className="directory-toolbar"><div className="sport-tabs" role="group" aria-label="Filter professional players by sport">{['All sports','Cricket','Football'].map(s=><button key={s} className={sport===s?'selected':''} aria-pressed={sport===s} onClick={()=>setSport(s)}>{s}</button>)}</div><label className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search players by name" placeholder="Search player name"/></label></div><div className="section-head directory-list-head"><div><div className="eyebrow muted">THE DIRECTORY</div><h2>Professional athletes</h2></div><span>{filtered.length} players</span></div>{filtered.length?<div className="directory-player-grid">{filtered.map(p=><PlayerCard key={p.id} player={p} onOpen={onOpen}/>)}</div>:<div className="news-empty"><h2>No players match that search.</h2><p>Try another name or sport filter.</p><button className="btn outline" onClick={()=>{setSport('All sports');setQuery('')}}>Show all players</button></div>}<p className="profile-separation-note directory-note">These eight public profiles are kept separate from college players, teammates, match requests and tournament registrations.</p><section className="national-teams-block"><div className="section-head"><div><div className="eyebrow muted">INTERNATIONAL CRICKET · EDITORIAL</div><h2>National teams</h2></div><span>Separate from college teams</span></div><div className="national-team-grid">{nationalCricketTeams.map(team=><article className="national-team-card" key={team.id}><SportPhoto src={team.image} alt={team.alt} initials={team.shortName.slice(0,2).toUpperCase()} className="national-team-photo"/><div><span className="eyebrow muted">NATIONAL TEAM · CRICKET</span><h3>{team.name}</h3><p>{team.era}</p></div></article>)}</div></section></main>;
}

export function FeaturedPlayerRail({onOpen}) {
  return <div className="featured-player-rail">{professionalPlayers.filter(p=>['virat-kohli','lionel-messi','cristiano-ronaldo','ms-dhoni'].includes(p.id)).map(player=><PlayerCard key={player.id} player={player} onOpen={onOpen}/>)}</div>;
}

export function NationalTeamRail() {
  return <div className="national-team-rail">{nationalCricketTeams.map(team=><article className="national-team-card compact-team-card" key={team.id}><SportPhoto src={team.image} alt={team.alt} initials={team.shortName.slice(0,2).toUpperCase()} className="national-team-photo"/><div><span className="eyebrow muted">MEN’S NATIONAL TEAM</span><h3>{team.name}</h3><small>{team.era}</small></div></article>)}</div>;
}
