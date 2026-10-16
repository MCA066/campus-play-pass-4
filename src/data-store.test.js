import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPersistedState, savePersistedState } from './data-store.js';

const fallback = { users:[], matches:[], teams:[] };
function memoryStorage(value) {
  return { value, getItem(){ return this.value; }, setItem(_key, next){ this.value=next; } };
}

test('storage adapter falls back safely for absent, malformed and invalid data', () => {
  assert.equal(loadPersistedState('app',fallback,memoryStorage(null)),fallback);
  assert.equal(loadPersistedState('app',fallback,memoryStorage('{broken')),fallback);
  assert.equal(loadPersistedState('app',fallback,memoryStorage('{"users":{},"matches":[],"teams":[]}')),fallback);
});

test('storage adapter round trips valid state', () => {
  const storage=memoryStorage(null), state={users:[{id:'u1'}],matches:[],teams:[]};
  assert.equal(savePersistedState('app',state,storage),true);
  assert.deepEqual(loadPersistedState('app',fallback,storage),state);
});
