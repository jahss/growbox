'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const chemistry = require('../js/chemistry.js');
const exportModule = require('../js/export.js');

const levels = [120, 140, 160, 180, 200];

test('builds Guaranteed Analysis CSV rows with elemental ppm', () => {
  const state = {view: 'analysis', manual: {N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 0}};
  const rows = exportModule.currentCsvRows(state, {levels, chemistry});
  assert.deepEqual(rows[0], ['Target N', 'g/gal', 'N', 'P', 'K', 'Ca', 'Mg', 'S']);
  assert.equal(rows.length, 6);
  assert.equal(rows[1][0], 120);
  assert.ok(Math.abs(rows[1][2] - 120) < 1e-12);
});

test('builds fixed-ratio blend feed-chart rows', () => {
  const state = {
    view: 'blend',
    blend: {
      result: {
        ids: ['a', 'b'],
        w: [0.6, 0.4],
        element: {N: 10, P: 2, K: 3, Ca: 4, Mg: 1, S: 0.5}
      }
    }
  };
  const products = new Map([['a', {name: 'A'}], ['b', {name: 'B'}]]);
  const rows = exportModule.currentCsvRows(state, {levels, chemistry, product: id => products.get(id)});
  assert.deepEqual(rows[0], ['Target N', 'A g/gal', 'B g/gal', 'Total g/gal', 'P', 'K', 'Ca', 'Mg', 'S']);
  assert.equal(rows.length, 6);
  assert.ok(Math.abs(rows[1][1] + rows[1][2] - rows[1][3]) < 1e-12);
});

test('builds comparison rows and leaves zero-nitrogen dose fields empty', () => {
  const state = {view: 'compare', n: 160, blend: {result: null}};
  const entries = [
    {id: 'complete', analysis: {N: 10, P2O5: 5, K2O: 10}},
    {id: 'zero-n', analysis: {N: 0, P2O5: 52, K2O: 34}}
  ];
  let calls = 0;
  const rows = exportModule.currentCsvRows(state, {
    chemistry,
    entries: () => { calls += 1; return entries; },
    exportLabel: entry => entry.id
  });
  assert.equal(calls, 1);
  assert.equal(rows[1][0], 'complete');
  assert.equal(rows[1][2], 160);
  assert.equal(rows[2][1], null);
  assert.ok(rows[2].slice(2).every(value => value === ''));
});

test('escapes CSV values and serializes state JSON', () => {
  assert.equal(exportModule.csvText([['A "quoted" value', 'x,y'], [null, 2]]), '"A ""quoted"" value","x,y"\n"","2"');
  assert.equal(exportModule.stateJson({n: 160}), '{\n  "n": 160\n}');
});
