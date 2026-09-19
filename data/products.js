window.FERTILIZER_PRODUCTS = [
  {
    id: 'megacrop-11-5-14',
    brand: 'Greenleaf Nutrients',
    name: 'Mega Crop 1-Part 11-5-14',
    form: 'dry',
    analysis: { N: 11, P2O5: 5, K2O: 14, Ca: 7.5, Mg: 1.4, S: 2, Fe: 0.10, Mn: 0.08, Zn: 0.017, B: 0.019, Cu: 0.020, Mo: 0 },
    nitrogenForms: { nitrateN: 8.5, ammoniacalN: 0.5, waterSolubleN: 2.0 },
    useRates: [],
    source: { type: 'uploaded-label', checked: '2026-09-19' },
    notes: 'Uploaded guaranteed-analysis label. Label also lists 2% kelp and 2% humic acids; additive tracking is intentionally outside prototype v1.'
  },
  {
    id: 'comparison-12-4-16',
    brand: "Jack's Nutrients",
    name: '12-4-16 RO',
    form: 'dry',
    analysis: { N: 12, P2O5: 4, K2O: 16, Ca: 7, Mg: 2, S: 0, Fe: 0.15, Mn: 0.05, Zn: 0.035, B: 0.020, Cu: 0.020, Mo: 0.001 },
    nitrogenForms: { nitrateN: 11.8, ammoniacalN: 0.2 },
    useRates: [
      {
        label: 'Manufacturer schedule — 200 ppm N',
        gPerGal: 6.309,
        note: '630.90 g per 100 US gal; constant liquid feed schedule.',
        source: 'https://www.jacksnutrients.com/_files/ugd/3230c0_076f241488f04c26a2a76a9e38741527.pdf'
      }
    ],
    source: { type: 'uploaded-label', checked: '2026-09-19' },
    notes: 'Uploaded Jack’s 12-4-16 guaranteed-analysis label.'
  },
  {
    id: 'megacrop-2part-a-8-12-28',
    brand: 'Greenleaf Nutrients',
    name: 'Mega Crop 2-Part A 8-12-28',
    form: 'dry',
    analysis: { N: 8, P2O5: 12, K2O: 28, Ca: 0, Mg: 3, S: 4, Fe: 0.16, Mn: 0.22, Zn: 0.05, B: 0.04, Cu: 0.003, Mo: 0.001 },
    nitrogenForms: { nitrateN: 6, ureaN: 2 },
    useRates: [],
    source: { type: 'uploaded-label', checked: '2026-09-19' },
    notes: 'Uploaded 8-12-28 Part A label. Greenleaf’s current web listing may use a different Part A formula, so this record is kept as the uploaded label version.'
  },
  {
    id: 'megacrop-2part-b-15-5-0-0',
    brand: 'Greenleaf Nutrients',
    name: 'Mega Crop 2-Part B 15.5-0-0',
    form: 'dry',
    analysis: { N: 15.5, P2O5: 0, K2O: 0, Ca: 19, Mg: 0, S: 0, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0 },
    nitrogenForms: { nitrateN: 14.5, ammoniacalN: 1.0 },
    useRates: [],
    source: { type: 'uploaded-label', checked: '2026-09-19' },
    notes: 'Uploaded calcium nitrate Part B label: 15.5% N and 19% Ca.'
  },
  {
    id: 'mkp-0-52-34',
    brand: 'Generic salt',
    name: 'MKP 0-52-34',
    form: 'dry',
    analysis: { N: 0, P2O5: 52, K2O: 34, Ca: 0, Mg: 0, S: 0, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0 },
    useRates: [],
    notes: 'Generic monopotassium phosphate reference.'
  },
  {
    id: 'calcium-nitrate',
    brand: 'Generic salt',
    name: 'Calcium nitrate 15.5-0-0 + 19 Ca',
    form: 'dry',
    analysis: { N: 15.5, P2O5: 0, K2O: 0, Ca: 19, Mg: 0, S: 0, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0 },
    useRates: [],
    notes: 'Generic calcium nitrate reference for blend testing.'
  },
  {
    id: 'potassium-nitrate',
    brand: 'Generic salt',
    name: 'Potassium nitrate 13-0-46',
    form: 'dry',
    analysis: { N: 13, P2O5: 0, K2O: 46, Ca: 0, Mg: 0, S: 0, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0 },
    useRates: [],
    notes: 'Generic potassium nitrate reference for blend testing.'
  },
  {
    id: 'magnesium-sulfate',
    brand: 'Generic salt',
    name: 'Magnesium sulfate 9.86 Mg + 13 S',
    form: 'dry',
    analysis: { N: 0, P2O5: 0, K2O: 0, Ca: 0, Mg: 9.86, S: 13, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0 },
    useRates: [],
    notes: 'Generic magnesium sulfate reference for blend testing.'
  },
  {
    id: 'potassium-sulfate',
    brand: 'Generic salt',
    name: 'Potassium sulfate 0-0-50 + 18 S',
    form: 'dry',
    analysis: { N: 0, P2O5: 0, K2O: 50, Ca: 0, Mg: 0, S: 18, Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0 },
    useRates: [],
    notes: 'Generic potassium sulfate reference for blend testing.'
  }
];

window.FERTILIZER_SYSTEMS = [
  {
    id: 'megacrop-2part-uploaded',
    brand: 'Greenleaf Nutrients',
    name: 'Mega Crop 2-Part — uploaded 8-12-28 formula',
    components: [
      { productId: 'megacrop-2part-a-8-12-28', label: 'Part A', defaultParts: 1 },
      { productId: 'megacrop-2part-b-15-5-0-0', label: 'Part B', defaultParts: 1 }
    ],
    ratioNote: 'A:B is user-adjustable. The 1:1 default is only a neutral starting point, not a manufacturer recommendation.',
    useRates: []
  }
];
