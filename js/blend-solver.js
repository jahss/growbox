(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxBlendSolver = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LABEL_KEYS = ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S'];
  const ELEMENT_KEYS = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
  const MICRO_KEYS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  // Micros only count when the target asks for them, and all six together weigh
  // about as much as one macro so they can steer but not override N-P-K.
  const MICRO_WEIGHT = 1 / MICRO_KEYS.length;
  const MICRO_SCALE_FLOOR = 0.01;

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function keysForMode(mode) {
    return mode === 'label' ? LABEL_KEYS : ELEMENT_KEYS;
  }

  function allKeysForMode(mode) {
    return [...keysForMode(mode), ...MICRO_KEYS];
  }

  // Rows the fit uses, with their relative scale and weight.
  function fitRows(target, mode) {
    return allKeysForMode(mode).map(key => {
      const value = number(target && target[key]);
      const micro = MICRO_KEYS.includes(key);
      return {key, value, micro, scale: Math.max(Math.abs(value), micro ? MICRO_SCALE_FLOOR : 1), weight: micro ? MICRO_WEIGHT : 1};
    }).filter(row => !row.micro || row.value > 0);
  }

  // Weighted relative RMS difference of `analysis` from `target` (0 = identical).
  function relativeError(analysis, target, mode) {
    const rows = fitRows(target, mode);
    const total = rows.reduce((sum, row) => sum + row.weight, 0);
    const squared = rows.reduce((sum, row) => sum + row.weight * ((number(analysis[row.key]) - row.value) / row.scale) ** 2, 0);
    return Math.sqrt(squared / total);
  }

  function averageAnalysis(products, weights, mode, chemistry) {
    const keys = allKeysForMode(mode);
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

    const rows = fitRows(target, mode);
    const columns = products.map(product => mode === 'label' ? product.analysis : chemistry.elementalAnalysis(product.analysis));
    let weights = products.map(() => 1 / products.length);
    let frobenius = 0;

    rows.forEach(row => {
      products.forEach((product, column) => {
        frobenius += row.weight * (number(columns[column][row.key]) / row.scale) ** 2;
      });
    });

    const step = 1 / Math.max(1e-9, 2 * frobenius);
    for (let iteration = 0; iteration < 30000; iteration += 1) {
      const prediction = rows.map(row => products.reduce((sum, product, index) => sum + weights[index] * number(columns[index][row.key]), 0));
      const gradient = weights.map((weight, column) => rows.reduce((sum, row, index) => {
        return sum + 2 * row.weight * ((prediction[index] - row.value) / row.scale) * (number(columns[column][row.key]) / row.scale);
      }, 0));
      const next = projectSimplex(weights.map((weight, index) => weight - step * gradient[index]));
      const delta = Math.max(...next.map((weight, index) => Math.abs(weight - weights[index])));
      weights = next;
      if (delta < 1e-12) break;
    }

    const label = averageAnalysis(products, weights, 'label', chemistry);
    const element = averageAnalysis(products, weights, 'element', chemistry);
    const basis = mode === 'label' ? label : element;

    return {
      w: weights,
      label,
      element,
      rms: relativeError(basis, target, mode)
    };
  }

  return Object.freeze({
    LABEL_KEYS: Object.freeze([...LABEL_KEYS]),
    ELEMENT_KEYS: Object.freeze([...ELEMENT_KEYS]),
    MICRO_KEYS: Object.freeze([...MICRO_KEYS]),
    allKeysForMode,
    relativeError,
    averageAnalysis,
    projectSimplex,
    solveBlend
  });
});
