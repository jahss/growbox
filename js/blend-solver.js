(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxBlendSolver = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LABEL_KEYS = ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S'];
  const ELEMENT_KEYS = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function keysForMode(mode) {
    return mode === 'label' ? LABEL_KEYS : ELEMENT_KEYS;
  }

  function averageAnalysis(products, weights, mode, chemistry) {
    const keys = keysForMode(mode);
    const average = {};
    keys.forEach(key => { average[key] = 0; });
    products.forEach((product, index) => {
      const analysis = mode === 'label' ? product.analysis : chemistry.elementalAnalysis(product.analysis);
      keys.forEach(key => { average[key] += weights[index] * number(analysis[key]); });
    });
    return average;
  }

  function projectSimplex(values) {
    const sorted = [...values].sort((a, b) => b - a);
    let sum = 0;
    let boundary = -1;
    for (let index = 0; index < sorted.length; index += 1) {
      sum += sorted[index];
      if (sorted[index] * (index + 1) > sum - 1) boundary = index;
    }
    if (boundary < 0) return values.map(() => 1 / values.length);
    const threshold = (sorted.slice(0, boundary + 1).reduce((total, value) => total + value, 0) - 1) / (boundary + 1);
    return values.map(value => Math.max(0, value - threshold));
  }

  function solveBlend(products, target, mode, chemistry) {
    if (!Array.isArray(products) || products.length === 0) throw new TypeError('At least one fertilizer is required.');
    if (!chemistry || typeof chemistry.elementalAnalysis !== 'function') throw new TypeError('A chemistry engine is required.');

    const keys = keysForMode(mode);
    const columns = products.map(product => mode === 'label' ? product.analysis : chemistry.elementalAnalysis(product.analysis));
    const targetValues = keys.map(key => number(target && target[key]));
    const scales = targetValues.map(value => Math.max(Math.abs(value), 1));
    let weights = products.map(() => 1 / products.length);
    let frobenius = 0;

    keys.forEach((key, row) => {
      products.forEach((product, column) => {
        frobenius += (number(columns[column][key]) / scales[row]) ** 2;
      });
    });

    const step = 1 / Math.max(1e-9, 2 * frobenius);
    for (let iteration = 0; iteration < 30000; iteration += 1) {
      const prediction = keys.map(key => products.reduce((sum, product, index) => sum + weights[index] * number(columns[index][key]), 0));
      const gradient = weights.map((weight, column) => keys.reduce((sum, key, row) => {
        return sum + 2 * ((prediction[row] - targetValues[row]) / scales[row]) * (number(columns[column][key]) / scales[row]);
      }, 0));
      const next = projectSimplex(weights.map((weight, index) => weight - step * gradient[index]));
      const delta = Math.max(...next.map((weight, index) => Math.abs(weight - weights[index])));
      weights = next;
      if (delta < 1e-12) break;
    }

    const label = averageAnalysis(products, weights, 'label', chemistry);
    const element = averageAnalysis(products, weights, 'element', chemistry);
    const basis = mode === 'label' ? label : element;
    let squaredError = 0;
    keys.forEach((key, index) => {
      squaredError += ((basis[key] - targetValues[index]) / scales[index]) ** 2;
    });

    return {
      w: weights,
      label,
      element,
      rms: Math.sqrt(squaredError / keys.length)
    };
  }

  return Object.freeze({
    LABEL_KEYS: Object.freeze([...LABEL_KEYS]),
    ELEMENT_KEYS: Object.freeze([...ELEMENT_KEYS]),
    averageAnalysis,
    projectSimplex,
    solveBlend
  });
});
