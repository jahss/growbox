'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const stateModule = require('../js/state.js');

const products = [
  {id: 'megacrop-11-5-14', compareGroup: '1-part'},
  {id: 'jacks-12-4-16', compareGroup: '1-part'},
  {id: 'one-c', compareGroup: '1-part'},
  {id: 'one-d', compareGroup: '1-part'},
  {id: 'component-a', compareGroup: 'component'}
];

const systems = [
  {id: 'athena-pro-veg'},
  {id: 'system-b', defaultProfile: 'veg', profiles: [{id: 'veg'}, {id: 'flower'}]},
  {id: 'system-c'}
];

function memoryStorage(initialValue = null) {
  const values = new Map();
  if (initialValue !== null) values.set(stateModule.STORAGE_KEY, initialValue);
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); },
    value(key) { return values.get(key); }
  };
}

test('fresh state returns independent defaults', () => {
  const first = stateModule.freshState();
  const second = stateModule.freshState();
  first.compare.push('one-c');
  first.manual.N = 20;
  first.useRate.doses['jacks-12-4-16'].amount = 9;
  first.systemProfiles['system-b'] = 'flower';
  assert.deepEqual(second.compare, ['megacrop-11-5-14', 'jacks-12-4-16']);
  assert.equal(second.manual.N, 12);
  assert.equal(second.useRate.doses['jacks-12-4-16'].amount, 1);
  assert.deepEqual(second.systemProfiles, {});
  assert.equal(second.n, 160);
});

test('loadState falls back safely when stored JSON is malformed', () => {
  const state = stateModule.loadState(memoryStorage('{not-json'), products, systems);
  assert.deepEqual(state.compare, ['megacrop-11-5-14', 'jacks-12-4-16']);
  assert.deepEqual(state.systemCompare, ['athena-pro-veg']);
  assert.equal(state.compareMode, 'ppm');
});

test('normalization removes unavailable and non-comparable entries', () => {
  const state = stateModule.normalizeState({
    compare: ['megacrop-11-5-14', 'component-a', 'missing'],
    systemCompare: ['athena-pro-veg', 'missing-system'],
    systemParts: {},
    compareMode: 'invalid'
  }, products, systems);
  assert.deepEqual(state.compare, ['megacrop-11-5-14']);
  assert.deepEqual(state.systemCompare, ['athena-pro-veg']);
  assert.equal(state.compareMode, 'ppm');
});

test('normalization restores missing nested state without discarding valid values', () => {
  const state = stateModule.normalizeState({
    view: 'unknown',
    compare: ['megacrop-11-5-14'],
    manual: {N: 18},
    blend: {mode: 'unknown', ids: ['component-a', 'missing'], target: {N: 15}}
  }, products, systems);
  assert.equal(state.view, 'compare');
  assert.equal(state.manual.N, 18);
  assert.equal(state.manual.P2O5, 4);
  assert.equal(state.blend.mode, 'label');
  assert.deepEqual(state.blend.ids, ['component-a']);
  assert.equal(state.blend.target.N, 15);
  assert.equal(state.blend.target.K2O, 16);
  assert.equal(state.useRate.selection, 'p:jacks-12-4-16');
  assert.equal(state.useRate.doses['jacks-12-4-16'].unit, 'g/gal');
});

test('loadState recovers when storage access is unavailable', () => {
  const storage = {getItem() { throw new Error('blocked'); }};
  const state = stateModule.loadState(storage, products, systems);
  assert.deepEqual(state.compare, ['megacrop-11-5-14', 'jacks-12-4-16']);
  assert.deepEqual(state.systemCompare, ['athena-pro-veg']);
});

test('normalization enforces the five-line comparison limit', () => {
  const state = stateModule.normalizeState({
    compare: ['megacrop-11-5-14', 'jacks-12-4-16', 'one-c', 'one-d'],
    systemCompare: ['athena-pro-veg', 'system-b', 'system-c'],
    systemParts: {},
    compareMode: 'percent'
  }, products, systems);
  assert.equal(state.compare.length + state.systemCompare.length, 5);
  assert.deepEqual(state.compare, ['megacrop-11-5-14', 'jacks-12-4-16', 'one-c', 'one-d']);
  assert.deepEqual(state.systemCompare, ['athena-pro-veg']);
});

test('normalization removes invalid and all-zero saved system ratios', () => {
  const state = stateModule.normalizeState({
    compare: [],
    systemCompare: [],
    systemParts: {
      valid: [0, 2],
      zero: [0, 0],
      malformed: '1:1'
    },
    compareMode: 'ppm'
  }, products, systems);
  assert.deepEqual(state.systemParts, {valid: [0, 2]});
});

test('normalization validates profiles and migrates saved profile-system parts to Custom', () => {
  const explicit = stateModule.normalizeState({
    systemProfiles: {'system-b': 'flower', missing: 'veg', 'system-c': 'flower'}
  }, products, systems);
  assert.deepEqual(explicit.systemProfiles, {'system-b': 'flower'});

  const migrated = stateModule.normalizeState({
    systemParts: {'system-b': [2, 1]}
  }, products, systems);
  assert.equal(migrated.systemProfiles['system-b'], 'custom');
});

test('normalization validates use-rate selection, presets, doses, and units', () => {
  const state = stateModule.normalizeState({
    useRate: {
      selection: 'p:component-a',
      preset: 'invalid',
      doses: {
        'jacks-12-4-16': {amount: -2, unit: 'ounces'},
        'component-a': {amount: 3, unit: 'g/L'}
      }
    }
  }, products, systems);
  assert.equal(state.useRate.selection, 'p:jacks-12-4-16');
  assert.equal(state.useRate.preset, 'custom');
  assert.deepEqual(state.useRate.doses['jacks-12-4-16'], {amount: 0, unit: 'g/gal'});
  assert.deepEqual(state.useRate.doses['component-a'], {amount: 3, unit: 'g/L'});
});

test('normalization removes retired manufacturer-rate comparison state', () => {
  const state = stateModule.normalizeState({rateChoice: {'system:old': 3}}, products, systems);
  assert.equal(Object.hasOwn(state, 'rateChoice'), false);
});

test('saveState persists the current state under the versioned key', () => {
  const storage = memoryStorage();
  const state = stateModule.freshState();
  state.n = 180;
  stateModule.saveState(storage, state);
  assert.equal(JSON.parse(storage.value(stateModule.STORAGE_KEY)).n, 180);
});
