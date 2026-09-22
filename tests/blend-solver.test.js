'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const chemistry = require('../js/chemistry.js');
const solver = require('../js/blend-solver.js');

const closeTo = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
};

function loadProducts() {
  const context = vm.createContext({window: {}});
  const source = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.js'), 'utf8');
  vm.runInContext(source, context, {filename: 'data/products.js'});
  return context.window.FERTILIZER_PRODUCTS;
}

const ppm = (analysis, grams) => chemistry.ppmAtDose(analysis, grams);

test('non-negative least squares clamps sources that would need a negative dose', () => {
  const x = solver.nnls([[1, 0], [0, 1], [1, 1]], [1, -1, 0]);
  closeTo(x[0], 0.5, 1e-9);
  closeTo(x[1], 0, 1e-12);
  const exact = solver.nnls([[2, 0], [0, 4]], [2, 4]);
  closeTo(exact[0], 1, 1e-9);
  closeTo(exact[1], 1, 1e-9);
});

test('finds the exact g/gal recipe that delivers a target ppm', () => {
  const nitrogen = {analysis: {N: 10}};
  const phosphate = {analysis: {N: 20, P2O5: 10}};
  const target = {N: ppm(nitrogen.analysis, 1).N + ppm(phosphate.analysis, 2).N, P: ppm(phosphate.analysis, 2).P};
  const result = solver.solveDoses([nitrogen, phosphate], target, chemistry);
  closeTo(result.doses[0], 1, 1e-8);
  closeTo(result.doses[1], 2, 1e-8);
  closeTo(result.rms, 0, 1e-9);
  closeTo(result.ppm.N, target.N, 1e-6);
});

test('matches ppm regardless of how concentrated the sources are', () => {
  // A strong salt reproduces a weak product's ppm exactly by using less of it.
  const weak = {analysis: {N: 2, P2O5: 1, K2O: 3}};
  const strong = {analysis: {N: 20, P2O5: 10, K2O: 30}};
  const target = ppm(weak.analysis, 10);
  const result = solver.solveDoses([strong], target, chemistry);
  closeTo(result.doses[0], 1, 1e-8);
  closeTo(result.rms, 0, 1e-9);
});

test('elements without a target are not matched', () => {
  const withSulfur = {analysis: {N: 10, S: 20}};
  const result = solver.solveDoses([withSulfur], {N: 100, S: 0}, chemistry);
  closeTo(result.ppm.N, 100, 1e-6);
  closeTo(result.rms, 0, 1e-9);
  assert.deepEqual(solver.fitRows({N: 100, S: 0, Fe: 0}).map(row => row.key), ['N']);
});

test('micros steer the recipe when targeted, and missing micros never distort the macros', () => {
  const plain = {analysis: {N: 10}};
  const withIron = {analysis: {N: 10, Fe: 0.2}};
  const ironTarget = solver.solveDoses([plain, withIron], {N: 100, Fe: ppm(withIron.analysis, 1).Fe * 0.5 * 100 / ppm(withIron.analysis, 1).N}, chemistry);
  closeTo(ironTarget.ppm.N, 100, 1e-6);
  closeTo(ironTarget.doses[0], ironTarget.doses[1], 1e-6);
  // Sources without iron can't meet an Fe target, but N is still matched exactly.
  const noIron = solver.solveDoses([plain], {N: 100, Fe: 1}, chemistry);
  closeTo(noIron.ppm.N, 100, 1e-6);
  closeTo(noIron.ppm.Fe, 0, 1e-12);
});

test('reproduces a real two-part program from its own parts', () => {
  const products = loadProducts();
  const core = products.find(product => product.id === 'athena-pro-core');
  const bloom = products.find(product => product.id === 'athena-pro-bloom-component');
  const target = chemistry.ppmAtDose(core.analysis, 1.2);
  const bloomPpm = chemistry.ppmAtDose(bloom.analysis, 2);
  Object.keys(target).forEach(key => { target[key] += bloomPpm[key]; });
  const result = solver.solveDoses([core, bloom], target, chemistry);
  closeTo(result.doses[0], 1.2, 1e-6);
  closeTo(result.doses[1], 2, 1e-6);
  closeTo(result.rms, 0, 1e-9);
});

test('rejects an empty selection or a target with nothing to match', () => {
  assert.throws(() => solver.solveDoses([], {N: 100}, chemistry), /At least one fertilizer/);
  assert.throws(() => solver.solveDoses([{analysis: {N: 10}}], {N: 0}, chemistry), /at least one target ppm/);
});

test('matches N-form targets from sources with a published N split', () => {
  const byId = new Map(loadProducts().map(product => [product.id, product]));
  const sources = ['calcium-nitrate-tetrahydrate', 'potassium-nitrate', 'ammonium-sulfate'].map(id => byId.get(id));
  const result = solver.solveDoses(sources, {N: 170, nitrateN: 150, ammoniacalN: 20}, chemistry);
  closeTo(result.ppm.nitrateN, 150, 1e-6);
  closeTo(result.ppm.ammoniacalN, 20, 1e-6);
  closeTo(result.rms, 0, 1e-9);
  // A source without a published split delivers N but no form.
  const unsplit = solver.solveDoses([{analysis: {N: 10}}], {nitrateN: 100}, chemistry);
  closeTo(unsplit.doses[0], 0, 1e-12);
});

test('subtracts source water from the target; elements the water already covers are not matched', () => {
  const {target, covered} = solver.subtractWater({N: 160, Ca: 50, Mg: 0, nitrateN: 150}, {N: 10, Ca: 60, Mg: 5, nitrateN: 10});
  assert.equal(target.N, 150);
  assert.equal(target.Ca, 0);
  assert.equal(target.Mg, 0);
  assert.equal(target.nitrateN, 140);
  assert.deepEqual(covered, ['Ca']);
});

test('solving with water makes up only the difference and scores the total in solution', () => {
  const byId = new Map(loadProducts().map(product => [product.id, product]));
  const sources = ['calcium-nitrate-tetrahydrate', 'potassium-nitrate'].map(id => byId.get(id));
  const water = {Ca: 40, Na: 25};
  const result = solver.solveWithWater(sources, {N: 150, Ca: 120}, water, chemistry);
  closeTo(result.ppm.Ca + 40, 120, 1e-6);
  closeTo(result.total.Ca, 120, 1e-6);
  closeTo(result.total.N, 150, 1e-6);
  assert.equal(result.total.Na, 25, 'water-only ions carry into the total');
  closeTo(result.rms, 0, 1e-9);
  assert.deepEqual(result.water, water);
  // Nothing left to match: zero doses, no crash.
  const covered = solver.solveWithWater(sources, {Ca: 30}, {Ca: 60}, chemistry);
  assert.deepEqual(covered.doses, [0, 0]);
  assert.deepEqual(covered.covered, ['Ca']);
});
