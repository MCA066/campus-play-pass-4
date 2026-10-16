export const TOURNAMENT_STATUSES = ['registration-open', 'registration-closed', 'in-progress', 'completed'];

export function approvedEntries(tournament) {
  return (tournament.registrations || []).filter(entry => entry.status === 'approved');
}

function makeFixture(tournament, round, home, away, leg = 1) {
  return {
    id: crypto.randomUUID(), round, leg, homeId: home.id, awayId: away?.id || null,
    homeName: home.name, awayName: away?.name || 'BYE', status: away ? 'scheduled' : 'completed',
    scoreHome: null, scoreAway: null, winnerId: away ? null : home.id,
    result: away ? null : 'bye', tournamentId: tournament.id, sport: tournament.sport,
  };
}

export function generateKnockout(tournament, entries = approvedEntries(tournament)) {
  if (entries.length < 2) throw new Error('Approve at least two entries before generating fixtures.');
  const size = 2 ** Math.ceil(Math.log2(entries.length));
  const byes = size - entries.length;
  const fixtures = [];
  const pairs = [...entries.slice(0, byes).map(entry => [entry, null])];
  for (let i = byes; i < entries.length; i += 2) pairs.push([entries[i], entries[i + 1]]);
  for (const [home, away] of pairs) {
    fixtures.push(makeFixture(tournament, 1, home, away));
  }
  return fixtures;
}

export function generateLeague(tournament, entries = approvedEntries(tournament), doubleLeg = false) {
  if (entries.length < 2) throw new Error('Approve at least two entries before generating fixtures.');
  if (tournament.format === 'two-leg' && entries.length !== 2) throw new Error('A two-leg series needs exactly two approved entries.');
  if (tournament.format === 'single-match' && entries.length !== 2) throw new Error('A single match needs exactly two approved entries.');
  if (tournament.format === 'single-match') return [makeFixture(tournament, 1, entries[0], entries[1])];
  const list = [...entries];
  if (list.length % 2) list.push(null);
  const rounds = list.length - 1;
  const half = list.length / 2;
  const fixtures = [];
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const a = list[i], b = list[list.length - 1 - i];
      if (a && b) fixtures.push(makeFixture(tournament, round + 1, round % 2 ? b : a, round % 2 ? a : b));
    }
    list.splice(1, 0, list.pop());
  }
  if (doubleLeg) return [...fixtures, ...fixtures.map(f => ({ ...f, id: crypto.randomUUID(), leg: 2, round: f.round + rounds, homeId: f.awayId, awayId: f.homeId, homeName: f.awayName, awayName: f.homeName, status: 'scheduled', scoreHome: null, scoreAway: null, winnerId: null, result: null }))];
  return fixtures;
}

export function generateFixtures(tournament) {
  if (tournament.fixtures?.length) throw new Error('Fixtures already exist. Reset them before generating a new set.');
  const entries = approvedEntries(tournament);
  if (tournament.format === 'knockout') return generateKnockout(tournament, entries);
  if (tournament.format === 'two-leg') return generateLeague(tournament, entries, true);
  return generateLeague(tournament, entries, false);
}

export function standings(tournament) {
  const chess = tournament.sport === 'Chess';
  const table = new Map(approvedEntries(tournament).map(entry => [entry.id, {
    id: entry.id, name: entry.name, played: 0, won: 0, drawn: 0, lost: 0,
    points: 0, scored: 0, conceded: 0,
  }]));
  for (const f of tournament.fixtures || []) {
    if (f.status !== 'completed' || f.result === 'bye' || f.scoreHome == null || f.scoreAway == null) continue;
    const home = table.get(f.homeId), away = table.get(f.awayId);
    if (!home || !away) continue;
    home.played++; away.played++;
    home.scored += Number(f.scoreHome); home.conceded += Number(f.scoreAway);
    away.scored += Number(f.scoreAway); away.conceded += Number(f.scoreHome);
    if (f.scoreHome === f.scoreAway) {
      home.drawn++; away.drawn++; home.points += chess ? 0.5 : 1; away.points += chess ? 0.5 : 1;
    } else {
      const winner = f.scoreHome > f.scoreAway ? home : away;
      const loser = winner === home ? away : home;
      winner.won++; loser.lost++; winner.points += chess ? 1 : 3;
    }
  }
  const rows=[...table.values()];
  const h2h=new Map(rows.map(row=>[row.id,0]));
  if(chess&&tournament.tieBreak==='head-to-head'){
    for(const f of tournament.fixtures||[]){
      const home=table.get(f.homeId),away=table.get(f.awayId);
      if(f.status!=='completed'||f.result==='bye'||!home||!away||home.points!==away.points)continue;
      if(f.scoreHome===f.scoreAway){h2h.set(home.id,h2h.get(home.id)+0.5);h2h.set(away.id,h2h.get(away.id)+0.5)}
      else h2h.set(Number(f.scoreHome)>Number(f.scoreAway)?home.id:away.id,h2h.get(Number(f.scoreHome)>Number(f.scoreAway)?home.id:away.id)+1);
    }
  }
  return rows.sort((a, b) => {
    const points = b.points - a.points;
    if (points) return points;
    if(chess&&tournament.tieBreak==='head-to-head'){
      const direct=h2h.get(b.id)-h2h.get(a.id);
      if(direct)return direct;
    }
    return (b.scored - b.conceded) - (a.scored - a.conceded) || b.scored - a.scored || a.name.localeCompare(b.name);
  });
}

