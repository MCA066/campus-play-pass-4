import test from 'node:test';
import assert from 'node:assert/strict';
import { cricketEvent, cricketTotals, footballTotals, generateKnockout, generateLeague, settleFixture, standings } from './game-engine.js';

const entries=n=>Array.from({length:n},(_,i)=>({id:`e${i+1}`,name:`Entry ${i+1}`,status:'approved'}));
const tournament=(format='knockout',sport='Football',count=4)=>({id:'test',format,sport,registrations:entries(count),fixtures:[]});

test('knockout byes fill the bracket and never duplicate an entry in the first round',()=>{
  const t=tournament('knockout','Football',5), fixtures=generateKnockout(t);
  assert.equal(fixtures.length,4);
  assert.equal(fixtures.filter(f=>f.result==='bye').length,3);
  const entrants=fixtures.flatMap(f=>[f.homeId,f.awayId].filter(Boolean));
  assert.equal(new Set(entrants).size,5);
});

test('knockout winners progress once and repeated result finalization is idempotent',()=>{
  const t=tournament('knockout','Football',4);t.fixtures=generateKnockout(t);
  let current=t;
  for(const f of [...current.fixtures])current=settleFixture(current,f.id,2,0);
  const final=current.fixtures.find(f=>f.round===2);
  assert.ok(final);
  const complete=settleFixture(current,final.id,1,0);
  assert.equal(complete.status,'completed');
  assert.equal(complete.winnerId,final.homeId);
  assert.equal(settleFixture(complete,final.id,1,0),complete);
  assert.equal(complete.fixtures.filter(f=>f.round===2).length,1);
});

test('knockout correction rebuilds downstream participants and requires a winner for ties',()=>{
  const t=tournament('knockout','Football',4);t.fixtures=generateKnockout(t);
  let next=settleFixture(t,t.fixtures[0].id,2,0);
  next=settleFixture(next,t.fixtures[1].id,2,0);
  const final=next.fixtures.find(f=>f.round===2);
  next=settleFixture(next,final.id,2,0);
  const corrected=settleFixture(next,t.fixtures[0].id,0,3);
  const rebuilt=corrected.fixtures.find(f=>f.round===2);
  assert.ok([rebuilt.homeId,rebuilt.awayId].includes(t.fixtures[0].awayId));
  assert.throws(()=>settleFixture(t,t.fixtures[0].id,1,1),/Knockout ties/);
  assert.throws(()=>settleFixture(t,t.fixtures[0].id,1,1,'unrelated-entry'),/tie-break winner/);
});

test('league schedule and reusable standings recalculate correctly',()=>{
  const t=tournament('league','Football',3);t.fixtures=generateLeague(t);
  assert.equal(t.fixtures.length,3);
  let next=t;
  for(const [i,f] of next.fixtures.entries())next=settleFixture(next,f.id,i===0?2:0,i===0?0:1);
  const table=standings(next);
  assert.equal(table[0].name,'Entry 2');
  assert.equal(table[0].points,6);
  assert.equal(table[0].played,2);
});

test('two-leg series pairs home and away fixtures and calculates aggregate winner',()=>{
  const t=tournament('two-leg','Football',2);t.fixtures=generateLeague(t,[...t.registrations],true);
  assert.equal(t.fixtures.length,2);
  assert.equal(t.fixtures[0].homeId,t.fixtures[1].awayId);
  let next=settleFixture(t,t.fixtures[0].id,2,1);
  next=settleFixture(next,t.fixtures[1].id,0,0);
  assert.equal(next.status,'completed');
  assert.equal(next.winnerId,t.fixtures[0].homeId);
});

test('two-leg aggregate tie requires and records a selected winner',()=>{
  const t=tournament('two-leg','Football',2);t.fixtures=generateLeague(t,[...t.registrations],true);
  let next=settleFixture(t,t.fixtures[0].id,1,0);
  assert.throws(()=>settleFixture(next,t.fixtures[1].id,1,0),/aggregate tie/);
  next=settleFixture(next,t.fixtures[1].id,1,0,t.fixtures[0].homeId);
  assert.equal(next.status,'completed');
  assert.equal(next.winnerId,t.fixtures[0].homeId);
});

test('chess draws award half a point and knockout ties require a winner choice',()=>{
  const league=tournament('round-robin','Chess',2);league.fixtures=generateLeague(league);
  const draw=settleFixture(league,league.fixtures[0].id,0.5,0.5);
  assert.deepEqual(standings(draw).map(r=>r.points),[0.5,0.5]);
  const ko=tournament('knockout','Chess',2);ko.fixtures=generateKnockout(ko);
  assert.equal(settleFixture(ko,ko.fixtures[0].id,0.5,0.5,ko.fixtures[0].awayId).winnerId,ko.fixtures[0].awayId);
});

test('chess standings use head-to-head points when overall points tie',()=>{
  const t=tournament('round-robin','Chess',4);t.tieBreak='head-to-head';
  const [a,b,c,d]=t.registrations;
  t.fixtures=[
    {id:'ab',homeId:a.id,awayId:b.id,status:'completed',scoreHome:1,scoreAway:0},
    {id:'ca',homeId:c.id,awayId:a.id,status:'completed',scoreHome:1,scoreAway:0},
    {id:'bd',homeId:b.id,awayId:d.id,status:'completed',scoreHome:1,scoreAway:0},
    {id:'cd',homeId:c.id,awayId:d.id,status:'completed',scoreHome:1,scoreAway:0},
  ];
  const rows=standings(t);
  assert.deepEqual(rows.map(r=>r.points),[2,1,1,0]);
  assert.equal(rows[1].id,a.id);
});

test('cricket extras and legal balls are counted separately',()=>{
  const total=cricketTotals([cricketEvent('wide'),cricketEvent('no-ball'),cricketEvent('bye',1),cricketEvent('leg-bye',1),cricketEvent('wicket'),cricketEvent('four',4)]);
  assert.deepEqual(total,{runs:8,wickets:1,legalBalls:4});
});

test('football score totals track goals and cards',()=>{
  const total=footballTotals([{type:'goal',side:'home'},{type:'goal',side:'away'},{type:'goal',side:'home'},{type:'yellow'},{type:'red'}]);
  assert.deepEqual(total,{home:2,away:1,yellow:1,red:1});
});
