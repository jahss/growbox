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

test('projects candidate weights onto a nonnegative unit simplex', () => {
  assert.deepEqual(solver.projectSimplex([-1, 2]), [0, 1]);
  const projected = solver.projectSimplex([0.2, 0.3, 0.9]);
  closeTo(projected.reduce((sum, value) => sum + value, 0), 1);
  projected.forEach(value => assert.ok(value >= 0));
});

test('finds an exact two-product label-analysis blend', () => {
  const products = [
    {analysis: {N: 10, P2O5: 0, K2O: 0, Ca: 0, Mg: 0, S: 0}},
    {analysis: {N: 20, P2O5: 10, K2O: 0, Ca: 0, Mg: 0, S: 0}}
  ];
  const result = solver.solveBlend(products, {N: 15, P2O5: 5, K2O: 0, Ca: 0, Mg: 0, S: 0}, 'label', chemistry);
  closeTo(result.w[0], 0.5);
  closeTo(result.w[1], 0.5);
  closeTo(result.rms, 0);
  closeTo(result.label.N, 15);
  closeTo(result.element.P, 5 * chemistry.P_FROM_P2O5);
});

test('supports elemental target mode', () => {
  const products = [
    {analysis: {N: 10, P2O5: 10, K2O: 0, Ca: 0, Mg: 0, S: 0}},
    {analysis: {N: 10, P2O5: 0, K2O: 10, Ca: 0, Mg: 0, S: 0}}
  ];
  const target = {
    N: 10,
    P: 5 * chemistry.P_FROM_P2O5,
    K: 5 * chemistry.K_FROM_K2O,
    Ca: 0, Mg: 0, S: 0
  };
  const result = solver.solveBlend(products, target, 'element', chemistry);
  closeTo(result.w[0], 0.5, 1e-8);
  closeTo(result.w[1], 0.5, 1e-8);
  closeTo(result.rms, 0, 1e-8);
});

test('preserves the current default Blend Finder regression result', () => {
  const products = loadProducts();
  const ids = ['jacks-12-4-16', 'jacks-5-12-26-a', 'jacks-15-0-0-b', 'jacks-epsom', 'mkp-0-52-34'];
  const selected = ids.map(id => products.find(product => product.id === id));
  const result = solver.solveBlend(selected, {N: 12, P2O5: 5, K2O: 16, Ca: 7, Mg: 2, S: 2}, 'label', chemistry);
  const expectedWeights = [0.559819478839, 0.212054363618, 0.220300297289, 0, 0.007825860254];
  result.w.forEach((weight, index) => closeTo(weight, expectedWeights[index], 1e-10));
  closeTo(result.rms, 0.123243630187, 1e-10);
  closeTo(result.label.N, 11.082610023492, 1e-10);
  closeTo(result.element.K, 12.233606849487, 1e-10);
});

test('rejects an empty fertilizer selection', () => {
  assert.throws(() => solver.solveBlend([], {}, 'label', chemistry), /At least one fertilizer/);
});

test('micros only steer the fit when targeted, and never outweigh the macros', () => {
  const plain = {analysis: {N: 10, P2O5: 0, K2O: 0, Ca: 0, Mg: 0, S: 0}};
  const withIron = {analysis: {N: 10, P2O5: 0, K2O: 0, Ca: 0, Mg: 0, S: 0, Fe: 0.2}};
  const noIronTarget = solver.solveBlend([plain, withIron], {N: 10}, 'label', chemistry);
  closeTo(noIronTarget.rms, 0, 1e-9);
  const ironTarget = solver.solveBlend([plain, withIron], {N: 10, Fe: 0.1}, 'label', chemistry);
  closeTo(ironTarget.w[1], 0.5, 1e-6);
  closeTo(ironTarget.label.Fe, 0.1, 1e-6);
  // Matching N (a macro) wins over matching Fe when they conflict.
  const lowN = {analysis: {N: 2, Fe: 0.2}};
  const conflict = solver.solveBlend([plain, lowN], {N: 10, Fe: 0.2}, 'label', chemistry);
  assert.ok(conflict.w[0] > 0.5, 'weights favor the N match: ' + conflict.w[0]);
  assert.deepEqual(solver.allKeysForMode('element'), ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo']);
});
