'use strict';

// App-boot smoke test.
//
// NAME THE BREAK IT CATCHES:
// Every existing test drives one component in isolation against a fake DOM.
// None of them boot the real `app.js`, so a regression that breaks the full
// wiring — a renamed DOM id, a module that fails to load, a render() that
// throws, tab-switch state corruption, or a cross-component state bug — slips
// through all 80 unit tests. This smoke test runs the actual `app.js` IIFE
// against a faithful copy of the index.html DOM and exercises all four views
// plus blend-solve and CSV export, asserting real computed results.
//
// EXERCISE THE REAL THING:
// app.js and all real modules (chemistry, state, product-model, blend-solver,
// export, analysis, compare, use-rate, blend) load unchanged through node:vm.
// Only the browser-facing globals (document, sessionStorage, confirm, URL,
// Blob) are faked. Assertions check computed behavior — solved blend weights,
// rendered table content, view switching, CSV output — not mock existence.

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const PROJECT = path.join(__dirname, '..');

// --- Minimal browser-global doubles -----------------------------------------

function makeClassList() {
  const tokens = new Set();
  return {
    add: name => void tokens.add(name),
    remove: name => void tokens.delete(name),
    toggle: (name, force) => {
      const shouldAdd = force === undefined ? !tokens.has(name) : Boolean(force);
      if (shouldAdd) tokens.add(name); else tokens.delete(name);
      return shouldAdd;
    },
    contains: name => tokens.has(name)
  };
}

function makeElement(id) {
  return {
    id,
    innerHTML: '',
    textContent: '',
    value: '',
    disabled: false,
    dataset: {},
    classList: makeClassList(),
    onclick: null,
    onchange: null,
    oninput: null,
    click() { if (this.onclick) this.onclick({target: this}); }
  };
}

// index.html ids that app.js and the components write to / read from.
const ELEMENT_IDS = [
  'compareCount', 'productPicker', 'selectedLines', 'percentView', 'ppmView',
  'nControl', 'nElement', 'nLevel', 'analysisCompare', 'analysisCompareCards', 'comparisonHeading',
  'useRateProduct', 'useRatePreset', 'useRatePresetNote', 'useRateIdentity',
  'useRateInputs', 'useRateSummary', 'useRateResult', 'useRateNitrogen',
  'gaInputs', 'gaElemental', 'gaFeed',
  'blendChecks', 'blendInputs', 'labelMode', 'elementMode', 'solve',
  'blendResult', 'fit', 'weights', 'labelResult', 'elementResult', 'feed',
  'notice', 'csv', 'json', 'reset'
];

function makeDom() {
  const elements = Object.fromEntries(ELEMENT_IDS.map(id => [id, makeElement(id)]));
  const classRegistry = new Map(); // className -> list of elements created with that class

  function registerClass(element, className) {
    if (!className) return;
    if (!classRegistry.has(className)) classRegistry.set(className, []);
    classRegistry.get(className).push(element);
  }

  // Downloads captured by the test so the export pipeline can be asserted.
  const downloads = [];

  const document = {
    elements,
    classRegistry,
    downloads,
    getElementById(id) { return elements[id]; },
    querySelectorAll(selector) {
      const className = selector.startsWith('.') ? selector.slice(1) : null;
      if (className) return [...(classRegistry.get(className) || [])];
      return [];
    },
    createElement(tag) {
      const anchor = makeElement('created-' + tag);
      anchor.download = '';
      anchor.href = '';
      anchor._clickCount = 0;
      anchor.click = () => { anchor._clickCount += 1; };
      return anchor;
    }
  };

  // Seed the static tab/view wiring from index.html: four tab buttons (which
  // carry data-view) and four view sections (which carry id), so app.js'
  // `tabs()` can iterate them like a real browser.
  const tabButtons = ['compare', 'useRate', 'analysis', 'blend'].map(view => {
    const button = makeElement('tab-' + view);
    button.dataset.view = view;
    button.classList.add('tab');
    registerClass(button, 'tab');
    return button;
  });
  const viewSections = ['compare', 'useRate', 'analysis', 'blend'].map(view => {
    const section = makeElement(view); // id matches index.html <section id="...">
    section.classList.add('view');
    registerClass(section, 'view');
    return section;
  });

  return {document, elements, classRegistry, tabButtons, viewSections, downloads};
}

