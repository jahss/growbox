(()=>{'use strict';
const CHEM=window.GrowboxChemistry;
if(!CHEM)throw new Error('Growbox chemistry engine failed to load.');
const STATE=window.GrowboxState;
if(!STATE)throw new Error('Growbox state module failed to load.');
const PRODUCT_MODEL=window.GrowboxProductModel;
if(!PRODUCT_MODEL)throw new Error('Growbox product model failed to load.');
const BLEND_SOLVER=window.GrowboxBlendSolver;
if(!BLEND_SOLVER)throw new Error('Growbox blend solver failed to load.');
const EXPORT=window.GrowboxExport;
if(!EXPORT)throw new Error('Growbox export module failed to load.');
const ANALYSIS=window.GrowboxAnalysis;
if(!ANALYSIS)throw new Error('Growbox analysis component failed to load.');
const COMPARE=window.GrowboxCompare;
if(!COMPARE)throw new Error('Growbox compare component failed to load.');
const USE_RATE=window.GrowboxUseRate;
if(!USE_RATE)throw new Error('Growbox use-rate component failed to load.');
const MIX=window.GrowboxMix;
if(!MIX)throw new Error('Growbox mix component failed to load.');
const BLEND=window.GrowboxBlend;
if(!BLEND)throw new Error('Growbox blend component failed to load.');
const PRODUCTS=window.FERTILIZER_PRODUCTS||[],SYSTEMS=window.FERTILIZER_SYSTEMS||[],LEVELS=Array.from({length:((300-50)/10)+1},(_,i)=>50+i*10);
const fresh=STATE.freshState;
let S=STATE.loadState(sessionStorage,PRODUCTS,SYSTEMS);
const $=id=>document.getElementById(id),fmt=(v,d=2)=>Number.isFinite(+v)?(+v).toFixed(d).replace(/(\.\d*?[1-9])0+$|\.0+$/,'$1'):'—',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),save=()=>STATE.saveState(sessionStorage,S);
const CATALOG=PRODUCT_MODEL.createCatalog(PRODUCTS,SYSTEMS,CHEM,fmt);
const ANALYSIS_COMPONENT=ANALYSIS.createComponent({document,chemistry:CHEM,levels:LEVELS,format:fmt,escape:esc,getState:()=>S,save,notify:flash,maxCompareLines:STATE.MAX_COMPARE_LINES,maxCustomProducts:STATE.MAX_CUSTOM_PRODUCTS,saveCustomProduct:STATE.saveCustomProduct,onCustomProducts:()=>{CATALOG.setCustomProducts(S.customProducts);COMPARE_COMPONENT.render();BLEND_COMPONENT.renderSources();BLEND_COMPONENT.renderResult()}});
const COMPARE_COMPONENT=COMPARE.createComponent({document,products:PRODUCTS,systems:SYSTEMS,chemistry:CHEM,catalog:CATALOG,format:fmt,escape:esc,getState:()=>S,save,notify:flash});
const MIX_COMPONENT=MIX.createComponent({document,getState:()=>S,save,format:fmt,escape:esc});
const USE_RATE_COMPONENT=USE_RATE.createComponent({document,renderMix:MIX_COMPONENT.render,nitrogenFieldHtml:ANALYSIS.nitrogenFieldHtml,bindNitrogenField:ANALYSIS.bindNitrogenField,onWaterChange:()=>BLEND_COMPONENT.waterChanged(),onCopied:label=>{S.view='blend';render();scrollTo(0,0);flash('Target copied from Use rate: '+label)},products:PRODUCTS,systems:SYSTEMS,chemistry:CHEM,catalog:CATALOG,getState:()=>S,save,format:fmt,escape:esc});
const BLEND_COMPONENT=BLEND.createComponent({document,renderMix:MIX_COMPONENT.render,waterOf:()=>USE_RATE.waterPpm(S.water),nitrogenFormsHtml:USE_RATE.nitrogenFormsHtml,nitrogenFieldHtml:ANALYSIS.nitrogenFieldHtml,bindNitrogenField:ANALYSIS.bindNitrogenField,labelStep:ANALYSIS.labelStep,saveCustomProduct:STATE.saveCustomProduct,onCustomProducts:()=>{CATALOG.setCustomProducts(S.customProducts);COMPARE_COMPONENT.render();manual()},products:PRODUCTS,systems:SYSTEMS,chemistry:CHEM,solver:BLEND_SOLVER,catalog:CATALOG,getState:()=>S,save,format:fmt,escape:esc,notify:flash,levels:LEVELS});
const prod=CATALOG.product,exportLabel=CATALOG.exportLabel;
function flash(message,kind=''){
  const box=$('notice');box.textContent=message;box.className='notice'+(kind?' '+kind:'');box.classList.remove('hidden');
  clearTimeout(flash._t);flash._t=setTimeout(()=>box.classList.add('hidden'),3500);
}
function tabs(){document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{S.view=b.dataset.view;save();document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===S.view))});document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===S.view));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===S.view))}
function manual(){ANALYSIS_COMPONENT.render(S.manual,(key,value)=>{S.manual[key]=value;save()})}
// Planned: downloads (CSV and JSON) become account-only once a backend exists. See README.
function exportJSON(){EXPORT.downloadFile('growbox-fertilizer-results.json','application/json',EXPORT.stateJson(S))}
function exportCSV(){const rows=EXPORT.currentCsvRows(S,{levels:LEVELS,chemistry:CHEM,product:prod,entries:COMPARE_COMPONENT.selectedEntries,exportLabel,useRateRows:USE_RATE_COMPONENT.csvRows});EXPORT.downloadFile('growbox-fertilizer-results.csv','text/csv',EXPORT.csvText(rows))}
$('notice').onclick=()=>$('notice').classList.add('hidden');$('csv').onclick=exportCSV;$('json').onclick=exportJSON;$('reset').onclick=()=>{if(confirm('Reset this browser session?')){S=fresh();save();render()}};
function render(){CATALOG.setCustomProducts(S.customProducts);tabs();COMPARE_COMPONENT.render();USE_RATE_COMPONENT.render();manual();BLEND_COMPONENT.render()}render();
})();
