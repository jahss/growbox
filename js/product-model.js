(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxProductModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function defaultFormat(value) {
    return Number.isFinite(Number(value)) ? String(Number(value)) : '—';
  }

  function createCatalog(products, systems, chemistry, formatter) {
    const productList = Array.isArray(products) ? products : [];
    const systemList = Array.isArray(systems) ? systems : [];
    const format = typeof formatter === 'function' ? formatter : defaultFormat;
    if (!chemistry || typeof chemistry.mixSystem !== 'function') {
      throw new TypeError('A chemistry engine with mixSystem is required.');
    }

    const productById = new Map(productList.map(product => [product.id, product]));
    const systemById = new Map(systemList.map(system => [system.id, system]));
    let customList = [];
    let customById = new Map();

    function product(id) {
      return productById.get(id) || customById.get(id);
    }

    // Products the user entered on the Label → ppm tab, shaped like 1-part library products.
    function setCustomProducts(saved) {
      customList = (Array.isArray(saved) ? saved : []).map(item => {
        const density = Number(item.densityGPerMl) > 0 ? Number(item.densityGPerMl) : 0;
        return {
          id: item.id, custom: true, compareGroup: '1-part', partCount: 1,
          brand: 'Custom', manufacturer: 'Custom', program: item.name, name: item.name,
          form: density ? 'liquid' : 'dry', densityGPerMl: density || undefined,
          analysis: {...item.analysis}
        };
      });
      customById = new Map(customList.map(item => [item.id, item]));
    }

    function customProducts() {
      return customList;
    }

    function system(id) {
      return systemById.get(id);
    }

    function displayProgram(item) {
      return item.program || item.name || '';
    }

    // Drop part-label words the line name already says: "Part A" -> "A", and
    // "Bloom A" -> "A" inside "Sensi Coco Bloom". Other labels stay as written.
    function partLabel(item, label) {
      const match = /^(.+) ([A-Z0-9])$/.exec(String(label || ''));
      if (!match) return label;
      const prefix = match[1].toLowerCase();
      const name = ' ' + String(displayProgram(item)).toLowerCase() + ' ';
      return prefix === 'part' || name.includes(' ' + prefix + ' ') ? match[2] : label;
    }

    function saltLabel(analysis) {
      // One decimal, halves rounded up as a printed label would (52.15 → 52.2).
      const oneDecimal = value => format(Math.round((Number(value) || 0) * 10 + 1e-9) / 10, 1);
      const npk = ['N', 'P2O5', 'K2O'].map(key => oneDecimal(analysis[key])).join('-');
      const others = ['Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo']
        .filter(key => Number(analysis[key]) > 0)
        .map(key => oneDecimal(analysis[key]) + ' ' + key);
      return npk + (others.length ? ' + ' + others.join(', ') : '');
    }

    function displayFormula(item) {
      // Salts are known by name, with their label N-P-K and any other nutrients:
      // "Magnesium sulfate heptahydrate — Epsom salt · 0-0-0 + 9.9 Mg, 13 S".
      if (item.compareGroup === 'salt') return item.name + ' · ' + saltLabel(item.analysis || {});
      if (item.displayFormula && item.partCount > 1) return item.displayFormula.replace(/\(([^()]+)\)/g, (all, label) => '(' + partLabel(item, label) + ')');
      if (item.displayFormula) return item.displayFormula;
      if (item.analysis) return format(item.analysis.N) + '-' + format(item.analysis.P2O5) + '-' + format(item.analysis.K2O);
      return item.name || '';
    }

    function displayParts(item) {
      return (item.partCount || 1) + '-part';
    }

    function entryTitle(item) {
      return item.brand + ' — ' + displayProgram(item);
    }

    function exportLabel(item) {
      return entryTitle(item) + ' | ' + displayFormula(item) + ' | ' + displayParts(item) + (item.includedLabel ? ' | ' + item.includedLabel : '');
    }

    // Valid excluded part indexes for a system; never all parts.
    function excludedParts(systemRecord, excluded) {
      const count = systemRecord.components.length;
      const valid = [...new Set(Array.isArray(excluded) ? excluded : [])]
        .filter(index => Number.isInteger(index) && index >= 0 && index < count)
        .sort((a, b) => a - b);
      return valid.length < count ? valid : [];
    }

    // "B only" / "Grow + Bloom only" when some parts are left out of the comparison.
    function includedLabel(systemRecord, excluded) {
      if (!excluded.length) return '';
      return systemRecord.components
        .map((component, index) => excluded.includes(index) ? null : partLabel(systemRecord, component.label))
        .filter(Boolean).join(' + ') + ' only';
    }

    function systemProfile(systemRecord, profileId) {
      if (!systemRecord || profileId === 'custom') return null;
      const profiles = Array.isArray(systemRecord.profiles) ? systemRecord.profiles : [];
      const selectedId = profileId || systemRecord.defaultProfile;
      return profiles.find(profile => profile.id === selectedId) || (!profileId ? profiles[0] : null) || null;
    }

    function mixSystem(systemRecord, customParts, profileId, excluded) {
      const profile = systemProfile(systemRecord, profileId);
      const useCustomParts = profileId === 'custom' || (!profileId && Array.isArray(customParts));
      const chosenParts = useCustomParts && Array.isArray(customParts)
        ? customParts
        : (profile ? profile.parts : systemRecord.components.map(component => component.defaultParts == null ? 1 : component.defaultParts));
      const parts = chosenParts
        .map(value => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0));
      const componentProducts = systemRecord.components.map(component => product(component.productId));
      let skip = excludedParts(systemRecord, excluded);
      // Left-out parts weigh nothing; if nothing with a ratio would remain, compare every part.
      if (!parts.some((value, index) => value > 0 && !skip.includes(index))) skip = [];
      const compareParts = parts.map((value, index) => skip.includes(index) ? 0 : value);
      const approximateDensity = systemRecord.ratioBasis === 'volume'
        && componentProducts.some(item => item && item.densityEstimate);
      return {
        sys: systemRecord,
        profile,
        products: componentProducts,
        approximateDensity,
        ...chemistry.mixSystem(systemRecord, componentProducts, compareParts),
        parts,
        excluded: skip,
        includedLabel: includedLabel(systemRecord, skip)
      };
    }

    function selectedCompareEntries(productIds, systemIds, systemParts, systemProfiles, systemExcluded) {
      const entries = (Array.isArray(productIds) ? productIds : [])
        .map(product)
        .filter(item => item && item.compareGroup === '1-part')
        .map(item => ({
          kind: 'product',
          id: item.id,
          brand: item.brand,
          program: displayProgram(item),
          displayFormula: displayFormula(item),
          partCount: item.partCount || 1,
          name: item.name,
          analysis: item.analysis,
          product: item
        }));

      (Array.isArray(systemIds) ? systemIds : []).map(system).filter(Boolean).forEach(systemRecord => {
        const profileId = systemProfiles && systemProfiles[systemRecord.id];
        const mix = mixSystem(systemRecord, systemParts && systemParts[systemRecord.id], profileId, systemExcluded && systemExcluded[systemRecord.id]);
        entries.push({
          kind: 'system',
          id: systemRecord.id,
          brand: systemRecord.brand,
          program: displayProgram(systemRecord),
          displayFormula: displayFormula(systemRecord),
          partCount: systemRecord.partCount,
          name: systemRecord.name,
          analysis: mix.analysis,
          system: systemRecord,
          mix,
          includedLabel: mix.includedLabel,
          profileId: mix.profile ? mix.profile.id : (profileId === 'custom' ? 'custom' : null),
          profileLabel: mix.profile ? mix.profile.label : (profileId === 'custom' ? 'Custom' : '')
        });
      });

      return entries;
    }

    return Object.freeze({
      product,
      system,
      displayProgram,
      displayFormula,
      displayParts,
      partLabel,
      excludedParts,
      setCustomProducts,
      customProducts,
      entryTitle,
      exportLabel,
      systemProfile,
      mixSystem,
      selectedCompareEntries
    });
  }

  return Object.freeze({createCatalog});
});
