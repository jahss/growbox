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
const PRODUCTS=window.FERTILIZER_PRODUCTS||[],SYSTEMS=window.FERTILIZER_SYSTEMS||[],F=CHEM.MG_PER_L_PER_G_PER_GAL,LEVELS=[120,140,160,180,200];
const fresh=STATE.freshState;
let S=STATE.loadState(sessionStorage,PRODUCTS,SYSTEMS);
const $=id=>document.getElementById(id),num=v=>Number.isFinite(+v)?+v:0,fmt=(v,d=2)=>Number.isFinite(+v)?(+v).toFixed(d).replace(/(\.\d*?[1-9])0+$|\.0+$/,'$1'):'—',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),save=()=>STATE.saveState(sessionStorage,S);
const CATALOG=PRODUCT_MODEL.createCatalog(PRODUCTS,SYSTEMS,CHEM,fmt);
const ANALYSIS_COMPONENT=ANALYSIS.createComponent({document,chemistry:CHEM,levels:LEVELS,format:fmt});
const COMPARE_COMPONENT=COMPARE.createComponent({document,products:PRODUCTS,systems:SYSTEMS,chemistry:CHEM,catalog:CATALOG,format:fmt,escape:esc,getState:()=>S,save,notify:flash});
const prod=CATALOG.product,displayFormula=CATALOG.displayFormula,exportLabel=CATALOG.exportLabel;
const elem=CHEM.elementalAnalysis;
function flash(message,kind=''){
  const box=$('notice');box.textContent=message;box.className='notice'+(kind?' '+kind:'');box.classList.remove('hidden');
  clearTimeout(flash._t);flash._t=setTimeout(()=>box.classList.add('hidden'),3500);
}
function tabs(){document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{S.view=b.dataset.view;save();document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===S.view))});document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===S.view));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===S.view))}
function checks(box,cls,ids,onchange){
  const regular=PRODUCTS.filter(p=>p.compareGroup!=='salt'),salts=PRODUCTS.filter(p=>p.compareGroup==='salt');
  const row=p=>'<label class="check"><input class="'+cls+'" type="checkbox" value="'+esc(p.id)+'" '+(ids.includes(p.id)?'checked':'')+'><span><b>'+esc(p.brand+' — '+displayFormula(p))+'</b><small>'+fmt(p.analysis.N)+'-'+fmt(p.analysis.P2O5)+'-'+fmt(p.analysis.K2O)+' label · '+fmt(elem(p.analysis).N)+' / '+fmt(elem(p.analysis).P)+' / '+fmt(elem(p.analysis).K)+' elemental</small></span></label>';
  $(box).innerHTML='<div class="compare-group"><div class="group-title"><h3>Fertilizers & components</h3></div>'+regular.map(row).join('')+'</div><div class="compare-group"><div class="group-title"><h3>Ingredient salts</h3></div>'+salts.map(row).join('')+'</div>';
  document.querySelectorAll('.'+cls).forEach(x=>x.onchange=()=>onchange([...document.querySelectorAll('.'+cls+':checked')].map(y=>y.value)));
}
function manual(){ANALYSIS_COMPONENT.render(S.manual,(key,value)=>{S.manual[key]=value;save()})}
function blend(){checks('blendChecks','bc',S.blend.ids,ids=>{S.blend.ids=ids;S.blend.result=null;save();$('blendResult').classList.add('hidden')});$('labelMode').classList.toggle('active',S.blend.mode==='label');$('elementMode').classList.toggle('active',S.blend.mode==='element');const fs=S.blend.mode==='label'?[['N','N'],['P2O5','P₂O₅'],['K2O','K₂O'],['Ca','Ca'],['Mg','Mg'],['S','S']]:[['N','N'],['P','P'],['K','K'],['Ca','Ca'],['Mg','Mg'],['S','S']];$('blendInputs').innerHTML=fs.map(([k,l])=>'<label>'+l+'<input class="bi" data-k="'+k+'" type="number" min="0" step=".01" value="'+fmt(S.blend.target[k]??0,4)+'"></label>').join('');document.querySelectorAll('.bi').forEach(x=>x.oninput=()=>{S.blend.target[x.dataset.k]=Math.max(0,num(x.value));S.blend.result=null;save()});renderBlendResult()}
function renderTable(id,a,mode){const ks=mode==='label'?[['N','N'],['P2O5','P₂O₅'],['K2O','K₂O'],['Ca','Ca'],['Mg','Mg'],['S','S']]:[['N','N'],['P','P'],['K','K'],['Ca','Ca'],['Mg','Mg'],['S','S']];$(id).innerHTML='<thead><tr>'+ks.map(x=>'<th>'+x[1]+'</th>').join('')+'</tr></thead><tbody><tr>'+ks.map(x=>'<td>'+fmt(a[x[0]],3)+'</td>').join('')+'</tr></tbody>'}
function renderBlendResult(){const r=S.blend.result;if(!r){$('blendResult').classList.add('hidden');return}const ps=r.ids.map(prod).filter(Boolean);$('blendResult').classList.remove('hidden');$('fit').textContent='Relative RMS error: '+fmt(r.rms*100,2)+'%. Lower is closer; 0% is exact.';$('weights').innerHTML=ps.map((p,i)=>'<div class="pill"><b>'+esc(displayFormula(p))+'</b><span>'+fmt(r.w[i]*100,2)+'% by mass</span></div>').join('');renderTable('labelResult',r.label,'label');renderTable('elementResult',r.element,'element');const nPct=r.element.N;$('feed').innerHTML='<thead><tr><th>N target</th>'+ps.map(p=>'<th>'+esc(displayFormula(p))+' g/gal</th>').join('')+'<th>Total</th><th>P</th><th>K</th><th>Ca</th><th>Mg</th><th>S</th></tr></thead><tbody>'+(nPct<=0?'<tr><td colspan="20">Blend contains no nitrogen.</td></tr>':LEVELS.map(N=>{const total=N/(F*nPct/100),ds=r.w.map(w=>total*w);return'<tr><td>'+N+'</td>'+ds.map(d=>'<td>'+fmt(d,3)+'</td>').join('')+'<td>'+fmt(total,3)+'</td>'+['P','K','Ca','Mg','S'].map(k=>'<td>'+fmt(F*total*r.element[k]/100,1)+'</td>').join('')+'</tr>'}).join(''))+'</tbody>'}
function exportJSON(){EXPORT.downloadFile('growbox-fertilizer-results.json','application/json',EXPORT.stateJson(S))}
function exportCSV(){const rows=EXPORT.currentCsvRows(S,{levels:LEVELS,chemistry:CHEM,product:prod,entries:COMPARE_COMPONENT.selectedEntries,exportLabel});EXPORT.downloadFile('growbox-fertilizer-results.csv','text/csv',EXPORT.csvText(rows))}
$('labelMode').onclick=()=>{S.blend.mode='label';S.blend.result=null;save();blend()};$('elementMode').onclick=()=>{S.blend.mode='element';S.blend.result=null;save();blend()};$('solve').onclick=()=>{const ps=S.blend.ids.map(prod).filter(Boolean);if(!ps.length){$('notice').textContent='Select at least one fertilizer.';$('notice').classList.remove('hidden');return}S.blend.result={ids:ps.map(p=>p.id),...BLEND_SOLVER.solveBlend(ps,S.blend.target,S.blend.mode,CHEM)};save();renderBlendResult()};$('csv').onclick=exportCSV;$('json').onclick=exportJSON;$('reset').onclick=()=>{if(confirm('Reset this browser session?')){S=fresh();save();render()}};
function render(){tabs();COMPARE_COMPONENT.render();manual();blend()}render();
})();
