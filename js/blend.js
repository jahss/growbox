(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GrowboxBlend = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const LABEL_FIELDS = [['N', 'N'], ['P2O5', 'P₂O₅'], ['K2O', 'K₂O'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S']];
  const ELEMENT_FIELDS = [['N', 'N'], ['P', 'P'], ['K', 'K'], ['Ca', 'Ca'], ['Mg', 'Mg'], ['S', 'S']];

  function number(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function fieldsForMode(mode) {
    return mode === 'label' ? LABEL_FIELDS : ELEMENT_FIELDS;
  }

  function resultTableHtml(analysis, mode, format) {
    const fields = fieldsForMode(mode);
    return '<thead><tr>' + fields.map(field => '<th>' + field[1] + '</th>').join('') + '</tr></thead><tbody><tr>' + fields.map(field => '<td>' + format(analysis[field[0]], 3) + '</td>').join('') + '</tr></tbody>';
  }

  function createComponent(options) {
    const document = options.document;
    const products = options.products;
    const chemistry = options.chemistry;
    const solver = options.solver;
    const catalog = options.catalog;
    const getState = options.getState;
    const save = options.save;
    const format = options.format;
    const escape = options.escape;
    const notify = options.notify;
    const levels = options.levels;
    const element = id => document.getElementById(id);

    function renderChecks() {
      const state = getState();
      const regular = products.filter(product => product.compareGroup !== 'salt');
      const salts = products.filter(product => product.compareGroup === 'salt');
      const row = product => {
        const elemental = chemistry.elementalAnalysis(product.analysis);
        return '<label class="check"><input class="bc" type="checkbox" value="' + escape(product.id) + '" ' + (state.blend.ids.includes(product.id) ? 'checked' : '') + '><span><b>' + escape(product.brand + ' — ' + catalog.displayFormula(product)) + '</b><small>' + format(product.analysis.N) + '-' + format(product.analysis.P2O5) + '-' + format(product.analysis.K2O) + ' label · ' + format(elemental.N) + ' / ' + format(elemental.P) + ' / ' + format(elemental.K) + ' elemental</small></span></label>';
      };
      element('blendChecks').innerHTML = '<div class="compare-group"><div class="group-title"><h3>Fertilizers & components</h3></div>' + regular.map(row).join('') + '</div><div class="compare-group"><div class="group-title"><h3>Ingredient salts</h3></div>' + salts.map(row).join('') + '</div>';
      document.querySelectorAll('.bc').forEach(checkbox => {
        checkbox.onchange = () => {
          state.blend.ids = [...document.querySelectorAll('.bc:checked')].map(item => item.value);
          state.blend.result = null;
          save();
          element('blendResult').classList.add('hidden');
        };
      });
    }

    function renderResult() {
      const state = getState();
      const result = state.blend.result;
      if (!result) {
        element('blendResult').classList.add('hidden');
        return;
      }
      const selectedProducts = result.ids.map(catalog.product).filter(Boolean);
      element('blendResult').classList.remove('hidden');
      element('fit').textContent = 'Relative RMS error: ' + format(result.rms * 100, 2) + '%. Lower is closer; 0% is exact.';
      element('weights').innerHTML = selectedProducts.map((product, index) => '<div class="pill"><b>' + escape(catalog.displayFormula(product)) + '</b><span>' + format(result.w[index] * 100, 2) + '% by mass</span></div>').join('');
      element('labelResult').innerHTML = resultTableHtml(result.label, 'label', format);
      element('elementResult').innerHTML = resultTableHtml(result.element, 'element', format);

      const nitrogenPercent = result.element.N;
      element('feed').innerHTML = '<thead><tr><th>N target</th>' + selectedProducts.map(product => '<th>' + escape(catalog.displayFormula(product)) + ' g/gal</th>').join('') + '<th>Total</th><th>P</th><th>K</th><th>Ca</th><th>Mg</th><th>S</th></tr></thead><tbody>' +
        (nitrogenPercent <= 0
          ? '<tr><td colspan="20">Blend contains no nitrogen.</td></tr>'
          : levels.map(targetN => {
            const total = targetN / (chemistry.MG_PER_L_PER_G_PER_GAL * nitrogenPercent / 100);
            const doses = result.w.map(weight => total * weight);
            return '<tr><td>' + targetN + '</td>' + doses.map(dose => '<td>' + format(dose, 3) + '</td>').join('') + '<td>' + format(total, 3) + '</td>' + ['P', 'K', 'Ca', 'Mg', 'S'].map(key => '<td>' + format(chemistry.MG_PER_L_PER_G_PER_GAL * total * result.element[key] / 100, 1) + '</td>').join('') + '</tr>';
          }).join('')) + '</tbody>';
    }

    function solve() {
      const state = getState();
      const selectedProducts = state.blend.ids.map(catalog.product).filter(Boolean);
      if (!selectedProducts.length) {
        notify('Select at least one fertilizer.', 'warn');
        return;
      }
      state.blend.result = {
        ids: selectedProducts.map(product => product.id),
        ...solver.solveBlend(selectedProducts, state.blend.target, state.blend.mode, chemistry)
      };
      save();
      renderResult();
    }

    function render() {
      const state = getState();
      renderChecks();
      element('labelMode').classList.toggle('active', state.blend.mode === 'label');
      element('elementMode').classList.toggle('active', state.blend.mode === 'element');
      const fields = fieldsForMode(state.blend.mode);
      element('blendInputs').innerHTML = fields.map(([key, label]) => '<label>' + label + '<input class="bi" data-k="' + key + '" type="number" min="0" step=".01" value="' + format(state.blend.target[key] ?? 0, 4) + '"></label>').join('');
      document.querySelectorAll('.bi').forEach(input => {
        input.oninput = () => {
          state.blend.target[input.dataset.k] = Math.max(0, number(input.value));
          state.blend.result = null;
          save();
        };
      });
      element('labelMode').onclick = () => {
        state.blend.mode = 'label';
        state.blend.result = null;
        save();
        render();
      };
      element('elementMode').onclick = () => {
        state.blend.mode = 'element';
        state.blend.result = null;
        save();
        render();
      };
      element('solve').onclick = solve;
      renderResult();
    }

    return Object.freeze({render, renderChecks, renderResult, solve});
  }

  return Object.freeze({fieldsForMode, resultTableHtml, createComponent});
});
