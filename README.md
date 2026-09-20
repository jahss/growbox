# Growbox Fertilizer Toolbox

A static HTML/CSS/JavaScript toolbox for comparing commercial fertilizer programs, converting guaranteed analyses to elemental ppm, and exploring fertilizer blends.

## Current structure

- `index.html` — application markup and asset loading
- `css/app.css` — application styles
- `data/products.js` — commercial products, multipart systems, ingredient salts, and source metadata
- `js/chemistry.js` — pure chemistry and multipart calculation engine
- `js/app.js` — browser state, rendering, exports, and event handling
- `tests/chemistry.test.js` — regression and validation tests

## Chemistry conventions

- Internal solution concentrations are elemental mg/L (ppm).
- Fertilizer labels retain N-P2O5-K2O notation.
- P = P2O5 × 0.436426.
- K = K2O × 0.830151.
- 1 g/US gal = 264.172052 mg/L.
- Liquid volume calculations require a verified density; the engine does not assume 1 mL = 1 g.

Run the chemistry tests with:

```sh
node --test tests/*.test.js
```

## Product data policy

Prefer official manufacturer labels, technical sheets, and feed charts. Commercial records should eventually include a source URL, source type, date checked, original rate wording and units, formula/version or region when relevant, and liquid density provenance. Unverified ratios, rates, or densities should not be presented as manufacturer recommendations.
