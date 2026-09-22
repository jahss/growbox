(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxBlendSolver = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // The Blend finder matches elemental ppm delivered in solution, not label %.
  const MACRO_KEYS = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
  const MICRO_KEYS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const PPM_KEYS = [...MACRO_KEYS, ...MICRO_KEYS];
  // N-form targets (ppm), matched like macros. Only sources with a published N split
  // deliver them; N from a source without one counts toward N but no form.
  const FORM_KEYS = ['nitrateN', 'ammoniacalN', 'ureaN'];
  const FIT_KEYS = [...PPM_KEYS, ...FORM_KEYS];
  // All six micros together weigh about as much as one macro. A micro your sources
  // lack costs at most its full weight, so it never distorts N-P-K; a targeted micro
  // that would be heavily overdosed can still pull the dose down.
  const MICRO_WEIGHT = 1 / MICRO_KEYS.length;

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  // Elements the fit uses: only those with a target above 0 ppm. Errors are
  // relative to the target, so 10% off counts the same for N as for Ca.
  function fitRows(target) {
    return FIT_KEYS
      .map(key => ({key, value: number(target && target[key]), weight: MICRO_KEYS.includes(key) ? MICRO_WEIGHT : 1}))
      .filter(row => row.value > 0);
  }

  // Weighted relative RMS difference of `ppm` from `target` (0 = identical).
  function relativeError(ppm, target) {
    const rows = fitRows(target);
    if (!rows.length) return 0;
    const total = rows.reduce((sum, row) => sum + row.weight, 0);
    const squared = rows.reduce((sum, row) => sum + row.weight * ((number(ppm[row.key]) - row.value) / row.value) ** 2, 0);
    return Math.sqrt(squared / total);
  }

  // Solve the square system `matrix · x = vector` by Gaussian elimination with
  // partial pivoting. `matrix` is small (one row per source in use).
  function solveLinear(matrix, vector) {
    const size = vector.length;
    const a = matrix.map((row, index) => [...row, vector[index]]);
    for (let column = 0; column < size; column += 1) {
      let pivot = column;
      for (let row = column + 1; row < size; row += 1) {
        if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
      }
      [a[column], a[pivot]] = [a[pivot], a[column]];
      const lead = a[column][column] || 1e-300;
      for (let row = column + 1; row < size; row += 1) {
        const factor = a[row][column] / lead;
        for (let k = column; k <= size; k += 1) a[row][k] -= factor * a[column][k];
      }
    }
    const x = new Array(size).fill(0);
    for (let row = size - 1; row >= 0; row -= 1) {
      let sum = a[row][size];
      for (let k = row + 1; k < size; k += 1) sum -= a[row][k] * x[k];
      x[row] = sum / (a[row][row] || 1e-300);
    }
    return x;
  }

  // Least squares restricted to the columns in `active` (others fixed at 0).
  // A tiny ridge keeps duplicate or proportional sources solvable.
  function restrictedLeastSquares(A, b, active) {
    const columns = [...active];
    const normal = columns.map(i => columns.map(j => A.reduce((sum, row) => sum + row[i] * row[j], 0)));
    const trace = normal.reduce((sum, row, index) => sum + row[index], 0);
    normal.forEach((row, index) => { row[index] += 1e-12 * (trace || 1); });
    const rhs = columns.map(i => A.reduce((sum, row, r) => sum + row[i] * b[r], 0));
    const solution = solveLinear(normal, rhs);
    const z = new Array(A[0].length).fill(0);
    columns.forEach((column, index) => { z[column] = solution[index]; });
    return z;
  }

  // Non-negative least squares (Lawson–Hanson): minimize |A·x − b| with x ≥ 0.
  function nnls(A, b) {
    const n = A[0] ? A[0].length : 0;
    let x = new Array(n).fill(0);
    const active = new Set();
    const tolerance = 1e-10;
    const gradient = () => {
      const residual = b.map((value, r) => value - A[r].reduce((sum, a, j) => sum + a * x[j], 0));
      return Array.from({length: n}, (_, j) => A.reduce((sum, row, r) => sum + row[j] * residual[r], 0));
    };
    for (let outer = 0; outer < 3 * n + 10; outer += 1) {
      const w = gradient();
      let best = -1;
      for (let j = 0; j < n; j += 1) {
        if (!active.has(j) && w[j] > tolerance && (best < 0 || w[j] > w[best])) best = j;
      }
      if (best < 0) break;
      active.add(best);
      for (let inner = 0; inner < 3 * n + 10; inner += 1) {
        const z = restrictedLeastSquares(A, b, active);
        const blocking = [...active].filter(j => z[j] <= tolerance);
        if (!blocking.length) { x = z; break; }
        const alpha = Math.min(...blocking.map(j => x[j] / Math.max(x[j] - z[j], 1e-300)));
        x = x.map((value, j) => value + alpha * (z[j] - value));
        [...active].forEach(j => { if (x[j] <= tolerance) { active.delete(j); x[j] = 0; } });
        if (!active.size) break;
      }
    }
    return x.map(value => Math.max(0, value));
  }

  // Elemental (and N-form) ppm delivered by 1 g/US gal of each product.
  function ppmPerGram(product, chemistry) {
    const ppm = chemistry.ppmAtDose(product.analysis, 1);
    FORM_KEYS.forEach(key => { ppm[key] = chemistry.ppmAtDose({N: number(product.nitrogenForms && product.nitrogenForms[key])}, 1).N; });
    return ppm;
  }

  function deliveredPpm(products, doses, chemistry) {
    const columns = products.map(product => ppmPerGram(product, chemistry));
    const ppm = {};
    FIT_KEYS.forEach(key => {
      ppm[key] = columns.reduce((sum, column, index) => sum + doses[index] * number(column[key]), 0);
    });
    return ppm;
  }

  // Grams per US gallon of each product whose combined ppm is closest to `target`.
  function solveDoses(products, target, chemistry) {
    if (!Array.isArray(products) || products.length === 0) throw new TypeError('At least one fertilizer is required.');
    if (!chemistry || typeof chemistry.ppmAtDose !== 'function') throw new TypeError('A chemistry engine is required.');
    const rows = fitRows(target);
    if (!rows.length) throw new RangeError('Enter at least one target ppm.');
    const columns = products.map(product => ppmPerGram(product, chemistry));
    const A = rows.map(row => columns.map(column => Math.sqrt(row.weight) * number(column[row.key]) / row.value));
    const b = rows.map(row => Math.sqrt(row.weight));
    const doses = nnls(A, b);
    const ppm = deliveredPpm(products, doses, chemistry);
    return {doses, ppm, rms: relativeError(ppm, target)};
  }

  // What the nutrients still have to supply once the source water is in: target minus
  // water, per matched key. Keys the water alone already meets drop out (listed in `covered`).
  function subtractWater(target, water) {
    const remaining = {};
    const covered = [];
    FIT_KEYS.forEach(key => {
      const goal = number(target && target[key]);
      const supplied = number(water && water[key]);
      remaining[key] = goal > 0 ? Math.max(0, goal - supplied) : 0;
      if (goal > 0 && supplied >= goal) covered.push(key);
    });
    return {target: remaining, covered};
  }

  // Doses for what the water doesn't already supply. `ppm` is the nutrients alone,
  // `total` adds the water (every key it has, e.g. Na), and the fit scores the total.
  function solveWithWater(products, target, water, chemistry) {
    const {target: remaining, covered} = subtractWater(target, water);
    const doses = fitRows(remaining).length ? solveDoses(products, remaining, chemistry).doses : products.map(() => 0);
    const ppm = deliveredPpm(products, doses, chemistry);
    const total = {...(water || {})};
    Object.keys(ppm).forEach(key => { total[key] = number(total[key]) + ppm[key]; });
    return {doses, ppm, total, water: {...(water || {})}, covered, rms: relativeError(total, target)};
  }

  return Object.freeze({
    subtractWater,
    solveWithWater,
    MACRO_KEYS: Object.freeze([...MACRO_KEYS]),
    MICRO_KEYS: Object.freeze([...MICRO_KEYS]),
    PPM_KEYS: Object.freeze([...PPM_KEYS]),
    FORM_KEYS: Object.freeze([...FORM_KEYS]),
    fitRows,
    relativeError,
    nnls,
    deliveredPpm,
    solveDoses
  });
});
