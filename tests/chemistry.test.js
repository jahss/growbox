'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const chemistry = require('../js/chemistry.js');

const closeTo = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
};

test('uses the canonical unit and oxide conversion constants', () => {
  assert.equal(chemistry.US_GALLON_LITERS, 3.785411784);
  closeTo(chemistry.MG_PER_L_PER_G_PER_GAL, 264.1720523581484, 1e-12);
  assert.equal(chemistry.P_FROM_P2O5, 0.436426);
  assert.equal(chemistry.K_FROM_K2O, 0.830151);
});

test('converts label P2O5 and K2O to elemental P and K', () => {
  const elemental = chemistry.elementalAnalysis({N: 0, P2O5: 52, K2O: 34});
  closeTo(elemental.P, 22.694152);
  closeTo(elemental.K, 28.225134);
});

test('MKP 0-52-34 at 1 g/gal supplies about 60 ppm P and 74.6 ppm K', () => {
  const ppm = chemistry.ppmAtDose({N: 0, P2O5: 52, K2O: 34}, 1);
  closeTo(ppm.P, 59.951607, 0.000001);
  closeTo(ppm.K, 74.562916, 0.000001);
});

test('standardizes Mega Crop 11-5-14 to the requested nitrogen level', () => {
  const analysis = {N: 11, P2O5: 5, K2O: 14, Ca: 7.5, Mg: 1.4, S: 2};
  const dose = chemistry.standardizedNitrogenDose(analysis, 160);
  closeTo(dose, 5.506053504, 0.000000001);
  closeTo(chemistry.ppmAtDose(analysis, dose).N, 160);
});

test("standardizes Jack's 12-4-16 and preserves elemental relationships", () => {
  const analysis = {N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 0};
  const dose = chemistry.standardizedNitrogenDose(analysis, 160);
  const ppm = chemistry.ppmAtDose(analysis, dose);
  closeTo(dose, 5.047215, 0.000001);
  closeTo(ppm.N, 160);
  closeTo(ppm.P, 23.276053333, 0.000001);
  closeTo(ppm.K, 177.09888, 0.000001);
});

test("combines Jack's 3-2-1 components on a mass basis", () => {
  const system = {
    ratioBasis: 'mass',
    components: [{defaultParts: 3.6}, {defaultParts: 2.4}, {defaultParts: 1.1}]
  };
  const products = [
    {analysis: {N: 5, P2O5: 12, K2O: 26, Mg: 6.3, S: 8.5}, nitrogenForms: {nitrateN: 5}},
    {analysis: {N: 15, Ca: 18}, nitrogenForms: {nitrateN: 15}},
    {analysis: {Mg: 9.8, S: 13}}
  ];
  const mix = chemistry.mixSystem(system, products);
  closeTo(mix.weights.reduce((sum, value) => sum + value, 0), 1);
  closeTo(mix.analysis.N, 54 / 7.1);
  closeTo(mix.nitrogenForms.nitrateN, mix.analysis.N);
  const dose = chemistry.standardizedNitrogenDose(mix.analysis, 160);
  closeTo(chemistry.ppmAtDose(mix.analysis, dose).N, 160);
});

test('converts volume ratios to mass ratios using each component density', () => {
  const system = {
    ratioBasis: 'volume',
    components: [{defaultParts: 1}, {defaultParts: 1}]
  };
  const products = [
    {id: 'a', densityGPerMl: 1.2, analysis: {N: 4}},
    {id: 'b', densityGPerMl: 1.1, analysis: {N: 1}}
  ];
  const mix = chemistry.mixSystem(system, products);
  closeTo(mix.massParts[0], 1.2);
  closeTo(mix.massParts[1], 1.1);
  closeTo(mix.analysis.N, 5.9 / 2.3);
});

test('requires density for volume ratios and volume manufacturer rates', () => {
  const product = {id: 'unknown-liquid', analysis: {N: 4}};
  assert.throws(
    () => chemistry.mixSystem({ratioBasis: 'volume', components: [{defaultParts: 1}]}, [product]),
    /densityGPerMl/
  );
  assert.throws(() => chemistry.rateMassGPerGal(product, {mLPerGal: 5}), /densityGPerMl/);
});

test('converts verified liquid volume rates to mass', () => {
  closeTo(chemistry.rateMassGPerGal({densityGPerMl: 1.179092}, {mLPerGal: 11}), 12.970012);
});

test('normalizes mass and density-aware volume doses to grams per liter', () => {
  closeTo(chemistry.doseGramsPerLiter({}, 3.785411784, 'g/gal'), 1);
  closeTo(chemistry.doseGramsPerLiter({}, 1, 'g/L'), 1);
  closeTo(chemistry.doseGramsPerLiter({densityGPerMl: 1.2}, 2, 'mL/L'), 2.4);
  closeTo(chemistry.doseGramsPerLiter({densityGPerMl: 1.2}, 3.785411784, 'mL/gal'), 1.2);
  assert.throws(() => chemistry.doseGramsPerLiter({}, 1, 'mL/L'), /densityGPerMl/);
  assert.throws(() => chemistry.doseGramsPerLiter({}, 1, 'ounces'), /Unsupported dose unit/);
});

test('calculates a recipe from canonical grams-per-liter doses', () => {
  const recipe = chemistry.recipeAtDoses([
    {product: {analysis: {N: 10, P2O5: 5}, nitrogenForms: {nitrateN: 8, ammoniacalN: 2}}, gramsPerLiter: 1},
    {product: {analysis: {N: 0, K2O: 20}}, gramsPerLiter: 0.5}
  ]);
  closeTo(recipe.totalGPerLiter, 1.5);
  closeTo(recipe.ppm.N, 100);
  closeTo(recipe.ppm.P, 50 * chemistry.P_FROM_P2O5);
  closeTo(recipe.ppm.K, 100 * chemistry.K_FROM_K2O);
  closeTo(recipe.nitrogenForms.nitrateN, 80);
  closeTo(recipe.nitrogenForms.ammoniacalN, 20);
});

test('handles zero nitrogen and rejects invalid negative inputs', () => {
  assert.equal(chemistry.standardizedNitrogenDose({N: 0}, 160), null);
  assert.throws(() => chemistry.standardizedNitrogenDose({N: 12}, -1), /nonnegative/);
  assert.throws(() => chemistry.ppmAtDose({N: 12}, -1), /nonnegative/);
});

test('rejects an all-zero multipart ratio', () => {
  assert.throws(
    () => chemistry.mixSystem(
      {ratioBasis: 'mass', components: [{defaultParts: 1}, {defaultParts: 1}]},
      [{analysis: {N: 5}}, {analysis: {N: 15}}],
      [0, 0]
    ),
    /greater than zero/
  );
});
