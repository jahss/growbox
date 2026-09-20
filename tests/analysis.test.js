'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const chemistry = require('../js/chemistry.js');
const analysisModule = require('../js/analysis.js');

const levels = [120, 140, 160, 180, 200];
const format = (value, digits = 2) => Number.isFinite(Number(value))
  ? Number(value).toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1')
  : '—';

test('defines all supported guaranteed-analysis inputs', () => {
  assert.deepEqual(
    analysisModule.INPUT_FIELDS.map(field => field[0]),
    ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo']
  );
  const html = analysisModule.inputsHtml({N: 12, P2O5: 4, K2O: 16}, format);
  assert.match(html, /data-k="N"/);
  assert.match(html, /P₂O₅ %/);
  assert.match(html, /data-k="Mo"/);
});

test('builds label and elemental analysis output', () => {
  const analysis = {N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 0};
  const html = analysisModule.elementalTableHtml(analysis, chemistry, format);
  assert.match(html, /<td>4 P₂O₅<\/td>/);
  assert.match(html, /<td>1\.746 P<\/td>/);
  assert.match(html, /<td>13\.282 K<\/td>/);
});

test('calculates the complete standardized nitrogen feed chart', () => {
  const analysis = {N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 0};
  const rows = analysisModule.feedRows(analysis, levels, chemistry);
  assert.equal(rows.length, 5);
  assert.equal(rows[2].targetN, 160);
  assert.ok(Math.abs(rows[2].ppm.N - 160) < 1e-12);
  assert.ok(rows[2].dose > 5 && rows[2].dose < 5.1);
});

test('renders a clear zero-nitrogen message instead of dividing by zero', () => {
  const html = analysisModule.feedTableHtml({N: 0, P2O5: 52, K2O: 34}, levels, chemistry, format);
  assert.equal((html.match(/N must be greater than 0%/g) || []).length, 5);
  assert.doesNotMatch(html, /Infinity|NaN/);
});

test('component input events update analysis and refresh output', () => {
  const elements = {
    gaInputs: {innerHTML: ''},
    gaElemental: {innerHTML: ''},
    gaFeed: {innerHTML: ''}
  };
  const input = {dataset: {k: 'N'}, value: '12', oninput: null};
  const document = {
    getElementById(id) { return elements[id]; },
    querySelectorAll(selector) { return selector === '.gai' ? [input] : []; }
  };
  const analysis = {N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 0};
  const component = analysisModule.createComponent({document, chemistry, levels, format});
  component.render(analysis, (key, value) => { analysis[key] = value; });
  assert.equal(typeof input.oninput, 'function');
  assert.match(elements.gaFeed.innerHTML, /<td>160<\/td>/);

  input.value = '-5';
  input.oninput();
  assert.equal(analysis.N, 0);
  assert.match(elements.gaFeed.innerHTML, /N must be greater than 0%/);
});
