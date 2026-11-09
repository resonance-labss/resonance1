/* Each character's lesson: four short animated cards about the character's tool, one per question of the check.
   The lesson page opens them right away (and the first real press of the check button does too, until they have
   been watched once). Each card plays its motion once (CSS and inline SVG; transform, opacity and stroke draws), and
   the last button opens the check. Later visits, and a saved journey that replays the press, go straight to the
   check; "Watch the cards again" reopens them. All words are DOM text,
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
const tick=(x,y)=>`<circle cx="${x}" cy="${y}" r="11" class="rx-ok"/><path d="M${x-5} ${y} l3.5 3.5 l6.5 -7" class="rx-mark"/>`;
const cross=(x,y)=>`<circle cx="${x}" cy="${y}" r="11" class="rx-bad"/><path d="M${x-4} ${y-4} l8 8 M${x+4} ${y-4} l-8 8" class="rx-mark"/>`;
const lamp=(x,y)=>`<circle cx="${x}" cy="${y}" r="11" class="rx-lamp"/>`;
const lock=(x,y)=>`<g class="rx-lock"><path d="M${x-5} ${y-2} v-4 a5 5 0 0 1 10 0 v4"/><rect x="${x-8}" y="${y-2}" width="16" height="13" rx="2"/></g>`;
const badge=(x,y,w,text,cls,d)=>`<g class="rx-stamp" style="--d:${d}s"><rect x="${x}" y="${y}" width="${w}" height="32" rx="3" class="${cls}"/>${T(x+w/2,y+21,text,'rx-badge','middle')}</g>`;
const fade=(d,body)=>`<g class="rx-fade" style="--d:${d}s">${body}</g>`;
const pop=(d,body)=>`<g class="rx-pop" style="--d:${d}s">${body}</g>`;

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
    ${T(333,116,'Price','rx-label rx-muted','middle')}
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
   svg:`${T(30,50,'Step','rx-label rx-muted')}
    <path d="M60 110 H420" class="rx-track-line"/><path d="M60 110 H420" class="rx-draw rx-progress" pathLength="1" style="--dur:3s;--d:.2s"/>
    ${[0,1,2,3,4].map(k=>`<g class="rx-pop" style="--d:${(.3+k*.65).toFixed(2)}s"><circle cx="${60+k*90}" cy="110" r="11" class="rx-step${k===2?' rx-step-stale':''}"/>${T(60+k*90,114,String(k+1),'rx-step-text','middle')}</g>`).join('')}
    ${['8.4','8.9','','8.6','8.3'].map((p,k)=>p?`<g class="rx-fade" style="--d:${(.4+k*.65).toFixed(2)}s">${T(60+k*90,82,p,'rx-num rx-muted','middle')}</g>`:'').join('')}
    <g class="rx-fade" style="--d:1.7s"><rect x="196" y="136" width="128" height="26" rx="3" class="rx-stale"/>${T(260,154,'Stale · skipped','rx-label','middle')}</g>
    <g class="rx-stamp" style="--d:3.1s"><rect x="344" y="136" width="152" height="30" rx="3" class="rx-expired"/>${T(420,156,'Expired','rx-badge','middle')}</g>
    ${wallet(40,196)}<g class="rx-fly" style="--d:3.6s;--fx:332px;--fy:-108px">${coin(77,221,'20')}</g>
    <g class="rx-fade" style="--d:4.4s"><rect x="150" y="206" width="210" height="30" rx="15" class="rx-cancel"/>${T(255,226,'Cancel returns it too','rx-label','middle')}</g>`}
 ]},
 // Ece: reserve floor, one shared weekly cap, fresh quotes, the weekly reset. Numbers match her four questions.
 1:{name:'Ece',tool:'Reserve Studio',portrait:'ece.jpg',cards:[
  {title:'Your reserve stays untouched',
   caption:'The check looks at what is left after the order. 40 − 20 = 20, exactly the amount you keep, so the order can run. An order that would leave less than 20 stops.',
   svg:`${T(115,30,'Balance · 40','rx-label','middle')}
    <rect x="70" y="44" width="90" height="204" rx="4" class="rx-track"/>
    <rect x="72" y="146" width="86" height="100" rx="2" class="rx-keep"/>${lock(115,196)}
    ${fade(1.3,'<rect x="72" y="46" width="86" height="98" rx="2" class="rx-ghost"/>')}
    <rect x="72" y="46" width="86" height="98" rx="2" class="rx-fill rx-shrink" style="--d:.9s"/>
    <line x1="52" y1="146" x2="178" y2="146" class="rx-limit"/>${T(186,151,'Keep 20','rx-label rx-accent')}
    <rect x="290" y="40" width="240" height="84" rx="6" class="rx-box"/>${T(410,64,'Order','rx-label','middle')}
    ${T(356,103,'fee included','rx-label rx-muted')}
    <g class="rx-fly" style="--d:1s;--fx:-212px;--fy:-6px">${coin(330,98,'20')}</g>
    ${fade(2,T(290,170,'40 − 20 = 20','rx-num'))}
    ${badge(290,196,96,'RUNS','rx-true',2.5)}${fade(2.9,T(398,217,'Reserve holds','rx-label'))}`},
  {title:'One weekly cap for every order',
   caption:'Both orders share one weekly allowance of 20. After the first 15, only 5 is left, so the second 15 would make 30 and stops. Each order is checked against the updated total.',
   svg:`${T(40,32,'Shared weekly cap · 20','rx-label rx-accent')}
    <rect x="40" y="48" width="190" height="34" rx="4" class="rx-chip"/>${T(135,70,'Order A · 15','rx-chip-text','middle')}
    ${badge(244,49,96,'RUNS','rx-true',1.6)}${fade(1.2,T(360,71,'0 + 15 = 15','rx-num'))}
    <rect x="40" y="96" width="190" height="34" rx="4" class="rx-chip"/>${T(135,118,'Order B · 15','rx-chip-text','middle')}
    ${badge(244,97,96,'STOP','rx-stop',2.8)}${fade(2.3,T(360,119,'15 + 15 = 30','rx-num rx-red-text'))}
    <rect x="40" y="160" width="480" height="40" rx="4" class="rx-track"/>
    <rect x="42" y="162" width="357" height="36" rx="3" class="rx-fill rx-grow" style="--d:.8s"/>
    ${fade(2.3,'<rect x="401" y="162" width="117" height="36" rx="3" class="rx-over"/><path d="M524 180 H548 M541 173 L549 180 L541 187" class="rx-red-line"/>')}
    ${T(40,226,'0','rx-num rx-muted')}${T(400,226,'15','rx-num','middle')}${T(520,226,'20','rx-num rx-muted','end')}
    ${fade(3.2,T(460,254,'5 left','rx-label','middle'))}`},
  {title:'Old quotes do not count',
   caption:'A good price on an old quote is not a current price. When the quote is older than your data-age limit, this attempt stops. A later event with a fresh quote can qualify again.',
   svg:`<rect x="24" y="30" width="270" height="160" rx="6" class="rx-box"/>${T(159,56,'Quote','rx-label','middle')}
    ${pop(.5,tick(48,88))}${T(68,93,'Price 7.80 · limit 8','rx-label')}
    ${pop(1.3,cross(48,126))}${T(68,131,'Quote 5 min old','rx-label')}
    ${T(68,166,'Allowed age: 2 min','rx-label rx-muted')}
    ${badge(24,204,104,'STOP','rx-stop',2)}${fade(2.4,T(140,225,'Waits for fresh data','rx-label'))}
    ${fade(2.9,'<path d="M300 110 H318 M311 103 L319 110 L311 117" class="rx-arrow"/>')}
    ${fade(3,`<rect x="326" y="30" width="210" height="160" rx="6" class="rx-box"/>${T(431,56,'Next quote','rx-label','middle')}${tick(350,88)}${T(370,93,'Price OK','rx-label')}${tick(350,126)}${T(370,131,'20 seconds old','rx-label')}`)}
    ${badge(432,204,104,'RUNS','rx-true',3.6)}`},
  {title:'A new week renews the allowance',
   caption:'A new week renews the spending allowance only. Your balance stays where it was, and the 20 you keep untouched stays protected.',
   svg:`<rect x="40" y="12" width="124" height="30" rx="15" class="rx-chip"/>
    <text x="102" y="32" class="rx-chip-text rx-out" text-anchor="middle" style="--d:1s">Week 1</text>
    <text x="102" y="32" class="rx-chip-text rx-fade" text-anchor="middle" style="--d:1s">Week 2</text>
    ${T(40,70,'Weekly allowance','rx-label')}
    <text x="520" y="70" class="rx-label rx-out" text-anchor="end" style="--d:1.4s">5 left</text>
    ${fade(1.4,T(520,70,'20 left · renewed','rx-label rx-green-text','end'))}
    <rect x="40" y="80" width="480" height="28" rx="4" class="rx-track"/>
    <rect x="42" y="82" width="119" height="24" rx="3" class="rx-fill"/>
    <rect x="161" y="82" width="357" height="24" rx="3" class="rx-refill rx-grow" style="--d:1.4s"/>
    ${T(40,140,'Balance','rx-label')}${T(520,140,'25 · unchanged','rx-label rx-muted','end')}
    <rect x="40" y="150" width="480" height="28" rx="4" class="rx-track"/>
    <rect x="42" y="152" width="297" height="24" rx="3" class="rx-fill"/>
    ${T(40,210,'Kept untouched','rx-label')}${T(520,210,'20 · unchanged','rx-label rx-muted','end')}
    <rect x="40" y="220" width="480" height="28" rx="4" class="rx-track"/>
    <rect x="42" y="222" width="238" height="24" rx="3" class="rx-keep"/>${lock(161,233)}`}
 ]},
 // Denis: the floor inside cash, priorities funded in full, two keys for savings, the rehearsal that stops.
 2:{name:'Denis',tool:'Web3 Budget Studio',portrait:'denis.jpg',cards:[
  {title:'The floor sits inside your cash',
   caption:'Your protected cash floor is part of your cash, not extra money on top. With 300 from cash and income and a floor of 200, 100 can go to expenses.',
   svg:`${T(40,36,'Operating cash + income · 300','rx-label')}
    <rect x="40" y="52" width="480" height="60" rx="4" class="rx-track"/>
    <rect x="42" y="54" width="476" height="56" rx="3" class="rx-fill rx-grow" style="--d:.3s"/>
    ${fade(1.4,`<rect x="42" y="54" width="317" height="56" rx="3" class="rx-keep"/>${lock(200,84)}`)}
    ${fade(1.8,`<path d="M42 124 V132 H357 V124" class="rx-bracket"/>${T(200,156,'Protected floor · 200','rx-label','middle')}`)}
    ${fade(2.2,`<path d="M363 124 V132 H518 V124" class="rx-bracket"/>${T(440,156,'For expenses · 100','rx-label rx-accent','middle')}`)}
    ${pop(2.8,T(280,222,'300 − 200 = 100','rx-num','middle'))}`},
  {title:'Priority 1 first, in full',
   caption:'Priority 1 gets its 600 in full first. The 100 left cannot cover priority 2, so it stays unfunded instead of being part-paid, and new goal money pauses.',
   note:'Funded means earmarked in the proposal. Nothing is paid until you act.',
   svg:`${T(40,32,'Available','rx-label rx-muted')}
    <text x="150" y="33" class="rx-num rx-out" style="--d:1.6s">700</text>
    ${fade(1.6,T(150,33,'100 left','rx-num'))}
    ${T(40,64,'Priority 1 · 600','rx-label')}
    <rect x="40" y="74" width="340" height="34" rx="4" class="rx-track"/>
    <rect x="42" y="76" width="336" height="30" rx="3" class="rx-fill rx-grow" style="--d:.5s"/>
    ${badge(394,75,160,'FUNDED','rx-true',1.7)}
    ${T(40,144,'Priority 2 · 300','rx-label')}
    <rect x="40" y="154" width="170" height="34" rx="4" class="rx-track"/>
    ${badge(224,155,160,'UNFUNDED','rx-wait',2.6)}${fade(3,T(398,176,'not part-paid','rx-label rx-muted'))}
    ${fade(3.4,`<rect x="40" y="214" width="170" height="34" rx="17" class="rx-cancel"/>${T(125,236,'Goals paused','rx-label','middle')}`)}
    ${fade(3.6,T(224,236,'until priority 2 is funded','rx-label rx-muted'))}`},
  {title:'Savings need two keys',
   caption:'Flexible savings open only when both are true: you allowed this expense, and there is room under the shared savings limit. Your NFT opens the studio; it does not grant spending.',
   svg:`${T(120,34,'Flexible savings','rx-label','middle')}
    <rect x="40" y="46" width="160" height="150" rx="6" class="rx-box"/>${coin(120,121,'RLO')}
    <g class="rx-swing" style="--d:2.4s"><rect x="48" y="54" width="144" height="134" rx="4" class="rx-door"/><circle cx="176" cy="121" r="5" class="rx-door-knob"/></g>
    ${lamp(236,78)}${pop(.8,tick(236,78))}${T(256,83,'You allowed this expense','rx-label')}
    ${lamp(236,124)}${pop(1.6,tick(236,124))}${T(256,129,'Room under the shared limit','rx-label')}
    ${fade(2.1,T(220,170,'Both green: the vault opens','rx-label rx-accent'))}
    <rect x="330" y="200" width="200" height="44" rx="6" class="rx-chip"/>${T(378,227,'Allowed expense','rx-chip-text')}
    <g class="rx-fly" style="--d:3s;--fx:-234px;--fy:-101px">${coin(354,222,'RLO')}</g>`},
  {title:'The rehearsal stops at the first gap',
   caption:'The rehearsal runs month by month. When a required expense cannot be funded in month 4, goal contributions pause and the run stops there, with the shortfall shown. Nothing is borrowed or erased.',
   svg:`${T(40,34,'6-month rehearsal','rx-label rx-muted')}
    <path d="M60 96 H510" class="rx-track-line"/><path d="M60 96 H330" class="rx-draw rx-progress" pathLength="1" style="--dur:2.2s;--d:.2s"/>
    ${[60,150,240].map((x,k)=>pop((.4+k*.6).toFixed(1),`<circle cx="${x}" cy="96" r="14" class="rx-step rx-step-ok"/>${T(x,101,String(k+1),'rx-step-text','middle')}`)).join('')}
    ${pop(2.2,`<circle cx="330" cy="96" r="14" class="rx-step rx-step-bad"/>${T(330,101,'4','rx-step-text','middle')}`)}
    ${[420,510].map((x,k)=>`<circle cx="${x}" cy="96" r="14" class="rx-step rx-step-dim"/>${T(x,101,String(k+5),'rx-step-text rx-dim-text','middle')}`).join('')}
    ${fade(2.6,T(330,62,'Stops here','rx-label rx-red-text','middle'))}
    ${badge(250,124,160,'Shortfall · 40','rx-stop',2.6).replace('rx-badge','rx-label')}
    ${fade(3,T(465,140,'Not run','rx-label rx-muted','middle'))}
    ${fade(3.4,`<rect x="40" y="200" width="170" height="34" rx="17" class="rx-cancel"/>${T(125,222,'Goals paused','rx-label','middle')}`)}
    ${fade(3.7,T(224,222,'Nothing borrowed or erased','rx-label rx-muted'))}`}
 ]},
 // Ade: every check joined by AND, cash floor vs asset value, contributions vs gain, scenarios vs forecasts.
 3:{name:'Ade',tool:'Plan Lab',portrait:'ade.jpg',cards:[
  {title:'Every check must pass',
   caption:'Price, weekly cap and quote freshness are joined by AND. Two passes are not enough: with an old quote the order waits. A later event with a fresh quote can qualify.',
   svg:`${[42,98,154].map(y=>`<rect x="24" y="${y}" width="288" height="40" rx="5" class="rx-box"/>${lamp(46,y+20)}`).join('')}
    ${pop(.5,tick(46,62))}${T(66,67,'Price ≤ limit','rx-label')}
    ${pop(.9,tick(46,118))}${T(66,123,'Room under weekly cap','rx-label')}
    ${pop(1.3,cross(46,174))}${T(66,179,'Fresh quote','rx-label')}${fade(1.5,T(302,179,'too old','rx-label rx-red-text','end'))}
    <path d="M312 62 C344 62 344 112 372 112" class="rx-wire rx-draw" pathLength="1" style="--dur:.6s;--d:.6s"/>
    <path d="M312 118 C344 118 344 136 372 136" class="rx-wire rx-draw" pathLength="1" style="--dur:.6s;--d:1s"/>
    <path d="M312 174 C344 174 344 160 372 160" class="rx-wire rx-wire-bad rx-draw" pathLength="1" style="--dur:.6s;--d:1.4s"/>
    <path d="M372 90 H400 A46 46 0 0 1 400 182 H372 Z" class="rx-gate"/>${T(404,141,'AND','rx-label','middle')}
    ${fade(2,'<path d="M446 136 H468 M461 129 L469 136 L461 143" class="rx-arrow"/>')}
    ${badge(474,120,82,'WAITS','rx-wait',2.3)}`},
  {title:'A cash floor is not insurance',
   caption:'Keeping 40 RLO in cash limits how much can be spent. It does not stop assets you already bought from losing value.',
   svg:`<g class="rx-grid"><line x1="40" y1="60" x2="520" y2="60"/><line x1="40" y1="110" x2="520" y2="110"/><line x1="40" y1="160" x2="520" y2="160"/></g>
    ${T(40,40,'Purchased assets','rx-label')}
    <path d="M40 72 C110 58 150 98 210 92 S300 132 360 126 S460 158 520 150" class="rx-price rx-draw" pathLength="1" style="--dur:2.4s;--d:.3s"/>
    ${pop(2.7,'<circle cx="520" cy="150" r="7" class="rx-dot-red"/>')}${fade(2.9,T(508,132,'can still fall','rx-label rx-red-text','end'))}
    <rect x="40" y="186" width="480" height="48" rx="4" class="rx-cashband"/>${lock(62,208)}${T(82,215,'Cash floor · 40','rx-label')}
    ${fade(1.4,T(504,215,'limits spending','rx-label rx-muted','end'))}`},
  {title:'Your own money is not a gain',
   caption:'60 + 12 × 10 = 180, and all of it is your own money. With 0% return and no fees, the ending balance is 180 and the gain is 0. Adding money is not earning.',
   svg:`${pop(.2,'<rect x="70" y="180" width="100" height="60" rx="3" class="rx-base"/>')}
    ${Array.from({length:12},(_,k)=>`<rect x="70" y="${170-k*10}" width="100" height="9" rx="2" class="rx-fill rx-pop" style="--d:${(.6+k*.12).toFixed(2)}s"/>`).join('')}
    ${T(184,215,'Start · 60','rx-label')}${fade(1,T(184,125,'+ 12 × 10','rx-label'))}${fade(2,T(120,48,'180','rx-num','middle'))}
    ${fade(2.2,T(300,84,'You put in','rx-label rx-muted')+T(520,84,'180','rx-num','end'))}
    ${fade(2.5,T(300,124,'Ending balance','rx-label rx-muted')+T(520,124,'180','rx-num','end'))}
    <line x1="300" y1="142" x2="520" y2="142" class="rx-rule"/>
    ${T(300,184,'Gain','rx-label')}<g class="rx-stamp" style="--d:3s">${T(520,190,'0','rx-big','end')}</g>
    ${T(300,236,'0% return · 0 fees','rx-label rx-muted')}`},
  {title:'A scenario, not a forecast',
   caption:'Each path follows an assumption you chose. A good recovery result shows what your rules did under that assumption. It does not predict the market, so compare it with the loss path.',
   note:'The NFT gives access to Plan Lab. It never authorizes spending or promises a return.',
   svg:`<circle cx="60" cy="150" r="6" class="rx-start"/>
    <path d="M60 150 C130 170 210 172 290 140 S400 76 440 70" class="rx-path rx-path-up rx-draw" pathLength="1" style="--dur:1.8s;--d:.2s"/>
    <path d="M60 150 C150 176 250 160 330 160 S410 150 440 152" class="rx-path rx-path-mid rx-draw" pathLength="1" style="--dur:1.8s;--d:.6s"/>
    <path d="M60 150 C120 182 220 200 330 210 S410 222 440 226" class="rx-path rx-path-down rx-draw" pathLength="1" style="--dur:1.8s;--d:1s"/>
    ${fade(1.9,T(448,75,'Recovery','rx-label rx-green-text'))}${fade(2.3,T(448,157,'Stress','rx-label'))}${fade(2.7,T(448,231,'Loss','rx-label rx-red-text'))}
    ${fade(3.1,`<rect x="160" y="22" width="240" height="30" rx="15" class="rx-tag"/>${T(280,42,'under this assumption','rx-label','middle')}<path d="M400 37 C420 37 432 50 438 62" class="rx-pointer"/>`)}
    ${T(60,254,'Assumptions, not predictions','rx-label rx-muted')}`}
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
.rx-ok{fill:rgba(108,245,203,.2);stroke:#6cf5cb;stroke-width:1.5}.rx-bad{fill:rgba(255,90,108,.22);stroke:#ff5a6c;stroke-width:1.5}
.rx-mark{fill:none;stroke:#f4fffb;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.rx-lamp{fill:#0b1530;stroke:#56658a;stroke-width:1.5}
.rx-lock rect{fill:#0b1530;stroke:#cfd9f2;stroke-width:1.5}.rx-lock path{fill:none;stroke:#cfd9f2;stroke-width:1.8}
.rx-keep{fill:#0f3533;stroke:#6cf5cb;stroke-width:1.5}
.rx-ghost{fill:none;stroke:rgba(159,176,216,.5);stroke-dasharray:5 4}
.rx-over{fill:rgba(255,90,108,.14);stroke:#ff5a6c;stroke-dasharray:5 4}
.rx-red-line{fill:none;stroke:#ff5a6c;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.rx-refill{fill:#6cf5cb;opacity:.85}.rx-green-text{fill:#6cf5cb}
.rx-wait{fill:rgba(255,207,107,.16);stroke:#ffcf6b}
.rx-door{fill:#1a2440;stroke:var(--rx-c);stroke-width:1.5}.rx-door-knob{fill:var(--rx-c)}
.rx-step-ok{stroke:#6cf5cb;fill:#123b39}.rx-step-bad{stroke:#ff5a6c;fill:#4a1a28}.rx-step-dim{stroke:#34405e;fill:#0b1530}.rx-dim-text{fill:#56658a}
.rx-wire{fill:none;stroke:#9fb0d8;stroke-width:2}.rx-wire-bad{stroke:#ff5a6c}
.rx-gate{fill:rgba(12,22,44,.9);stroke:var(--rx-c);stroke-width:2}
.rx-dot-red{fill:#ff5a6c;filter:drop-shadow(0 0 6px #ff5a6c)}
.rx-cashband{fill:rgba(108,245,203,.12);stroke:#6cf5cb}
.rx-base{fill:rgba(230,238,255,.16);stroke:rgba(230,238,255,.5)}
.rx-rule{stroke:rgba(159,176,216,.4);stroke-width:1}
.rx-start{fill:#e6eeff}
.rx-path{fill:none;stroke-width:3;stroke-linecap:round}.rx-path-up{stroke:#6cf5cb}.rx-path-mid{stroke:#9fb0d8}.rx-path-down{stroke:#ff5a6c}
.rx-tag{fill:rgba(255,138,76,.12);stroke:var(--rx-c)}
.rx-draw{stroke-dasharray:1;stroke-dashoffset:0}
.rx-out{opacity:0}
.rx-pop,.rx-stamp{transform-box:fill-box;transform-origin:center}
.rx-shrink{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(0)}
.rx-swing{transform-box:fill-box;transform-origin:0 50%;transform:scaleX(.1)}
.rx-card.play .rx-draw{animation:rx-draw var(--dur,2s) cubic-bezier(.45,.1,.2,1) var(--d,.2s) backwards}
.rx-card.play .rx-pop{animation:rx-pop .45s cubic-bezier(.2,.9,.3,1.35) var(--d) backwards}
.rx-card.play .rx-fade{animation:rx-fade .5s ease var(--d) backwards}
.rx-card.play .rx-out{animation:rx-out .4s ease var(--d) backwards}
.rx-card.play .rx-slide{animation:rx-slide .7s cubic-bezier(.2,.8,.2,1) var(--d) backwards}
.rx-card.play .rx-stamp{animation:rx-stamp .5s cubic-bezier(.2,.9,.3,1.3) var(--d) backwards}
.rx-card.play .rx-fly{animation:rx-fly 1s cubic-bezier(.5,0,.2,1) var(--d) backwards}
.rx-card.play .rx-shrink{animation:rx-shrink .9s cubic-bezier(.5,0,.3,1) var(--d) backwards}
.rx-card.play .rx-swing{animation:rx-swing .8s cubic-bezier(.5,0,.3,1) var(--d) backwards}
.rx-card.play .rx-grow{animation:rx-grow 1.1s cubic-bezier(.3,.7,.2,1) var(--d) backwards;transform-box:fill-box;transform-origin:left center}
@keyframes rx-draw{from{stroke-dashoffset:1}}
@keyframes rx-pop{from{opacity:0;transform:scale(.4)}}
@keyframes rx-fade{from{opacity:0}}
@keyframes rx-out{from{opacity:1}}
@keyframes rx-slide{from{opacity:0;transform:translateX(-90px)}}
@keyframes rx-stamp{from{opacity:0;transform:scale(1.8) rotate(-8deg)}}
@keyframes rx-fly{from{opacity:0;transform:translate(var(--fx),var(--fy))}15%{opacity:1}}
@keyframes rx-grow{from{transform:scaleX(0)}}
@keyframes rx-shrink{from{transform:scaleY(1)}}
@keyframes rx-swing{from{transform:scaleX(1)}}
@media(max-width:560px){.rx{padding:8px}.rx-panel{padding:14px 12px}.rx-back,.rx-next{padding:10px 12px}.rx-dots i{width:14px}.rx-label{font-size:16px}.rx-num{font-size:20px}.rx-chip-text{font-size:15px}.rx-badge{font-size:15px;letter-spacing:.08em}.rx-step-text{font-size:14px}.rx-replay{top:6px;right:6px}}
@media(prefers-reduced-motion:reduce){.rx-card *{animation:none!important}}
`;
let root=null,deck=null,index=0,onDone=null,opener=null,lastLabel='';
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
 const next=root.querySelector('.rx-next');next.textContent=index===deck.cards.length-1?lastLabel:'Next';
}
function open(i,done,last){
 build();deck=DECKS[i];onDone=done;lastLabel=last||(done?'Continue to the check →':'Done');opener=document.activeElement;
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
function close(){if(!root||root.hidden)return;root.hidden=true;document.documentElement.classList.remove('rx-open');
 // The button that opened the cards may have been replaced (the lesson page renders under them); fall back to the check button.
 const back=opener&&opener!==document.body&&opener.isConnected&&opener.getClientRects().length?opener:document.getElementById('lesson-quiz');back?.focus();}
function finish(){const done=onDone;close();done&&done();}
// First real press of the check button for a character with a deck: show the cards, then open the check.
// The capture listener on window runs before the journey recorder (document), so the press is recorded once, when the check opens.
addEventListener('click',e=>{if(!e.isTrusted)return;const button=e.target.closest&&e.target.closest('#lesson-quiz');if(!button||button.disabled)return;const i=who();if(!DECKS[i]||seen()[i])return;
 e.preventDefault();e.stopImmediatePropagation();open(i,()=>{mark(i);if(button.isConnected)button.click();});},true);
// After the first viewing, the check button gets a quiet way back to the cards.
const chapter=document.getElementById('chapter');
if(chapter)new MutationObserver(()=>{const b=document.getElementById('lesson-quiz'),i=who();if(!b||!DECKS[i]||!seen()[i]||b.parentNode.querySelector('.rx-again'))return;
 const again=document.createElement('button');again.type='button';again.className='secondary rx-again';again.textContent='Watch the cards again';again.onclick=()=>open(i,()=>{if(b.isConnected)b.click();});b.after(again);}).observe(chapter,{childList:true,subtree:true});
// begin: the cards that lead into the check (marks them seen, then presses the check button so the journey records it).
// open: a review from anywhere; without done, the last button just closes.
const startCheck=()=>{const b=document.getElementById('lesson-quiz');if(b)b.click();};
window.ResonanceExplainer={has:i=>!!DECKS[i],seen:i=>!!seen()[i],titles:i=>DECKS[i]?DECKS[i].cards.map(c=>c.title):[],
 begin:i=>{if(DECKS[i]&&(!root||root.hidden))open(i,()=>{mark(i);startCheck();});},
 open:(i,done,last)=>{if(DECKS[i])open(i,done||null,last);},decks:Object.keys(DECKS).map(Number)};
})();
