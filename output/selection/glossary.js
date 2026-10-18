/* Short, plain-language term explanations: a Terms panel in the site bar and small "i" marks next to matching labels. Read-only. */
(()=>{'use strict';
const TERMS={
 'demo-rlo':['Demo RLO','A made-up practice unit. It is not a token, has no price and cannot be withdrawn.'],
 'sepolia':['Sepolia','A free Ethereum test network. Its ETH has no real value and only pays test fees.'],
 'rabby':['Rabby','A browser wallet extension. Resonance uses it to read which pass NFTs your wallet holds.'],
 'pass':['Learning pass (NFT)','A test NFT you earn after a lesson. It opens the matching tool; it never allows spending.'],
 'mint':['Mint','Creating your pass NFT on Sepolia. You confirm it in Rabby and pay a small test-ETH fee.'],
 'tx-hash':['Transaction hash','The ID of a transaction. Paste it to check a mint you already sent.'],
 'condition':['Condition (trigger)','A rule such as “price at or below 8”. When it becomes true, the action is queued, not done yet.'],
 'execution':['Execution check','Right before acting, the rule is checked again. If the price moved past your limit, nothing is bought.'],
 'price-limit':['Price limit','The highest price you accept per unit. Above it, the purchase stops.'],
 'spending-cap':['Spending cap','The most this rule may spend in total, including the fee.'],
 'expiry':['Deadline (steps)','How many simulated steps the rule stays active. After that it expires and returns the money.'],
 'fee':['Execution fee','A fixed 0.10 Demo RLO charge for each executed order in these simulations.'],
 'reserve':['Protected reserve','Money the rules never spend. An order that would dip into it is stopped.'],
 'weekly-cap':['Weekly cap','The most all orders together may spend in one demo week. It resets each new week.'],
 'quote-age':['Quote age (fresh data)','How old a price is. Prices older than your limit count as stale and are rejected.'],
 'price-path':['Price path','A made-up sequence of prices used to test rules. It is not a forecast.'],
 'plans-ab':['Plan A / Plan B','Two rule sets tested on the same price path, so the only difference is the rules.'],
 'total-value':['Modeled total value','Cash plus unsold demo assets valued at the last price. It is not realized profit.'],
 'assumed-rate':['Assumed annual rate','A growth rate you choose for the illustration. It is not a promised return.'],
 'operating-cash':['Operating cash','Money available this period from cash and income, before savings and goals.'],
 'flexible-savings':['Flexible savings','Savings the plan may use for checked expenses only with your explicit permission.'],
 'priority':['Priority','When money is short, lower numbers are funded first.'],
 'allocation':['Allocation','Money set aside for an expense or goal in a plan. It is not a payment.'],
 'latch':['Latch','An outside policy service that can check a proposed purchase. A check is not a purchase or an approval.']};
// English label or heading text → term. Matching uses the original English, so it also works in Turkish.
const LABELS={
 'Buy when unit price is at or below (Demo RLO)':'price-limit','Total spending cap (demo RLO)':'spending-cap','Expire after simulated steps':'expiry','Simulated market price (Demo RLO per demo asset)':'execution','Simulate stale price data':'quote-age',
 'Starting demo balance':'demo-rlo','Keep untouched':'reserve','Maximum per demo week':'weekly-cap','Cost of each proposed order':'fee','Buy only at or below':'price-limit','Reject quotes older than':'quote-age',
 'Starting balance · Demo RLO':'demo-rlo','Untouched reserve · Demo RLO':'reserve','Weekly cap · Demo RLO':'weekly-cap','Cost per order, including fee · Demo RLO':'fee','Unit price limit · Demo RLO':'price-limit','Maximum quote age · minutes':'quote-age','Scenario set':'price-path','Assumed annual rate · % (−99 to 100)':'assumed-rate','Same market. Different boundaries.':'plans-ab',
 'Current operating cash · RLO':'operating-cash','Protected cash floor · RLO':'reserve','Separate flexible savings · RLO':'flexible-savings','Allow this demo proposal to use flexible savings for checked expenses':'flexible-savings','Priority · 1–20':'priority','Your proposed allocation · not adopted or paid':'allocation',
 'Your learning pass opens the door.':'pass','Bring your Ece pass.':'pass','Your Ade pass opens the lab.':'pass','Your Denis pass opens the studio.':'pass','Your learning passes':'pass',
 '1. Choose your learning pass':'pass','2. Check your wallet':'rabby','3. Mint your pass':'mint','I reviewed the character, wallet and Sepolia fee.':'sepolia','Sepolia transaction hash':'tx-hash'};
const source=node=>(window.ResonanceI18n?window.ResonanceI18n.source(node):node.data).trim();
let popover=null,pinned=null;
function place(chip){
 const [name,text]=TERMS[chip.dataset.term];popover.querySelector('strong').textContent=name;popover.querySelector('p').textContent=text;popover.hidden=false;
 const r=chip.getBoundingClientRect(),w=Math.min(300,innerWidth-32);popover.style.width=w+'px';
 popover.style.left=Math.max(16,Math.min(r.left+r.width/2-w/2,innerWidth-w-16))+scrollX+'px';
 const below=r.bottom+8+popover.offsetHeight<innerHeight;popover.style.top=(below?r.bottom+8:r.top-8-popover.offsetHeight)+scrollY+'px';
}
function hide(){pinned=null;if(popover)popover.hidden=true;}
// Marks sit inside labels, so they stay out of the accessible name; the Terms panel carries the same text for keyboard and screen reader users.
function chip(term){
 const mark=document.createElement('span');mark.className='term-chip';mark.dataset.term=term;mark.setAttribute('aria-hidden','true');
 mark.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(pinned===mark){hide();return;}pinned=mark;place(mark);});
 mark.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!pinned)place(mark);});
 mark.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!pinned)hide();});
 return mark;
}
function scan(root){
 for(const el of root.querySelectorAll?root.querySelectorAll('label,h2'):[]){
  if(el.querySelector(':scope > .term-chip')||el.closest('#site-bar,#terms-panel,#tour-card'))continue;
  const text=[...el.childNodes].find(n=>n.nodeType===3&&n.data.trim());const term=text&&LABELS[source(text)];
  if(term)text.after(chip(term));
 }
}
function mount(){
 popover=document.createElement('div');popover.id='term-popover';popover.hidden=true;popover.innerHTML='<strong></strong><p></p>';document.body.append(popover);
 document.addEventListener('click',e=>{if(pinned&&!popover.contains(e.target))hide();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 if(window.ResonanceSiteBar){
  const button=document.createElement('button');button.type='button';button.id='site-terms';button.className='site-tool';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','terms-panel');
  button.innerHTML='<span class="site-tool-icon" aria-hidden="true">Aa</span><span class="site-tool-label">Terms</span>';
  const panel=document.createElement('section');panel.id='terms-panel';panel.hidden=true;panel.setAttribute('aria-labelledby','terms-title');
  panel.innerHTML='<h2 id="terms-title">Terms used in Resonance</h2><dl></dl>';
  for(const [name,text] of Object.values(TERMS)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=text;panel.querySelector('dl').append(dt,dd);}
  const toggle=open=>{panel.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open)panel.focus();};panel.tabIndex=-1;
  button.onclick=e=>{e.stopPropagation();toggle(panel.hidden);};
  document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&e.target!==button)toggle(false);});
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){toggle(false);button.focus();}});
  window.ResonanceSiteBar.add(button);window.ResonanceSiteBar.add(panel);
 }
 scan(document.body);
 let queued=new Set();
 new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1&&!n.classList.contains('term-chip'))queued.add(n);if(queued.size)requestAnimationFrame(()=>{const nodes=[...queued];queued=new Set();for(const n of nodes)if(n.isConnected){scan(n);if(n.matches('label,h2'))scan(n.parentElement||n);}});}).observe(document.body,{childList:true,subtree:true});
}
window.ResonanceGlossary={terms:TERMS};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
