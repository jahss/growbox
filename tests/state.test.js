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
  {id: 'system-c'},
  {id: 'athena-pro-bloom'},
  {id: 'cropsalt-bloom'},
  {id: 'jacks-2part-0-12-26'}
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
  assert.deepEqual(second.compare, []);
  assert.deepEqual(second.systemCompare, ['athena-pro-bloom', 'cropsalt-bloom', 'jacks-2part-0-12-26']);
  assert.equal(second.manual.N, 0);
  assert.equal(second.useRate.doses['jacks-12-4-16'].amount, 1);
  assert.deepEqual(second.systemProfiles, {});
  assert.equal(second.n, 160);
});

test('loadState falls back safely when stored JSON is malformed', () => {
  const state = stateModule.loadState(memoryStorage('{not-json'), products, systems);
  assert.deepEqual(state.compare, []);
  assert.deepEqual(state.systemCompare, ['athena-pro-bloom', 'cropsalt-bloom', 'jacks-2part-0-12-26']);
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
  assert.equal(state.manual.P2O5, 0);
  assert.equal('mode' in state.blend, false);
  assert.deepEqual(state.blend.ids, ['component-a']);
  // A session from before the ppm Blend finder (it has `mode`) held label % targets, so it resets.
  assert.equal(state.blend.target.N, 160);
  assert.equal(state.blend.target.K, 200);
  const current = stateModule.normalizeState({blend: {target: {N: 150, Fe: -1}, targetElement: 'Q', targetLevel: -5, result: {w: [1]}}}, products, systems);
  assert.equal(current.blend.target.N, 150);
  assert.equal(current.blend.target.Fe, 0);
  assert.equal(current.blend.target.K, 200);
  assert.equal(current.blend.targetElement, 'N');
  assert.equal(current.blend.targetLevel, 160);
  assert.equal(current.blend.result, null, 'an old-shape result is dropped');
  assert.equal(state.useRate.selection, 'p:jacks-12-4-16');
  assert.equal(state.useRate.doses['jacks-12-4-16'].unit, 'g/gal');
});

test('loadState recovers when storage access is unavailable', () => {
  const storage = {getItem() { throw new Error('blocked'); }};
  const state = stateModule.loadState(storage, products, systems);
  assert.deepEqual(state.compare, []);
  assert.deepEqual(state.systemCompare, ['athena-pro-bloom', 'cropsalt-bloom', 'jacks-2part-0-12-26']);
});

test('normalization enforces the ten-line comparison limit, dropping systems first', () => {
  assert.equal(stateModule.MAX_COMPARE_LINES, 10);
  const manyProducts = Array.from({length: 8}, (_, i) => ({id: 'p' + i, compareGroup: '1-part'}));
  const manySystems = Array.from({length: 5}, (_, i) => ({id: 's' + i}));
  const state = stateModule.normalizeState({
    compare: manyProducts.map(item => item.id),
    systemCompare: manySystems.map(item => item.id),
    systemParts: {},
    compareMode: 'percent'
  }, manyProducts, manySystems);
  assert.equal(state.compare.length + state.systemCompare.length, 10);
  assert.deepEqual(state.compare, manyProducts.map(item => item.id));
  assert.deepEqual(state.systemCompare, ['s0', 's1']);
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

test('normalization keeps valid excluded parts and drops invalid or all-part exclusions', () => {
  const partSystems = [
    {id: 'two', components: [{}, {}]},
    {id: 'three', components: [{}, {}, {}]},
    {id: 'all', components: [{}, {}]}
  ];
  const state = stateModule.normalizeState({
    compare: [], systemCompare: [], systemParts: {},
    systemExcluded: {two: [1, 1, 5], three: [2, 0], all: [0, 1], missing: [0]}
  }, products, partSystems);
  assert.deepEqual(state.systemExcluded, {two: [1], three: [0, 2]});
  assert.deepEqual(stateModule.normalizeState({systemExcluded: []}, products, partSystems).systemExcluded, {});
});

test('normalization keeps valid custom products and lets them stay in Compare', () => {
  const state = stateModule.normalizeState({
    compare: ['custom-1', 'custom-9', 'jacks-12-4-16'],
    systemCompare: [],
    customProducts: [
      {id: 'custom-1', name: '  My bloom  ', analysis: {N: '3', P2O5: 1, K2O: 5, Ca: -2}, densityGPerMl: 1.2},
      {id: 'custom-1', name: 'duplicate', analysis: {}},
      {id: 'not-custom', name: 'bad id', analysis: {}},
      {id: 'custom-2', name: '', analysis: {N: 12, P2O5: 4, K2O: 16}},
      null
    ]
  }, products, systems);
  assert.deepEqual(state.customProducts.map(item => item.id), ['custom-1', 'custom-2']);
  assert.equal(state.customProducts[0].name, 'My bloom');
  assert.equal(state.customProducts[0].analysis.N, 3);
  assert.equal(state.customProducts[0].analysis.Ca, 0);
  assert.equal(state.customProducts[0].analysis.Mo, 0);
  assert.equal(state.customProducts[0].densityGPerMl, 1.2);
  assert.equal(state.customProducts[1].name, '12-4-16');
  assert.deepEqual(state.compare, ['custom-1', 'jacks-12-4-16']);
});

test('default comparison lines exist in the product database', () => {
  const fs = require('node:fs');
  const vm = require('node:vm');
  const context = {window: {}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '..', 'data', 'products.js'), 'utf8'), context);
  const state = stateModule.normalizeState(stateModule.freshState(), context.window.FERTILIZER_PRODUCTS, context.window.FERTILIZER_SYSTEMS);
  assert.deepEqual(state.systemCompare, ['athena-pro-bloom', 'cropsalt-bloom', 'jacks-2part-0-12-26']);
});

test('normalization keeps a valid blend target choice and clears an unknown one', () => {
  const keep = stateModule.normalizeState({blend: {targetId: 's:athena-pro-bloom'}}, products, systems);
  assert.equal(keep.blend.targetId, 's:athena-pro-bloom');
  const product = stateModule.normalizeState({blend: {targetId: 'p:jacks-12-4-16'}}, products, systems);
  assert.equal(product.blend.targetId, 'p:jacks-12-4-16');
  assert.equal(stateModule.normalizeState({blend: {targetId: 'p:component-a'}}, products, systems).blend.targetId, '');
  assert.equal(stateModule.normalizeState({blend: {targetId: 's:missing'}}, products, systems).blend.targetId, '');
  assert.equal(stateModule.STORAGE_KEY, 'growbox-fert-tool-v08');
});
