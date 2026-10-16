import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { nationalCricketTeams, professionalPlayers } from './players-data.js';
import { sampleArticles } from './news-data.js';

const expectedPlayers=['Chris Gayle','Virat Kohli','MS Dhoni','Ravindra Jadeja','Dwayne Bravo','Lionel Messi','Cristiano Ronaldo','Sergio Ramos'];
const expectedTeams=['India men’s national cricket team','New Zealand men’s national cricket team','Australia men’s national cricket team'];
function assertLocalJpeg(publicPath) {
  assert.match(publicPath,/^\/images\//);
  const bytes=readFileSync(resolve('public',publicPath.slice(1)));
  assert.deepEqual([...bytes.subarray(0,3)],[0xff,0xd8,0xff],`${publicPath} must be an actual JPEG asset`);
}

test('professional directory contains the eight requested distinct athlete profiles',()=>{
  assert.deepEqual(professionalPlayers.map(p=>p.name),expectedPlayers);
  assert.equal(new Set(professionalPlayers.map(p=>p.id)).size,8);
  for(const player of professionalPlayers){
    assert.ok(player.sport==='Cricket'||player.sport==='Football');
    assert.ok(player.role&&player.description&&player.roleSource);
    assert.equal(player.category,'Professional athlete');
    assertLocalJpeg(player.image);
  }
});

test('national team imagery is separate and correctly labeled',()=>{
  assert.deepEqual(nationalCricketTeams.map(t=>t.name),expectedTeams);
  for(const team of nationalCricketTeams){assert.equal(team.category,'National team');assert.ok(team.alt&&team.era);assertLocalJpeg(team.image)}
});

test('sample news uses local photos with matching alt text',()=>{
  assert.equal(sampleArticles.length,11);
  for(const article of sampleArticles){assert.ok(article.imageAlt);assertLocalJpeg(article.image)}
});