export function settleFixture(tournament, fixtureId, scoreHome, scoreAway, tieBreak) {
  const fixture = tournament.fixtures.find(f => f.id === fixtureId);
  if (!fixture) throw new Error('This fixture could not be found.');
  if (fixture.result === 'bye') throw new Error('A bye does not need a result.');
  if (!Number.isFinite(Number(scoreHome)) || !Number.isFinite(Number(scoreAway)) || Number(scoreHome) < 0 || Number(scoreAway) < 0) throw new Error('Enter valid non-negative scores.');
  if (tieBreak && tieBreak !== fixture.homeId && tieBreak !== fixture.awayId) throw new Error('Choose one of the two entries as the tie-break winner.');
  if (tournament.format === 'knockout' && Number(scoreHome) === Number(scoreAway) && !tieBreak) throw new Error('Knockout ties need a selected winner.');
  if (fixture.status === 'completed' && fixture.scoreHome === Number(scoreHome) && fixture.scoreAway === Number(scoreAway) && (!tieBreak || fixture.winnerId === tieBreak)) return tournament;
  const updated = { ...tournament, fixtures: tournament.fixtures.map(f => f.id === fixtureId ? { ...f, status: 'completed', scoreHome: Number(scoreHome), scoreAway: Number(scoreAway), result: 'final', winnerId: Number(scoreHome) === Number(scoreAway) ? (tieBreak || null) : Number(scoreHome) > Number(scoreAway) ? f.homeId : f.awayId } : f) };
  if (updated.format === 'two-leg') {
    const legs=updated.fixtures.filter(f=>f.homeId===fixture.homeId&&f.awayId===fixture.awayId||f.homeId===fixture.awayId&&f.awayId===fixture.homeId);
    if(legs.length===2&&legs.every(f=>f.status==='completed')){
      const totals=new Map([[fixture.homeId,0],[fixture.awayId,0]]);
      for(const leg of legs){totals.set(leg.homeId,totals.get(leg.homeId)+Number(leg.scoreHome));totals.set(leg.awayId,totals.get(leg.awayId)+Number(leg.scoreAway));}
      const homeTotal=totals.get(fixture.homeId),awayTotal=totals.get(fixture.awayId);
      if(homeTotal===awayTotal&&!tieBreak) throw new Error('An aggregate tie needs a selected tie-break winner.');
      const winnerId=homeTotal===awayTotal?(tieBreak||null):homeTotal>awayTotal?fixture.homeId:fixture.awayId;
      return {...updated,winnerId,status:winnerId?'completed':'in-progress'};
    }
    return updated;
  }
  if (updated.format !== 'knockout') return updated;
  const changed = updated.fixtures.find(f => f.id === fixtureId);
  updated.fixtures = updated.fixtures.filter(f => f.round <= changed.round);
  for (let round = 1; round <= Math.max(...updated.fixtures.map(f => f.round)); round++) {
    const current = updated.fixtures.filter(f => f.round === round);
    if (!current.length || current.some(f => f.status !== 'completed')) break;
    const winners = current.map(f => approvedEntries(updated).find(e => e.id === f.winnerId) || { id: f.winnerId, name: f.winnerName }).filter(e => e.id);
    if (winners.length === 1) { updated.status = 'completed'; updated.winnerId = winners[0].id; break; }
    if (updated.fixtures.some(f => f.round === round + 1)) continue;
    for (let i = 0; i < winners.length; i += 2) updated.fixtures.push(makeFixture(updated, round + 1, winners[i], winners[i + 1]));
  }
  return updated;
}

export function cricketTotals(events = []) {
  return events.reduce((t, e) => {
    t.runs += (e.batRuns || 0) + (e.extras || 0);
    t.wickets += e.wicket ? 1 : 0;
    t.legalBalls += e.legal ? 1 : 0;
    return t;
  }, { runs: 0, wickets: 0, legalBalls: 0 });
}

export function cricketEvent(type, value = 0) {
  if (type === 'wide') return { type, batRuns: 0, extras: 1 + Number(value || 0), legal: false, wicket: false };
  if (type === 'no-ball') return { type, batRuns: Number(value || 0), extras: 1, legal: false, wicket: false };
  if (type === 'bye' || type === 'leg-bye') return { type, batRuns: 0, extras: Number(value || 1), legal: true, wicket: false };
  if (type === 'wicket') return { type, batRuns: 0, extras: 0, legal: true, wicket: true };
  return { type, batRuns: Number(value), extras: 0, legal: true, wicket: false };
}

export function footballTotals(events = []) {
  return events.reduce((t, e) => {
    if (e.type === 'goal') t[e.side === 'away' ? 'away' : 'home']++;
    if (e.type === 'yellow') t.yellow++;
    if (e.type === 'red') t.red++;
    return t;
  }, { home: 0, away: 0, yellow: 0, red: 0 });
}
