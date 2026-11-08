/* "Start tour": highlights the parts of the current page one by one. Read-only; it never clicks, fills or authorizes anything. */
(()=>{'use strict';
const q=s=>()=>document.querySelector(s),last=s=>()=>[...document.querySelectorAll(s)].at(-1);
const bar={target:q('#site-bar'),title:'Your controls',text:'Go back home, switch English and Turkish, and choose the demo budget unit here. Terms explains the words you will meet.'};
const tool=(what,next)=>[
 {target:q('main h1'),title:'What this tool does',text:what},
 {target:q('main details.fine-print'),title:'The fine print',text:'Safety notes are folded into one line. Open Details to read all of it.'},
 {target:q('.tool-navigation'),title:'Four tools',text:'Switch between the character tools. Each one checks its own pass.'},
 {target:q('#gate'),title:'Open the tool',text:'Follow the numbered steps: connect your wallet, switch to Sepolia, check your pass, then enter. The NFT is access only; it never allows spending.'},
 {target:q('#first-example'),title:'Start with the example',text:'One click prepares a worked example. You still review and confirm every step yourself.'},
 {target:q('#diren-plan,#tool-plan'),title:'Your rules',text:'Change the limits here. The small i next to a field explains the term.'},
 {target:q('#diren-result,#tool-result'),title:'Results',text:next},
 {target:q('#diren-extra,#tool-extra'),title:'More tools',text:'Saved plans, custom scenarios and extra examples are here when you need them.'},
 {target:q('#site-terms'),title:'Unfamiliar word?',text:'Open Terms for a one-sentence explanation of each term.'}];
const PAGES={
 home:[bar,
  {target:q('.hero .actions'),title:'Start here',text:'Begin the adventure to pick a character and watch four short cards. Lessons need no wallet.'},
  {target:q('#journey'),title:'Learn, earn, apply',text:'Each character teaches one rule. A four-question check unlocks a learning pass NFT on the Sepolia test network.'},
  {target:q('#characters'),title:'Four tools',text:'Each pass opens one tool. The tools use made-up money, so you can test rules safely.'},
  {target:q('#updates'),title:'What changed',text:'Release notes list what is new in each version.'}],
 academy:[
  {target:q('.rs-grid'),title:'Choose a guide',text:'Each character teaches a different rule and later opens a different tool.'},
  {target:q('#rs-input'),title:'Your name',text:'This name appears in the story. It stays in this browser.'},
  {target:q('#rs-start'),title:'Begin',text:'Opens four short cards about this character’s tool, then a four-question check. Progress is saved in this browser, not on a server.'},
  {target:q('#character-enter'),title:'Start the lesson',text:'A short lesson, then a four-question check. Passing it lets you mint this character’s pass.'},
  {target:q('.rl-learn-button'),title:'Learn more',text:'Background on Rialo’s reactive transactions, whenever you want it.'},
  {target:last('.profile-trigger'),title:'Learning passes',text:'See which lessons you finished and which passes you can mint.'},
  bar],
 mint:[
  {target:q('.pass-card'),title:'Pick your pass',text:'Choose a character. The card shows the NFT you will receive.'},
  {target:()=>document.querySelector('.mint-steps .step'),title:'Connect and check',text:'Connect your wallet, switch to Sepolia, then check whether this wallet can claim. Nothing is sent yet.'},
  {target:()=>document.querySelectorAll('.mint-steps .step')[1],title:'Mint',text:'Tick the review box, then request the mint. Your wallet shows the final test-ETH fee before you confirm.'},
  bar],
 my:[
  {target:q('.wallet'),title:'Check your passes',text:'Connect your wallet to see which character passes this wallet holds. Connecting never allows spending.'},
  {target:q('.summary'),title:'Your progress',text:'Lessons finished in this browser, passes held on Sepolia and saved plans.'},
  {target:q('.characters'),title:'Your next step',text:'Each card shows where you are with a character and where to go next.'},
  {target:q('#plans'),title:'Saved plans',text:'Plans you saved in any tool. Opening one never runs it automatically.'},
  bar],
 diren:tool('Set a price limit and a budget. The rule buys once, and only if the price is still within your limit when it runs.','The outcome appears here with a one-sentence summary you can download as a card.'),
 ece:tool('Give several purchases one shared set of limits, then see which orders your rules stop.','The comparison with and without Ece appears here, with a one-sentence summary and a downloadable card.'),
 eric:tool('Fund essential expenses first, then goals, and see what is left. Nothing is paid.','Your proposed allocation appears here, with a one-sentence summary and a downloadable card.'),
 ade:tool('Run two rule sets on the same made-up price paths and compare how they end.','The A/B comparison appears here, with a one-sentence summary and a downloadable card.')};
function page(){
 const c=document.body.dataset.vaultCharacter;if(document.getElementById('gate'))return ['diren','ece','eric','ade'][Number(c||0)];
 if(document.getElementById('resonance-select'))return 'academy';if(document.body.classList.contains('mint-page'))return 'mint';
 if(document.getElementById('plans'))return 'my';if(document.getElementById('journey'))return 'home';return null;
}
const visible=el=>el&&el.getClientRects().length>0&&!el.closest('[hidden]');
let steps=[],index=0,layer=null,opener=null;
function build(){
 layer=document.createElement('div');layer.id='tour-layer';layer.hidden=true;
 layer.innerHTML='<div id="tour-spot"></div><section id="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-title" tabindex="-1"><div id="tour-count"></div><h2 id="tour-title"></h2><p id="tour-text"></p><div id="tour-actions"><button type="button" id="tour-back">Back</button><button type="button" id="tour-next">Next</button><button type="button" id="tour-close">End tour</button></div></section>';
 document.body.append(layer);
 layer.querySelector('#tour-back').onclick=()=>go(index-1);layer.querySelector('#tour-next').onclick=()=>index===steps.length-1?close():go(index+1);layer.querySelector('#tour-close').onclick=close;
 layer.addEventListener('keydown',e=>{if(e.key==='Escape')close();else if(e.key==='ArrowRight')layer.querySelector('#tour-next').click();else if(e.key==='ArrowLeft'&&index>0)go(index-1);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!layer.hidden&&!layer.contains(e.target))close();});
 addEventListener('resize',()=>{if(!layer.hidden)position();});addEventListener('scroll',()=>{if(!layer.hidden)position();},{passive:true});
}
function position(){
 const el=steps[index].el,r=el.getBoundingClientRect(),pad=8,spot=layer.querySelector('#tour-spot'),card=layer.querySelector('#tour-card');
 Object.assign(spot.style,{left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});
 const w=Math.min(360,innerWidth-32);card.style.width=w+'px';const h=card.offsetHeight;
 let top=r.bottom+pad+12;if(top+h>innerHeight-12)top=r.top-pad-12-h;if(top<12)top=Math.max(12,innerHeight-h-12);
 card.style.top=top+'px';card.style.left=Math.max(16,Math.min(r.left,innerWidth-w-16))+'px';
}
function go(next){
 index=Math.max(0,Math.min(next,steps.length-1));const step=steps[index];
 layer.querySelector('#tour-count').textContent=(index+1)+' / '+steps.length;layer.querySelector('#tour-title').textContent=step.title;layer.querySelector('#tour-text').textContent=step.text;
 layer.querySelector('#tour-back').disabled=index===0;layer.querySelector('#tour-next').textContent=index===steps.length-1?'Finish':'Next';
 const r=step.el.getBoundingClientRect();if(r.top<60||r.bottom>innerHeight-200)step.el.scrollIntoView({block:r.height>innerHeight*.6?'start':'center'});
 position();requestAnimationFrame(position);layer.querySelector('#tour-card').focus({preventScroll:true});
}
function start(){
 const key=page();steps=(PAGES[key]||[bar]).map(s=>({...s,el:s.target()})).filter(s=>visible(s.el));if(!steps.length)return;
 if(!layer)build();opener=document.activeElement;layer.hidden=false;document.documentElement.classList.add('touring');go(0);
}
function close(){if(!layer||layer.hidden)return;layer.hidden=true;document.documentElement.classList.remove('touring');(opener&&opener.isConnected?opener:document.getElementById('site-tour'))?.focus();}
function mount(){
 if(!window.ResonanceSiteBar)return;
 const button=document.createElement('button');button.type='button';button.id='site-tour';button.className='site-tool';
 button.innerHTML='<span class="site-tool-icon" aria-hidden="true">▶</span><span class="site-tool-label">Start tour</span>';button.onclick=start;window.ResonanceSiteBar.add(button);
}
window.ResonanceTour={start,close,steps:()=>steps.map(s=>s.title)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
