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

test('builds one elemental box per element, with the label oxide under P and K', () => {
  const analysis = {N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 0, Fe: 0.1};
  const html = analysisModule.elementalHtml(analysis, chemistry, format);
  assert.equal((html.match(/class="cmp-chip"/g) || []).length, 12);
  assert.match(html, /<small>P<\/small><b>1\.746<\/b><small>4 P₂O₅<\/small>/);
  assert.match(html, /<small>K<\/small><b>13\.282<\/b><small>16 K₂O<\/small>/);
  assert.match(html, /<small>Fe<\/small><b>0\.1<\/b><\/span>/);
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
  const html = analysisModule.feedHtml({N: 0, P2O5: 52, K2O: 34}, levels, chemistry, format);
  assert.equal((html.match(/N must be greater than 0%/g) || []).length, 1);
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
  assert.match(elements.gaFeed.innerHTML, /<b class="cmp-name">160 ppm N<\/b>/);

  input.value = '-5';
  input.oninput();
  assert.equal(analysis.N, 0);
  assert.match(elements.gaFeed.innerHTML, /N must be greater than 0%/);
});

test('feed chart shows every element per N target and adds mL/gal only with a density', () => {
  const analysis = {N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 0};
  const dry = analysisModule.feedHtml(analysis, levels, chemistry, format);
  assert.doesNotMatch(dry, /mL\/gal/);
  assert.equal((dry.match(/<details class="cmp-card feed-card">/g) || []).length, levels.length);
  // Summary holds all 12 (micros shown inline on wide screens); the body repeats the 6 micros.
  assert.equal((dry.match(/class="cmp-chip"/g) || []).length, levels.length * 18);
  assert.match(analysisModule.feedHtml(analysis, levels, chemistry, format, true), /<details class="cmp-card feed-card" open>/);
  assert.match(analysisModule.feedHtml({}, levels, chemistry, format), /Enter a label above/);
  const liquid = {...analysis, densityGPerMl: 1.25};
  const html = analysisModule.feedHtml(liquid, levels, chemistry, format);
  const dose = chemistry.standardizedNitrogenDose(liquid, 160);
  assert.ok(html.includes('160 ppm N</b><span class="cmp-dose">' + format(dose, 3) + ' g/gal · ' + format(dose / 1.25, 3) + ' mL/gal</span>'));
  assert.match(analysisModule.inputsHtml(liquid, format), /data-k="densityGPerMl"[^>]*value="1\.25"/);
  assert.match(analysisModule.inputsHtml(analysis, format), /data-k="densityGPerMl"[^>]*value=""/);
  assert.match(analysisModule.inputsHtml({}, format), /data-k="N"[^>]*placeholder="e\.g\. 12" value=""/);
});

test('Add to Compare saves a named custom product, updates it by name, and deletes it', () => {
  const elements = {
    gaInputs: {innerHTML: ''}, gaElemental: {innerHTML: ''}, gaFeed: {innerHTML: ''},
    gaName: {value: 'My bloom'}, gaAdd: {onclick: null}, gaSaved: {innerHTML: ''}
  };
  const document = {getElementById(id) { return elements[id]; }, querySelectorAll() { return []; }};
  const state = {manual: {N: 3, P2O5: 1, K2O: 5, densityGPerMl: 1.2}, compare: ['a'], systemCompare: [], customProducts: []};
  const notices = [];
  let refreshes = 0;
  const component = analysisModule.createComponent({
    document, chemistry, levels, format, getState: () => state, save() {},
    saveCustomProduct: require('../js/state.js').saveCustomProduct,
    notify: (...args) => notices.push(args), onCustomProducts: () => { refreshes += 1; }
  });
  component.render(state.manual, () => {});
  elements.gaAdd.onclick();
  assert.equal(state.customProducts.length, 1);
  assert.deepEqual(state.customProducts[0], {id: 'custom-1', name: 'My bloom', analysis: {N: 3, P2O5: 1, K2O: 5, Ca: 0, Mg: 0, S: 0, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0}, densityGPerMl: 1.2});
  assert.deepEqual(state.compare, ['a', 'custom-1']);
  assert.match(notices[0][0], /Added “My bloom” to Compare/);
  assert.match(elements.gaSaved.innerHTML, /My bloom.*3-1-5 · 1\.2 g\/mL/);

  state.manual.K2O = 6;
  elements.gaName.value = 'my BLOOM';
  elements.gaAdd.onclick();
  assert.equal(state.customProducts.length, 1, 'same name (any case) updates');
  assert.equal(state.customProducts[0].analysis.K2O, 6);
  assert.deepEqual(state.compare, ['a', 'custom-1']);
  assert.equal(refreshes, 2);

  state.manual = {N: 0};
  component.render(state.manual, () => {});
  elements.gaAdd.onclick();
  assert.match(notices.at(-1)[0], /Enter the label analysis first/);
});
