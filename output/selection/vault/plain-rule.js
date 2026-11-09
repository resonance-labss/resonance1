/* "Describe it in words": reads a plain sentence (English or Turkish) in this browser and fills Diren's rule form.
   It only fills the three fields; the visitor still reviews and confirms the rule. Nothing is sent anywhere. */
(()=>{'use strict';
const $=id=>document.getElementById(id);if(!$('rule-form')||!$('scenario-guide'))return;
const box=document.createElement('section');box.className='panel';box.id='plain-rule';box.hidden=true;
box.innerHTML='<div class="eyebrow">01 / Diren · Describe your rule</div><h2>Say it in your own words.</h2><p>Write your price limit, budget and deadline in one sentence. The form is filled here in your browser; you review and confirm it next.</p><label for="plain-text">Your rule</label><textarea id="plain-text" rows="3" maxlength="400"></textarea><p class="muted">Example: buy when the price is 8 or below, spend up to 20 RLO, stop after 5 steps.</p><button type="button" id="plain-fill">Fill the form</button><ul id="plain-result" role="status"></ul>';
box.querySelector('textarea').placeholder='buy at 8 or below, budget 20 RLO, 5 steps';
$('scenario-guide').before(box);
const N='(\\d+(?:[.,]\\d+)?)';
// Price limit first, so "8 or below" is never read as the budget; matched text is removed before the next field.
const FIELDS=[
 ['limit','Price limit',[new RegExp(N+'\\s*(?:demo\\s*)?(?:rlo\\s*)?(?:or (?:below|less|under|lower))','i'),new RegExp('(?:below|under|price limit(?: of)?|max(?:imum)? price(?: of)?|limit(?: of)?|≤|<=)\\s*'+N,'i'),new RegExp(N+'\\S*\\s*(?:veya|ya da)?\\s*(?:altında|altına|altı|aşağısında)','i'),new RegExp('(?:fiyat sınırı|fiyat limiti|en fazla fiyat)\\s*'+N,'i')]],
 ['expiry','Expiry',[new RegExp(N+'\\s*(?:simulated\\s*)?(?:steps?|blocks?|adım|blok)','i'),new RegExp('(?:within|after|expires? after|stop after)\\s*'+N,'i')]],
 ['budget','Budget',[new RegExp('(?:budget|spend(?:ing)?(?: cap)?(?: up to)?|total(?: cap)?|up to|at most|no more than|cap(?: of)?)\\s*(?:of\\s*)?'+N,'i'),new RegExp(N+'\\s*(?:demo\\s*)?(?:rlo|rlousdt)\\b','i'),new RegExp('(?:bütçe\\S*|toplam|en fazla|harca\\S*)\\s*'+N,'i')]],
];
function read(text){let rest=' '+text.replace(/\s+/g,' ')+' ';const found={};
 for(const [id,,patterns] of FIELDS)for(const re of patterns){const m=rest.match(re);if(m){found[id]=Number(m[1].replace(',','.'));rest=rest.replace(m[0],' ');break;}}
 return found;}
function line(label,value,cls){const li=document.createElement('li');if(cls)li.className=cls;const s=document.createElement('span');s.textContent=label;li.append(s);if(value!==undefined){li.append(' ');const b=document.createElement('b');b.textContent=value;b.dataset.i18nIgnore='';li.append(b);}return li;}
$('plain-fill').onclick=()=>{const out=$('plain-result');out.replaceChildren();if($('limit').disabled){out.append(line('Finish or cancel your current rule first.',undefined,'missing'));return;}const found=read($('plain-text').value);
 if(!Object.keys(found).length){out.append(line('No price, budget or step count found. Try: buy at 8 or below, budget 20 RLO, 5 steps.',undefined,'missing'));return;}
 let filled=0;
 // Report in the form's order (price, budget, expiry), not the parsing order.
 for(const [id,label] of ['limit','budget','expiry'].map(id=>FIELDS.find(f=>f[0]===id))){const input=$(id);if(found[id]===undefined){out.append(line(label+' not found; kept the current value.',undefined,'missing'));continue;}
  const v=found[id],min=Number(input.min),max=Number(input.max),whole=input.step==='1';
  if(!(v>=min&&v<=max)||(whole&&!Number.isInteger(v))){out.append(line(label+' must be between '+min+' and '+max+(whole?' (whole steps)':'')+'. Kept:',input.value,'missing'));continue;}
  input.value=String(v);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));filled++;out.append(line(label,String(v)));}
 if(filled)out.append(line('Filled in the form below. Check it, then press Review rule.'));};
})();
