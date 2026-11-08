/* Before the four-question check: a short animated walkthrough of the character's tool, one card per question.
   It opens on the visitor's first real press of the check button, plays each card's motion once (CSS and inline SVG;
   transform, opacity and one stroke draw), and its last button opens the check. Later visits, and a saved journey
   that replays the press, go straight to the check; "Watch the explainer again" reopens it. All words are DOM text,
   so the Turkish dictionary translates them. Reduced motion shows each card's final frame. Built only when opened. */
(()=>{'use strict';
const KEY='resonance.explainers.v1';
const seen=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return {};}};
const mark=i=>{try{const s=seen();s[i]=1;localStorage.setItem(KEY,JSON.stringify(s));}catch{}};
const who=()=>[...document.querySelectorAll('#resonance-select .rs-person')].findIndex(b=>b.getAttribute('aria-pressed')==='true');

// Small SVG helpers; every visible word is its own text node so it can be translated.
const T=(x,y,text,cls='rx-label',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${text}</text>`;
const coin=(x,y,label)=>`<circle cx="${x}" cy="${y}" r="17" class="rx-coin"/>${T(x,y+5,label,'rx-coin-text','middle')}`;
const wallet=(x,y)=>`<rect x="${x}" y="${y}" width="74" height="50" rx="7" class="rx-wallet"/><rect x="${x+48}" y="${y+16}" width="26" height="18" rx="4" class="rx-wallet-flap"/>`;

const DECKS={
 0:{name:'Diren',tool:'Reactive Vault',portrait:'diren.jpg',cards:[
  {title:'Checked at the end of the step',
   caption:'7.5 is at or below 8: the purchase is queued and checked again when it runs.',
   note:'On Rialo, conditions are evaluated at the end of block execution; the action runs in the same block or a later one.',
   svg:`<g class="rx-grid"><line x1="30" y1="70" x2="370" y2="70"/><line x1="30" y1="110" x2="370" y2="110"/><line x1="30" y1="190" x2="370" y2="190"/><line x1="30" y1="230" x2="370" y2="230"/></g>
    <line x1="30" y1="150" x2="370" y2="150" class="rx-limit"/><text x="30" y="141" class="rx-label rx-accent"><tspan>Limit</tspan> 8</text>
    ${T(22,88,'9','rx-num rx-muted','end')}
    <path class="rx-draw rx-price" pathLength="1" d="M30 84 L120 98 L210 112 L300 186"/>
    <g class="rx-pop" style="--d:2.2s"><circle cx="300" cy="186" r="7" class="rx-dot"/>${T(314,204,'7.5','rx-num')}</g>
    <g class="rx-fade" style="--d:2.6s"><line x1="352" y1="58" x2="352" y2="226" class="rx-scan"/>${T(352,50,'End of step','rx-label','middle')}</g>
    <g class="rx-pop" style="--d:3s"><rect x="318" y="232" width="68" height="26" rx="3" class="rx-true"/>${T(352,250,'TRUE','rx-badge','middle')}</g>
    <rect x="404" y="66" width="140" height="158" rx="6" class="rx-box"/>${T(474,90,'Queue','rx-label','middle')}
    <g class="rx-slide" style="--d:3.5s"><rect x="420" y="112" width="108" height="36" rx="4" class="rx-chip"/><text x="474" y="135" class="rx-chip-text" text-anchor="middle"><tspan>Buy</tspan> · 7.5</text></g>`},
  {title:'Checked again when it runs',
   caption:'Above your limit when it runs? It stops, and your Demo RLO comes back.',
   svg:`<rect x="16" y="70" width="162" height="92" rx="6" class="rx-box"/>${T(97,94,'Queue','rx-label','middle')}
    <rect x="24" y="108" width="146" height="36" rx="4" class="rx-chip"/>${T(97,131,'Queued at 8','rx-chip-text','middle')}
    <path d="M186 116 H236" class="rx-arrow rx-draw" pathLength="1" style="--dur:.6s"/><path d="M228 109 L238 116 L228 123" class="rx-arrowhead rx-fade" style="--d:.75s"/>
    <rect x="248" y="52" width="170" height="130" rx="6" class="rx-box rx-run"/>${T(333,76,'Runs','rx-label','middle')}
    ${T(333,124,'Price','rx-label rx-muted','middle')}
    <text x="333" y="164" class="rx-big rx-out" text-anchor="middle" style="--d:1.4s">8</text>
    <text x="333" y="164" class="rx-big rx-fade rx-red-text" text-anchor="middle" style="--d:1.4s">9</text>
    <text x="440" y="124" class="rx-label rx-accent"><tspan>Limit</tspan> 8</text>
    <g class="rx-stamp" style="--d:2.2s"><rect x="268" y="196" width="130" height="34" rx="3" class="rx-stop"/>${T(333,219,'STOP','rx-badge','middle')}</g>
    ${wallet(40,206)}<g class="rx-fade" style="--d:3.6s">${T(124,236,'Returned')}</g>
    <g class="rx-fly" style="--d:2.7s;--fx:256px;--fy:-96px">${coin(77,231,'20')}</g>`},
  {title:'Your cap includes the fee',
   caption:'A total cap of 20 means 19.90 for the asset and 0.10 for the fee. A rule never spends more than its cap.',
   svg:`${T(40,78,'Total cap · 20','rx-label')}
    <rect x="40" y="96" width="480" height="58" rx="4" class="rx-track"/>
    <rect x="42" y="98" width="462" height="54" rx="3" class="rx-fill rx-grow" style="--d:.3s"/>
    <rect x="506" y="98" width="12" height="54" rx="2" class="rx-fee rx-pop" style="--d:1.5s"/>
    <g class="rx-fade" style="--d:1.1s">${T(56,184,'19.90 · asset','rx-num')}</g>
    <g class="rx-fade" style="--d:1.9s"><path d="M512 158 V196 H470" class="rx-pointer"/>${T(462,201,'0.10 · fee','rx-num rx-pink','end')}</g>
    <g class="rx-fade" style="--d:2.5s"><path d="M40 222 H520" class="rx-bracket"/>${T(280,250,'= 20','rx-num','middle')}</g>`},
  {title:'Expired or cancelled, it comes back',
   caption:'If the price never reaches your limit before the rule expires, the reserved Demo RLO returns. Cancelling does the same. Stale data skips a step, but the clock keeps going.',
   svg:`${T(30,60,'Step','rx-label rx-muted')}
    <path d="M60 110 H420" class="rx-track-line"/><path d="M60 110 H420" class="rx-draw rx-progress" pathLength="1" style="--dur:3s;--d:.2s"/>
    ${[0,1,2,3,4].map(k=>`<g class="rx-pop" style="--d:${(.3+k*.65).toFixed(2)}s"><circle cx="${60+k*90}" cy="110" r="11" class="rx-step${k===2?' rx-step-stale':''}"/>${T(60+k*90,114,String(k+1),'rx-step-text','middle')}</g>`).join('')}
    ${['8.4','8.9','','8.6','8.3'].map((p,k)=>p?`<g class="rx-fade" style="--d:${(.4+k*.65).toFixed(2)}s">${T(60+k*90,82,p,'rx-num rx-muted','middle')}</g>`:'').join('')}
    <g class="rx-fade" style="--d:1.7s"><rect x="196" y="136" width="128" height="26" rx="3" class="rx-stale"/>${T(260,154,'Stale · skipped','rx-label','middle')}</g>
    <g class="rx-stamp" style="--d:3.1s"><rect x="344" y="136" width="152" height="30" rx="3" class="rx-expired"/>${T(420,156,'Expired','rx-badge','middle')}</g>
    ${wallet(40,196)}<g class="rx-fly" style="--d:3.6s;--fx:332px;--fy:-108px">${coin(77,221,'20')}</g>
    <g class="rx-fade" style="--d:4.4s"><rect x="150" y="206" width="210" height="30" rx="15" class="rx-cancel"/>${T(255,226,'Cancel returns it too','rx-label','middle')}</g>`}
 ]}
};

const CSS=`
.rx{position:fixed;inset:0;z-index:900;display:grid;place-items:center;padding:16px;background:rgba(3,6,14,.86);color:#e6eeff;font:16px/1.5 "Resonance Body",system-ui,sans-serif}
.rx[hidden]{display:none}
.rx-panel{position:relative;width:min(760px,100%);max-height:calc(100dvh - 32px);overflow:auto;padding:20px 22px 18px;border:1px solid rgba(51,227,255,.38);border-radius:2px;background:linear-gradient(150deg,rgba(17,29,52,.97),rgba(7,12,26,.98));box-shadow:0 0 0 1px rgba(51,227,255,.08),0 30px 80px -20px #000,0 0 60px -20px rgba(51,227,255,.35)}
.rx-head{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.rx-face{width:46px;height:46px;border-radius:50%;object-fit:cover;object-position:50% 18%;box-shadow:0 0 0 2px var(--rx-c),0 0 18px -2px var(--rx-c)}
.rx-eyebrow{margin:0;font:600 11px/1.2 "Resonance Display",system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--rx-c)}
.rx-who{margin:3px 0 0;font:700 17px/1.2 "Resonance Display",system-ui,sans-serif;letter-spacing:.04em}
.rx-count{margin-left:auto;white-space:nowrap;color:#9fb0d8;font:600 13px/1 "Resonance Display",system-ui,sans-serif;letter-spacing:.1em}
.rx button{font:inherit;cursor:pointer}
.rx-x{width:36px;height:36px;margin:0;padding:0;border:1px solid rgba(159,176,216,.35);border-radius:2px;background:transparent;color:#cfd9f2;font-size:20px!important;line-height:1}
.rx-stage{position:relative}
.rx-card[hidden]{display:none}
.rx-svg{display:block;width:100%;height:auto;margin:4px 0 6px;border:1px solid rgba(51,227,255,.14);background:radial-gradient(120% 90% at 50% 0%,rgba(51,227,255,.07),transparent 60%),#060c1a}
.rx-card h2{margin:10px 0 4px;font:700 clamp(18px,2.6vw,23px)/1.25 "Resonance Display",system-ui,sans-serif;letter-spacing:.03em;color:#f0f6ff}
.rx-cap{margin:0;font-size:clamp(15px,2vw,17px);color:#dfe8ff}
.rx-note{margin:8px 0 0;padding-left:10px;border-left:2px solid var(--rx-c);color:#9fb0d8;font-size:14px}
.rx-replay{position:absolute;top:10px;right:10px;margin:0;padding:4px 10px;border:1px solid rgba(159,176,216,.3);border-radius:2px;background:rgba(6,12,26,.7);color:#cfd9f2;font-size:12px!important}
.rx-foot{display:flex;align-items:center;gap:12px;margin-top:16px}
.rx-dots{display:flex;gap:7px;margin:0 auto}
.rx-dots i{width:22px;height:4px;border-radius:2px;background:rgba(159,176,216,.25)}
.rx-dots i.on{background:var(--rx-c);box-shadow:0 0 10px var(--rx-c)}
.rx-back,.rx-next{min-height:44px;margin:0;padding:10px 18px;border-radius:2px;font-weight:700!important;letter-spacing:.04em}
.rx-back{border:1px solid rgba(159,176,216,.4);background:transparent;color:#dfe8ff}
.rx-back:disabled{opacity:.35;cursor:default}
.rx-next{border:1px solid var(--rx-c);background:var(--rx-c);color:#04121c;box-shadow:0 0 22px -6px var(--rx-c)}
.rx :focus-visible{outline:2px solid #fff;outline-offset:3px}
/* SVG pieces (the resting state is the final frame; animations only run on .play) */
.rx-grid line{stroke:rgba(159,176,216,.1);stroke-width:1}
.rx-label{fill:#cfd9f2;font:600 13px "Resonance Display",system-ui,sans-serif;letter-spacing:.06em}
.rx-num{fill:#e6eeff;font:700 17px "Resonance Display",system-ui,sans-serif}
.rx-big{fill:#e6eeff;font:700 40px "Resonance Display",system-ui,sans-serif}
.rx-muted{fill:#8c9cc4}.rx-accent{fill:var(--rx-c)}.rx-pink{fill:#ff8fc4}.rx-red-text{fill:#ff6b7d}
.rx-limit{stroke:var(--rx-c);stroke-width:2;stroke-dasharray:6 6}
.rx-price{fill:none;stroke:#e6eeff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.rx-dot{fill:#ff4fa3;filter:drop-shadow(0 0 6px #ff4fa3)}
.rx-scan{stroke:var(--rx-c);stroke-width:2;filter:drop-shadow(0 0 6px var(--rx-c))}
.rx-true{fill:rgba(108,245,203,.18);stroke:#6cf5cb}
.rx-badge{fill:#f4fffb;font:800 14px "Resonance Display",system-ui,sans-serif;letter-spacing:.16em}
.rx-box{fill:rgba(12,22,44,.8);stroke:rgba(51,227,255,.3)}
.rx-run{stroke:rgba(255,107,125,.45)}
.rx-chip{fill:rgba(51,227,255,.14);stroke:var(--rx-c)}
.rx-chip-text{fill:#e6eeff;font:700 14px "Resonance Display",system-ui,sans-serif}
.rx-arrow{fill:none;stroke:#9fb0d8;stroke-width:2}.rx-arrowhead{fill:none;stroke:#9fb0d8;stroke-width:2;stroke-linejoin:round}
.rx-stop{fill:rgba(255,90,108,.2);stroke:#ff5a6c}
.rx-expired{fill:rgba(170,130,255,.2);stroke:#aa82ff}
.rx-stale{fill:rgba(159,176,216,.1);stroke:rgba(159,176,216,.4);stroke-dasharray:4 4}
.rx-cancel{fill:rgba(255,79,163,.1);stroke:rgba(255,79,163,.5)}
.rx-wallet{fill:rgba(12,22,44,.9);stroke:#9fb0d8}.rx-wallet-flap{fill:rgba(51,227,255,.14);stroke:#9fb0d8}
.rx-coin{fill:#ffcf6b;stroke:#fff3c4;stroke-width:1.5;filter:drop-shadow(0 0 6px rgba(255,207,107,.7))}
.rx-coin-text{fill:#3a2700;font:800 12px "Resonance Display",system-ui,sans-serif}
.rx-track{fill:rgba(6,12,26,.9);stroke:rgba(159,176,216,.4)}
.rx-fill{fill:var(--rx-c);opacity:.85}.rx-fee{fill:#ff4fa3;filter:drop-shadow(0 0 6px #ff4fa3)}
.rx-pointer,.rx-bracket{fill:none;stroke:#9fb0d8;stroke-width:1.5}
.rx-track-line{stroke:rgba(159,176,216,.25);stroke-width:4;stroke-linecap:round}
.rx-progress{fill:none;stroke:var(--rx-c);stroke-width:4;stroke-linecap:round}
.rx-step{fill:#0b1530;stroke:var(--rx-c);stroke-width:2}.rx-step-stale{stroke:#8c9cc4;stroke-dasharray:3 3}
.rx-step-text{fill:#e6eeff;font:700 12px "Resonance Display",system-ui,sans-serif}
.rx-draw{stroke-dasharray:1;stroke-dashoffset:0}
.rx-out{opacity:0}
.rx-pop,.rx-stamp{transform-box:fill-box;transform-origin:center}
.rx-card.play .rx-draw{animation:rx-draw var(--dur,2s) cubic-bezier(.45,.1,.2,1) var(--d,.2s) backwards}
.rx-card.play .rx-pop{animation:rx-pop .45s cubic-bezier(.2,.9,.3,1.35) var(--d) backwards}
.rx-card.play .rx-fade{animation:rx-fade .5s ease var(--d) backwards}
.rx-card.play .rx-out{animation:rx-out .4s ease var(--d) backwards}
.rx-card.play .rx-slide{animation:rx-slide .7s cubic-bezier(.2,.8,.2,1) var(--d) backwards}
.rx-card.play .rx-stamp{animation:rx-stamp .5s cubic-bezier(.2,.9,.3,1.3) var(--d) backwards}
.rx-card.play .rx-fly{animation:rx-fly 1s cubic-bezier(.5,0,.2,1) var(--d) backwards}
.rx-card.play .rx-grow{animation:rx-grow 1.1s cubic-bezier(.3,.7,.2,1) var(--d) backwards;transform-box:fill-box;transform-origin:left center}
@keyframes rx-draw{from{stroke-dashoffset:1}}
@keyframes rx-pop{from{opacity:0;transform:scale(.4)}}
@keyframes rx-fade{from{opacity:0}}
@keyframes rx-out{from{opacity:1}}
@keyframes rx-slide{from{opacity:0;transform:translateX(-90px)}}
@keyframes rx-stamp{from{opacity:0;transform:scale(1.8) rotate(-8deg)}}
@keyframes rx-fly{from{opacity:0;transform:translate(var(--fx),var(--fy))}15%{opacity:1}}
@keyframes rx-grow{from{transform:scaleX(0)}}
@media(max-width:560px){.rx{padding:8px}.rx-panel{padding:14px 12px}.rx-back,.rx-next{padding:10px 12px}.rx-dots i{width:14px}.rx-label{font-size:16px}.rx-num{font-size:20px}.rx-chip-text{font-size:15px}.rx-badge{font-size:15px;letter-spacing:.08em}.rx-step-text{font-size:14px}.rx-replay{top:6px;right:6px}}
@media(prefers-reduced-motion:reduce){.rx-card *{animation:none!important}}
`;
let root=null,deck=null,index=0,onDone=null,opener=null;
function build(){
 if(root)return;
 const style=document.createElement('style');style.id='rx-style';style.textContent=CSS;document.head.append(style);
 root=document.createElement('div');root.id='rx';root.className='rx';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','rx-who');
 root.innerHTML='<div class="rx-panel"><header class="rx-head"><img class="rx-face" alt=""><div><p class="rx-eyebrow">Before the check</p><p class="rx-who" id="rx-who"></p></div><span class="rx-count" data-i18n-ignore></span><button type="button" class="rx-x">×</button></header><div class="rx-stage"></div><footer class="rx-foot"><button type="button" class="rx-back">Back</button><div class="rx-dots" aria-hidden="true"></div><button type="button" class="rx-next">Next</button></footer></div>';
 root.querySelector('.rx-x').setAttribute('aria-label','Close');
 document.body.append(root);
 root.querySelector('.rx-x').onclick=()=>close();
 root.querySelector('.rx-back').onclick=()=>show(index-1);
 root.querySelector('.rx-next').onclick=()=>index<deck.cards.length-1?show(index+1):finish();
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='ArrowRight'){e.preventDefault();if(index<deck.cards.length-1)show(index+1);}else if(e.key==='ArrowLeft'){e.preventDefault();if(index>0)show(index-1);}
  else if(e.key==='Tab'){const f=[...root.querySelectorAll('button:not(:disabled)')],first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
}
function play(card){card.classList.remove('play');void card.getBoundingClientRect();card.classList.add('play');}
function show(i){
 index=Math.max(0,Math.min(deck.cards.length-1,i));
 root.querySelectorAll('.rx-card').forEach((c,k)=>{c.hidden=k!==index;if(k===index)play(c);});
 root.querySelector('.rx-count').textContent=(index+1)+' / '+deck.cards.length;
 root.querySelectorAll('.rx-dots i').forEach((d,k)=>d.classList.toggle('on',k===index));
 root.querySelector('.rx-back').disabled=index===0;
 const next=root.querySelector('.rx-next');next.textContent=index===deck.cards.length-1?'Continue to the check →':'Next';
}
function open(i,done){
 build();deck=DECKS[i];onDone=done;opener=document.activeElement;
 root.style.setProperty('--rx-c',['#33e3ff','#ff4fa3','#aa82ff','#ff8a4c'][i]||'#33e3ff');
 root.querySelector('.rx-face').src=new URL(deck.portrait,document.baseURI).href;
 root.querySelector('.rx-who').textContent=deck.name+' · '+deck.tool;
 const stage=root.querySelector('.rx-stage');stage.replaceChildren();
 deck.cards.forEach(c=>{const card=document.createElement('section');card.className='rx-card';card.hidden=true;
  card.innerHTML='<svg class="rx-svg" viewBox="0 0 560 270" role="img" aria-hidden="true">'+c.svg+'</svg><button type="button" class="rx-replay">↻ Replay</button><h2></h2><p class="rx-cap" aria-live="polite"></p>'+(c.note?'<p class="rx-note"></p>':'');
  card.querySelector('h2').textContent=c.title;card.querySelector('.rx-cap').textContent=c.caption;if(c.note)card.querySelector('.rx-note').textContent=c.note;
  card.querySelector('.rx-replay').onclick=()=>play(card);stage.append(card);});
 root.querySelector('.rx-dots').innerHTML=deck.cards.map(()=>'<i></i>').join('');
 root.hidden=false;document.documentElement.classList.add('rx-open');show(0);root.querySelector('.rx-next').focus();
}
function close(){if(!root||root.hidden)return;root.hidden=true;document.documentElement.classList.remove('rx-open');if(opener&&opener.isConnected)opener.focus();}
function finish(){const done=onDone;close();done&&done();}
// First real press of the check button for a character with a deck: show the cards, then open the check.
// The capture listener on window runs before the journey recorder (document), so the press is recorded once, when the check opens.
addEventListener('click',e=>{if(!e.isTrusted)return;const button=e.target.closest&&e.target.closest('#lesson-quiz');if(!button||button.disabled)return;const i=who();if(!DECKS[i]||seen()[i])return;
 e.preventDefault();e.stopImmediatePropagation();open(i,()=>{mark(i);if(button.isConnected)button.click();});},true);
// After the first viewing, the check button gets a quiet way back to the cards.
const chapter=document.getElementById('chapter');
if(chapter)new MutationObserver(()=>{const b=document.getElementById('lesson-quiz'),i=who();if(!b||!DECKS[i]||!seen()[i]||b.parentNode.querySelector('.rx-again'))return;
 const again=document.createElement('button');again.type='button';again.className='secondary rx-again';again.textContent='Watch the explainer again';again.onclick=()=>open(i,()=>{if(b.isConnected)b.click();});b.after(again);}).observe(chapter,{childList:true,subtree:true});
window.ResonanceExplainer={open:i=>DECKS[i]&&open(i,()=>{const b=document.getElementById('lesson-quiz');if(b)b.click();}),decks:Object.keys(DECKS).map(Number)};
})();