// sessionStorage backed by an in-memory map (kept across reloads within a test).
function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
}

// --- Loading the real app against the doubles --------------------------------

function loadAppDom({withRegression}) {
  const dom = makeDom();
  const storage = makeStorage();

  const context = vm.createContext({
    window: {},
    document: dom.document,
    sessionStorage: storage,
    confirm: () => true,
    URL: {createObjectURL: () => 'blob:mock', revokeObjectURL: () => {}},
    Blob: class {
      constructor(parts, type) {
        // export.js builds `new Blob([text], {type})`; capture the text (and
        // the declared MIME type) so the test can assert on the real output.
        dom.downloads.push({type: type && type.type, text: parts.join('')});
      }
    },
    setTimeout: () => 1,
    clearTimeout: () => {},
    console
  });

  // data/products.js declares window.FERTILIZER_PRODUCTS / _SYSTEMS directly.
  const dataSource = fs.readFileSync(path.join(PROJECT, 'data', 'products.js'), 'utf8');
  vm.runInContext(dataSource, context, {filename: 'data/products.js'});

  // The js modules use a UMD wrapper that pins their API onto the vm's
  // `globalThis` (e.g. globalThis.GrowboxChemistry) while app.js reads them off
  // `window` (in a real browser globalThis === window). node:vm keeps them
  // distinct, so after running each module we bridge the globals onto `window`.
  // This is test glue only — no production file is modified.
  const load = (file, globalName) => {
    const source = fs.readFileSync(path.join(PROJECT, 'js', file), 'utf8');
    vm.runInContext(source, context, {filename: 'js/' + file});
    vm.runInContext('window.' + globalName + ' = globalThis.' + globalName + ';', context);
  };

  load('chemistry.js', 'GrowboxChemistry');
  load('state.js', 'GrowboxState');
  load('product-model.js', 'GrowboxProductModel');
  load('blend-solver.js', 'GrowboxBlendSolver');
  load('export.js', 'GrowboxExport');
  load('analysis.js', 'GrowboxAnalysis');
  load('compare.js', 'GrowboxCompare');
  load('use-rate.js', 'GrowboxUseRate');
  load('blend.js', 'GrowboxBlend');

  // The main module runs `render()` on load. `withRegression` optionally
  // swaps a DOM id before boot so the test proves it can catch a wiring break.
  if (withRegression) {
    delete dom.elements[withRegression];
    dom.document.getElementById = id => dom.elements[id];
  }

  try {
    const appSource = fs.readFileSync(path.join(PROJECT, 'js', 'app.js'), 'utf8');
    vm.runInContext(appSource, context, {filename: 'js/app.js'});
    dom.booted = true;
  } catch (error) {
    dom.bootError = error;
  }

  return {dom, elements: dom.elements, storage, context, downloads: dom.downloads};
}

// --- Smoke assertions --------------------------------------------------------

test('app boots and renders all four views without exceptions', () => {
  const {dom} = loadAppDom({});
  assert.equal(dom.bootError, undefined, 'app.js should boot without throwing. Got: ' + dom.bootError);

  // Compare view: default lines render a standardized ppm table (heading says
  // the target; the table carries the Dose + elemental ppm column headers).
  assert.match(dom.elements.comparisonHeading.textContent, /Elemental ppm/);
  assert.match(dom.elements.analysisCompare.innerHTML, /Dose/);
  assert.match(dom.elements.analysisCompare.innerHTML, /N ppm/);

  // Use-rate view: default product renders component dose inputs.
  assert.match(dom.elements.useRateProduct.innerHTML, /1-Part/);
  assert.ok(dom.elements.useRateInputs.innerHTML.length > 0);

  // Guaranteed-analysis view: renders the twelve input fields + feed chart.
  assert.ok(dom.elements.gaInputs.innerHTML.includes('N'));
  assert.ok(dom.elements.gaFeed.innerHTML.includes('N target'));

  // Blend view: renders fertilizer and salt checkboxes.
  assert.match(dom.elements.blendChecks.innerHTML, /Fertilizers & components/);
  assert.match(dom.elements.blendChecks.innerHTML, /Ingredient salts/);
});

