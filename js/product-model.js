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

    function product(id) {
      return productById.get(id);
    }

    function system(id) {
      return systemById.get(id);
    }

    function displayProgram(item) {
      return item.program || item.name || '';
    }

    function displayFormula(item) {
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
      return entryTitle(item) + ' | ' + displayFormula(item) + ' | ' + displayParts(item);
    }

    function mixSystem(systemRecord, customParts) {
      const parts = (customParts || systemRecord.components.map(component => component.defaultParts == null ? 1 : component.defaultParts))
        .map(value => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0));
      const componentProducts = systemRecord.components.map(component => product(component.productId));
      return {
        sys: systemRecord,
        products: componentProducts,
        ...chemistry.mixSystem(systemRecord, componentProducts, parts)
      };
    }

    function selectedCompareEntries(productIds, systemIds, systemParts) {
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
        const mix = mixSystem(systemRecord, systemParts && systemParts[systemRecord.id]);
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
          mix
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
      entryTitle,
      exportLabel,
      mixSystem,
      selectedCompareEntries
    });
  }

  return Object.freeze({createCatalog});
});
