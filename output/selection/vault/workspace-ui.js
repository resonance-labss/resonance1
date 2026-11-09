/* Presentation only: move existing controls; never calculate or authorize actions. */
(()=>{'use strict';
const $=id=>document.getElementById(id),root=$('workspace'),who=Number(document.body.dataset.vaultCharacter||0);
// Number fields silently drop a typed comma, so 8,5 would become 85. Type a dot instead; if the browser refuses, say so.
document.addEventListener('keydown',e=>{const input=e.target;if(e.key!==','||!(input instanceof HTMLInputElement)||input.type!=='number')return;e.preventDefault();if(document.execCommand('insertText',false,'.'))return;input.setCustomValidity(window.ResonanceI18n?window.ResonanceI18n.t('Use a dot for decimals, for example 8.5.'):'Use a dot for decimals, for example 8.5.');input.reportValidity();});
document.addEventListener('input',e=>{if(e.target instanceof HTMLInputElement&&e.target.type==='number')e.target.setCustomValidity('');});
const desk=$(who===0?'diren-desk':'tool-desk');if(!root||!desk)return;
document.body.classList.add('workspace-page');
for(const table of root.querySelectorAll('.lab-table,.comparison-table-wrap')){table.tabIndex=0;table.setAttribute('role','region');table.setAttribute('aria-label','Scrollable calculation table');}
const left=$(who===0?'diren-plan':'tool-plan'),right=$(who===0?'diren-result':'tool-result'),extra=$(who===0?'diren-extra':'tool-extra');
const toolbar=document.createElement('nav');toolbar.className='workspace-shortcuts';toolbar.setAttribute('aria-label','Workspace navigation');
function jump(target){if(target.tagName==='DETAILS')target.open=true;if(target===right)right.scrollTop=0;const anchor=target===right&&matchMedia('(min-width:851px)').matches?desk:target;anchor.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.tabIndex=-1;target.focus({preventScroll:true});}
for(const [label,target] of [['Rules & budget',left],['Review & results',right],['Advanced tools',extra]]){const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=label;button.onclick=()=>jump(target);toolbar.append(button);}
desk.prepend(toolbar);
const status=document.createElement('p');status.id='workspace-status';status.className='workspace-status';status.setAttribute('role','status');status.hidden=true;toolbar.after(status);
const guide=$('practice-guide');if(guide){const steps=guide.querySelector('ol');if(steps){const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Read the three steps';steps.before(detail);detail.append(summary,steps);}guide.querySelector('h2').textContent='Quick guide';}
if(who===3){const detail=$('ade-calculation-details');$('ade-weekly').before(detail);}
if(who===1){const explanation=$('decision-summary');if(explanation)right.append(explanation);}
// Put Denis's examples next to the editable budget, and the reference next to its result.
if(who===2){const examples=$('example-note')?.closest('section'),reference=$('reference-status')?.closest('section');if(examples)left.insertBefore(examples,$('budget-form'));if(reference)right.append(reference);}
// A newly opened review/result must not inherit the scroll position of a long old result.
for(const target of [$(who===0?'review-box':who===1?'policy-review':who===2?'results':'ade-results')].filter(Boolean)){
 new MutationObserver(records=>{if(records.some(r=>r.oldValue!==null)&&!target.hidden)right.scrollTop=0;}).observe(target,{attributes:true,attributeOldValue:true,attributeFilter:['hidden']});
}
// Reflect the existing access check, while keeping all calculations in their original handlers.
if(who===2||who===3){const forms=[...root.querySelectorAll('form')],submitButtons=forms.flatMap(form=>[...form.querySelectorAll('button[type=submit],button:not([type])')]);
 window.addEventListener(who===2?'resonance:eric-context':'resonance:ade-context',()=>{const busy=window.resonanceScenarioLibrary?.editable()===false;for(const form of forms)form.setAttribute('aria-busy',String(busy));for(const button of submitButtons)button.disabled=busy;if(busy){status.hidden=false;status.dataset.kind='busy';status.textContent='Checking wallet access. Your inputs are preserved.';}else if(status.dataset.kind==='busy')status.hidden=true;});
}
window.addEventListener('resonance:wallet-check-paused',event=>{status.hidden=false;status.dataset.kind='error';status.textContent=event.detail;});
window.addEventListener('resonance:wallet-verified',()=>{if(status.dataset.kind==='error'){status.hidden=true;status.textContent='';}});
new MutationObserver(()=>{if(root.hidden){status.hidden=true;right.scrollTop=0;}}).observe(root,{attributes:true,attributeFilter:['hidden']});
})();