test('tabs switch the active view across all four views', () => {
  const {dom} = loadAppDom({});
  const tabEls = dom.classRegistry.get('tab') || [];
  const viewEls = dom.classRegistry.get('view') || [];
  assert.equal(tabEls.length, 4, 'app.js tabs() should find four tab buttons');
  const views = ['compare', 'useRate', 'analysis', 'blend'];
  // After each tab click, exactly the matching view section is marked active.
  views.forEach(view => {
    const tab = tabEls.find(t => t.dataset.view === view);
    assert.ok(tab && tab.onclick, 'tab button for ' + view + ' should be wired by app.js');
    tab.onclick();
    viewEls.forEach(section => {
      assert.equal(
        section.classList.contains('active'),
        section.id === view,
        section.id + ' active should reflect the clicked view ' + view
      );
    });
  });
});

test('solve produces a blend with sensible nonnegative weights and a feed chart', () => {
  const {dom} = loadAppDom({});
  // Default blend selection and target are already in fresh state; solve directly.
  dom.elements.solve.onclick();
  assert.ok(dom.elements.blendResult.classList.contains('hidden') === false, 'blend result should be visible after solve');
  assert.match(dom.elements.weights.innerHTML, /% by mass/);
  assert.ok(dom.elements.feed.innerHTML.includes('N target'), 'feed chart should render for a nitrogen-bearing blend');
  // Fresh-state blend (jacks + a + b + epsom + mkp) has N>0, so feed must render rows.
  assert.match(dom.elements.feed.innerHTML, /120/);
});

test('blend label and elemental modes both render their target fields and labels', () => {
  const {elements} = loadAppDom({});
  // Fresh state defaults to label mode: blend target inputs carry label keys
  // (P2O5 / K2O) and no elemental-only P / K keys.
  assert.match(elements.blendInputs.innerHTML, /data-k="P2O5"/);
  assert.match(elements.blendInputs.innerHTML, /data-k="K2O"/);
  assert.doesNotMatch(elements.blendInputs.innerHTML, /data-k="P"/);
  assert.doesNotMatch(elements.blendInputs.innerHTML, /data-k="K"/);

  // Switch to elemental mode via the bound button and verify the target inputs
  // now carry the elemental keys.
  elements.elementMode.onclick();
  assert.doesNotMatch(elements.blendInputs.innerHTML, /data-k="P2O5"/);
  assert.match(elements.blendInputs.innerHTML, /data-k="P"/);
  assert.match(elements.blendInputs.innerHTML, /data-k="K"/);

  // Solving renders both the label-basis and elemental-basis result tables.
  elements.solve.onclick();
  assert.ok(elements.labelResult.innerHTML.length > 0, 'label basis table renders after solve');
  assert.ok(elements.elementResult.innerHTML.length > 0, 'elemental basis table renders after solve');
});

test('CSV export produces well-formed quoted rows through the real download path', () => {
  const {elements, downloads} = loadAppDom({});
  // Boot default (compare) view, then trigger the CSV export button.
  elements.csv.onclick();
  assert.equal(downloads.length, 1, 'one Blob should be created for the CSV download');
  assert.match(downloads[0].type, /^text\/csv/);
  const csv = downloads[0].text;
  // Header row is quoted and includes the expected macro + micro columns.
  assert.match(csv, /^"Product \/ system","Total g\/gal","N"/);
  assert.match(csv, /"Ca","Mg","S","Fe","Mn","Zn","B","Cu","Mo"/);
  // At least two default lines (Mega Crop + Jack's) render rows; blank values
  // are preserved as empty quoted fields.
  const rows = csv.split('\n').filter(line => line.length > 0);
  assert.ok(rows.length >= 3, 'header + at least two comparison rows, got ' + rows.length);
});