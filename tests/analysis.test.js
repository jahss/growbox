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

test('Label → ppm takes optional N forms and shows their share of N', () => {
  assert.match(analysisModule.inputsHtml({nitrateN: 11, ammoniacalN: 1}, format), /<div id="gaNForms" class="n-forms"><label>Nitrate N %<input class="gai nf-ga" data-k="nitrateN"[^>]*value="11"/);
  assert.equal(analysisModule.nitrogenShareHtml({N: 12}, format), '');
  assert.match(analysisModule.nitrogenShareHtml({N: 12, nitrateN: 10.5, ammoniacalN: 1.5}, format), /Of the N: 87\.5% nitrate · 12\.5% ammonium\. Most hydro recipes keep ammonium under about 10–15% of N\./);
  assert.match(analysisModule.nitrogenShareHtml({N: 12, nitrateN: 9}, format), /75% nitrate · 25% not given/);
  assert.match(analysisModule.nitrogenShareHtml({N: 2, ureaN: 3}, format), /Nitrogen forms add up to 3%, more than total N \(2%\)/);
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
  assert.deepEqual(state.customProducts[0], {id: 'custom-1', name: 'My bloom', analysis: {N: 3, P2O5: 1, K2O: 5, Ca: 0, Mg: 0, S: 0, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0}, nitrogenForms: {}, densityGPerMl: 1.2});
  assert.deepEqual(state.compare, ['a', 'custom-1']);
  assert.match(notices[0][0], /Added “My bloom” to Compare/);
  assert.match(elements.gaSaved.innerHTML, /My bloom.*3-1-5 · 1\.2 g\/mL/);

  state.manual.nitrateN = 2.5;
  state.manual.ammoniacalN = 0.5;
  elements.gaAdd.onclick();
  assert.deepEqual(state.customProducts[0].nitrogenForms, {nitrateN: 2.5, ammoniacalN: 0.5});
  state.manual.ureaN = 1;
  elements.gaAdd.onclick();
  assert.match(notices.at(-1)[0], /Nitrogen forms add up to more than total N \(3%\)/);
  delete state.manual.ureaN;

  state.manual.K2O = 6;
  elements.gaName.value = 'my BLOOM';
  elements.gaAdd.onclick();
  assert.equal(state.customProducts.length, 1, 'same name (any case) updates');
  assert.equal(state.customProducts[0].analysis.K2O, 6);
  assert.deepEqual(state.compare, ['a', 'custom-1']);
  assert.equal(refreshes, 3);

  state.manual = {N: 0};
  component.render(state.manual, () => {});
  elements.gaAdd.onclick();
  assert.match(notices.at(-1)[0], /Enter the label analysis first/);
});

test('N forms fill a blank N with their total, never override a typed N, and toggle open', () => {
  const field = value => Object.assign(new EventTarget(), {value});
  const nInput = field('');
  const forms = [field(''), field(''), field('')];
  const hidden = new Set(['hidden']);
  const box = {classList: {toggle(name) { if (hidden.has(name)) { hidden.delete(name); return false; } hidden.add(name); return true; }}};
  const toggle = {textContent: 'N forms ▸', attrs: {}, setAttribute(key, value) { this.attrs[key] = value; }};
  const elements = {xNToggle: toggle, xNForms: box, xN: nInput};
  const document = {getElementById: id => elements[id], querySelectorAll: selector => selector === '.nf-x' ? forms : []};
  let nEvents = 0;
  nInput.addEventListener('input', () => { nEvents += 1; });
  analysisModule.bindNitrogenField(document, 'x', format);
  const type = (input, value) => { input.value = value; input.dispatchEvent(new Event('input')); };
  type(forms[0], '10');
  assert.equal(nInput.value, '10');
  type(forms[1], '2.5');
  assert.equal(nInput.value, '12.5');
  assert.equal(nEvents, 2, 'N handlers see each fill');
  type(nInput, '15');
  type(forms[2], '1');
  assert.equal(nInput.value, '15', 'a typed N is never overwritten');
  toggle.onclick();
  assert.equal(toggle.textContent, 'N forms ▾');
  assert.equal(toggle.attrs['aria-expanded'], 'true');
});

test('arrow steps: 0.1 for macro and N-form %, 0.01 for micro %, 1 for N-form ppm', () => {
  const html = analysisModule.inputsHtml({}, format);
  assert.match(html, /data-k="N" type="number" min="0" step="\.1"/);
  assert.match(html, /data-k="K2O" type="number" min="0" step="\.1"/);
  assert.match(html, /data-k="Fe" type="number" min="0" step="\.01"/);
  assert.match(html, /data-k="nitrateN" type="number" min="0" step="\.1"/);
  assert.match(analysisModule.nitrogenFieldHtml('x', 'N ppm', '', 'bi', {}, 'ppm', '', format), /data-k="nitrateN" type="number" min="0" step="1"/);
});
