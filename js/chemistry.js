(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxChemistry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const US_GALLON_LITERS = 3.785411784;
  const MG_PER_L_PER_G_PER_GAL = 1000 / US_GALLON_LITERS;
  const P_FROM_P2O5 = 0.436426;
  const K_FROM_K2O = 0.830151;
  const ANALYSIS_KEYS = ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const ELEMENT_KEYS = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function analysisOf(productOrAnalysis) {
    return productOrAnalysis && productOrAnalysis.analysis
      ? productOrAnalysis.analysis
      : (productOrAnalysis || {});
  }

  function elementalAnalysis(productOrAnalysis) {
    const analysis = analysisOf(productOrAnalysis);
    return {
      N: number(analysis.N),
      P: number(analysis.P2O5) * P_FROM_P2O5,
      K: number(analysis.K2O) * K_FROM_K2O,
      Ca: number(analysis.Ca),
      Mg: number(analysis.Mg),
      S: number(analysis.S),
      Fe: number(analysis.Fe),
      Mn: number(analysis.Mn),
      Zn: number(analysis.Zn),
      B: number(analysis.B),
      Cu: number(analysis.Cu),
      Mo: number(analysis.Mo)
    };
  }

  function ppmAtDose(productOrAnalysis, doseGPerGal) {
    const dose = number(doseGPerGal);
    if (dose < 0) throw new RangeError('Dose must be nonnegative.');
    const elemental = elementalAnalysis(productOrAnalysis);
    const ppm = {};
    ELEMENT_KEYS.forEach(key => {
      ppm[key] = dose * MG_PER_L_PER_G_PER_GAL * elemental[key] / 100;
    });
    return ppm;
  }

  function standardizedNitrogenDose(productOrAnalysis, targetNppm) {
    const analysis = analysisOf(productOrAnalysis);
    const nitrogenPercent = number(analysis.N);
    const target = number(targetNppm);
    if (target < 0) throw new RangeError('Nitrogen target must be nonnegative.');
    if (nitrogenPercent <= 0) return null;
    return target / (MG_PER_L_PER_G_PER_GAL * nitrogenPercent / 100);
  }

  function requireDensity(product) {
    const density = number(product && product.densityGPerMl);
    if (density <= 0) {
      const identity = product && (product.id || product.name || product.displayFormula);
      throw new Error('A positive densityGPerMl is required for volume dosing' + (identity ? ': ' + identity : '.'));
    }
    return density;
  }

  function rateMassGPerGal(product, rate) {
    if (rate && rate.gPerGal != null) {
      const mass = number(rate.gPerGal);
      if (mass < 0) throw new RangeError('Rate must be nonnegative.');
      return mass;
    }
    if (rate && rate.mLPerGal != null) {
      const volume = number(rate.mLPerGal);
      if (volume < 0) throw new RangeError('Rate must be nonnegative.');
      return volume * requireDensity(product);
    }
    return null;
  }

  function mixSystem(system, products, parts) {
    if (!system || !Array.isArray(system.components)) throw new TypeError('System components are required.');
    if (!Array.isArray(products) || products.length !== system.components.length) {
      throw new TypeError('Products must match the system component list.');
    }
    if (products.some(product => !product)) throw new Error('Every system component must resolve to a product.');

    const chosenParts = (parts || system.components.map(component => component.defaultParts == null ? 1 : component.defaultParts))
      .map(value => number(value));
    if (chosenParts.length !== products.length) throw new TypeError('Part values must match the system component list.');
    if (chosenParts.some(value => value < 0)) throw new RangeError('System part values must be nonnegative.');

    const massParts = chosenParts.map((value, index) => {
      if (system.ratioBasis === 'volume' && value > 0) return value * requireDensity(products[index]);
      return value;
    });
    const totalMass = massParts.reduce((sum, value) => sum + value, 0);
    if (totalMass <= 0) throw new RangeError('At least one system part must be greater than zero.');

    const weights = massParts.map(value => value / totalMass);
    const analysis = {};
    ANALYSIS_KEYS.forEach(key => {
      analysis[key] = products.reduce((sum, product, index) => {
        return sum + weights[index] * number(product.analysis && product.analysis[key]);
      }, 0);
    });

    const nitrogenFormKeys = new Set();
    products.forEach(product => Object.keys(product.nitrogenForms || {}).forEach(key => nitrogenFormKeys.add(key)));
    const nitrogenForms = {};
    nitrogenFormKeys.forEach(key => {
      nitrogenForms[key] = products.reduce((sum, product, index) => {
        return sum + weights[index] * number(product.nitrogenForms && product.nitrogenForms[key]);
      }, 0);
    });

    return { parts: chosenParts, massParts, weights, analysis, nitrogenForms };
  }

  return Object.freeze({
    US_GALLON_LITERS,
    MG_PER_L_PER_G_PER_GAL,
    P_FROM_P2O5,
    K_FROM_K2O,
    ANALYSIS_KEYS: Object.freeze([...ANALYSIS_KEYS]),
    ELEMENT_KEYS: Object.freeze([...ELEMENT_KEYS]),
    elementalAnalysis,
    ppmAtDose,
    standardizedNitrogenDose,
    rateMassGPerGal,
    mixSystem
  });
});
