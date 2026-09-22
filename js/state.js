(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'growbox-fert-tool-v07';
  const MAX_COMPARE_LINES = 10;
  const MAX_CUSTOM_PRODUCTS = 20;
  const CUSTOM_ANALYSIS_KEYS = ['N', 'P2O5', 'K2O', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];

  function freshState() {
    return {
      view: 'compare',
      compare: [],
      systemCompare: ['athena-pro-bloom', 'cropsalt-bloom', 'jacks-2part-0-12-26'],
      systemParts: {},
      systemProfiles: {},
      systemExcluded: {},
      customProducts: [],
      compareMode: 'ppm',
      n: 160,
      compareElement: 'N',
      manual: {
        N: 0, P2O5: 0, K2O: 0, Ca: 0, Mg: 0, S: 0,
        Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0
      },
      useRate: {
        selection: 'p:jacks-12-4-16',
        preset: 'custom',
        doses: {'jacks-12-4-16': {amount: 1, unit: 'g/gal'}}
      },
      blend: {
        mode: 'label',
        ids: ['jacks-12-4-16', 'jacks-5-12-26-a', 'jacks-15-0-0-b', 'jacks-epsom', 'mkp-0-52-34'],
        target: {N: 12, P2O5: 5, K2O: 16, P: 2.18, K: 13.28, Ca: 7, Mg: 2, S: 2},
        result: null
      }
    };
  }

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function normalizeState(input, products, systems) {
    const defaults = freshState();
    const candidate = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const state = {...defaults, ...candidate};
    const availableProducts = Array.isArray(products) ? products : [];
    const availableSystems = Array.isArray(systems) ? systems : [];

    state.manual = candidate.manual && typeof candidate.manual === 'object' && !Array.isArray(candidate.manual)
      ? {...defaults.manual, ...candidate.manual}
      : defaults.manual;
    state.blend = candidate.blend && typeof candidate.blend === 'object' && !Array.isArray(candidate.blend)
      ? {...defaults.blend, ...candidate.blend}
      : defaults.blend;
    state.blend.target = state.blend.target && typeof state.blend.target === 'object' && !Array.isArray(state.blend.target)
      ? {...defaults.blend.target, ...state.blend.target}
      : defaults.blend.target;
    if (!Array.isArray(state.blend.ids)) state.blend.ids = defaults.blend.ids;
    state.blend.ids = state.blend.ids.filter(id => availableProducts.some(product => product.id === id));
    if (!['label', 'element'].includes(state.blend.mode)) state.blend.mode = defaults.blend.mode;
    if (!['compare', 'useRate', 'analysis', 'blend'].includes(state.view)) state.view = defaults.view;

    state.useRate = candidate.useRate && typeof candidate.useRate === 'object' && !Array.isArray(candidate.useRate)
      ? {...defaults.useRate, ...candidate.useRate}
      : defaults.useRate;
    const [useRateKind, useRateId] = String(state.useRate.selection || '').split(':');
    const useRateSelectionExists = useRateKind === 'p'
      ? availableProducts.some(product => product.id === useRateId && product.compareGroup === '1-part')
      : useRateKind === 's' && availableSystems.some(system => system.id === useRateId);
    if (!useRateSelectionExists) state.useRate.selection = defaults.useRate.selection;
    state.useRate.preset = state.useRate.preset === 'custom' || /^\d+$/.test(String(state.useRate.preset))
      ? String(state.useRate.preset)
      : 'custom';
    const supportedUnits = new Set(['g/gal', 'g/L', 'mL/gal', 'mL/L']);
    const candidateDoses = state.useRate.doses && typeof state.useRate.doses === 'object' && !Array.isArray(state.useRate.doses)
      ? state.useRate.doses
      : {};
    state.useRate.doses = {};
    Object.keys(candidateDoses).forEach(id => {
      const dose = candidateDoses[id];
      if (!dose || typeof dose !== 'object' || Array.isArray(dose)) return;
      const amount = Math.max(0, number(dose.amount));
      const unit = supportedUnits.has(dose.unit) ? dose.unit : 'g/gal';
      state.useRate.doses[id] = {amount, unit};
    });

    if (!Array.isArray(state.systemCompare)) state.systemCompare = [];
    delete state.rateChoice;
    if (!state.systemParts || typeof state.systemParts !== 'object' || Array.isArray(state.systemParts)) state.systemParts = {};
    else state.systemParts = {...state.systemParts};
    if (!state.systemProfiles || typeof state.systemProfiles !== 'object' || Array.isArray(state.systemProfiles)) state.systemProfiles = {};
    else state.systemProfiles = {...state.systemProfiles};
    if (!state.systemExcluded || typeof state.systemExcluded !== 'object' || Array.isArray(state.systemExcluded)) state.systemExcluded = {};
    else state.systemExcluded = {...state.systemExcluded};
    if (!['percent', 'ppm'].includes(state.compareMode)) state.compareMode = 'ppm';
    if (!['N', 'P', 'K'].includes(state.compareElement)) state.compareElement = 'N';

    const customIds = new Set();
    state.customProducts = (Array.isArray(state.customProducts) ? state.customProducts : [])
      .filter(item => item && typeof item === 'object' && /^custom-[a-z0-9]+$/.test(String(item.id)) && !customIds.has(item.id) && customIds.add(item.id))
      .slice(0, MAX_CUSTOM_PRODUCTS)
      .map(item => {
        const analysis = {};
        CUSTOM_ANALYSIS_KEYS.forEach(key => { analysis[key] = Math.max(0, number(item.analysis && item.analysis[key])); });
        const name = String(item.name == null ? '' : item.name).trim().slice(0, 60);
        return {
          id: item.id,
          name: name || [analysis.N, analysis.P2O5, analysis.K2O].join('-'),
          analysis,
          densityGPerMl: Math.max(0, number(item.densityGPerMl))
        };
      });
    const keptCustomIds = new Set(state.customProducts.map(item => item.id));

    state.compare = (Array.isArray(state.compare) ? state.compare : []).filter(id => {
      if (keptCustomIds.has(id)) return true;
      const product = availableProducts.find(candidate => candidate.id === id);
      return product && product.compareGroup === '1-part';
    });
    state.systemCompare = state.systemCompare.filter(id => availableSystems.some(system => system.id === id));

    while (state.compare.length + state.systemCompare.length > MAX_COMPARE_LINES) {
      if (state.systemCompare.length) state.systemCompare.pop();
      else state.compare.pop();
    }

    Object.keys(state.systemParts).forEach(id => {
      const parts = state.systemParts[id];
      if (!Array.isArray(parts) || !parts.some(value => number(value) > 0)) delete state.systemParts[id];
    });
    Object.keys(state.systemExcluded).forEach(id => {
      const system = availableSystems.find(item => item.id === id);
      const count = system && Array.isArray(system.components) ? system.components.length : 0;
      const excluded = [...new Set(Array.isArray(state.systemExcluded[id]) ? state.systemExcluded[id] : [])]
        .filter(index => Number.isInteger(index) && index >= 0 && index < count)
        .sort((a, b) => a - b);
      if (!excluded.length || excluded.length >= count) delete state.systemExcluded[id];
      else state.systemExcluded[id] = excluded;
    });
    Object.keys(state.systemProfiles).forEach(id => {
      const system = availableSystems.find(item => item.id === id);
      const profileId = state.systemProfiles[id];
      if (!system || (profileId !== 'custom' && !(system.profiles || []).some(profile => profile.id === profileId))) {
        delete state.systemProfiles[id];
      }
    });
    availableSystems.forEach(system => {
      if ((system.profiles || []).length && state.systemParts[system.id] && !state.systemProfiles[system.id]) {
        state.systemProfiles[system.id] = 'custom';
      }
    });

    return state;
  }

  function loadState(storage, products, systems) {
    let parsed;
    try {
      parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    } catch {
      parsed = null;
    }
    return normalizeState(parsed, products, systems);
  }

  function saveState(storage, state) {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  return Object.freeze({
    STORAGE_KEY,
    MAX_COMPARE_LINES,
    MAX_CUSTOM_PRODUCTS,
    freshState,
    normalizeState,
    loadState,
    saveState
  });
});
