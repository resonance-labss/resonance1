/* Vault effects: budget tokens, purchase bursts, chart draw-in and state glows. Listens to the tools' own events; never changes values, text, focus or controls. */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),$=id=>document.getElementById(id);
const source=el=>el?(window.ResonanceI18n?window.ResonanceI18n.source(el):el.textContent).trim():'';
const money=n=>(n/100).toFixed(2);
const off=()=>reduce.matches||$('workspace')?.hidden;
let layer=null;function fxLayer(){if(!layer||!layer.isConnected){layer=document.createElement('div');layer.className='vfx-layer';layer.setAttribute('aria-hidden','true');layer.dataset.i18nIgnore='';layer.dataset.unitFixed='';document.body.append(layer);}return layer;}
const visible=r=>r&&r.width>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
// A labelled token travels between two stat boxes, e.g. the budget moving into the reserve.
function flight(fromId,toId,label,tone){if(off())return;const a=$(fromId)?.getBoundingClientRect(),b=$(toId)?.getBoundingClientRect();if(!visible(a)||!visible(b))return;
 const t=document.createElement('div');t.className='vfx-token '+tone;t.textContent=label;fxLayer().append(t);const x0=a.left+a.width/2,y0=a.top+a.height/2,x1=b.left+b.width/2,y1=b.top+b.height/2;
 t.style.left=x0+'px';t.style.top=y0+'px';const anim=t.animate([{transform:'translate(-50%,-50%) scale(.7)',opacity:0},{transform:'translate(-50%,-90%) scale(1.05)',opacity:1,offset:.25},{transform:`translate(calc(-50% + ${x1-x0}px),calc(-50% + ${y1-y0}px)) scale(.85)`,opacity:.9}],{duration:850,easing:'cubic-bezier(.4,.1,.3,1)'});
 anim.onfinish=()=>{t.remove();flash(toId,tone==='gold'?'vfx-up':'vfx-back');};setTimeout(()=>t.remove(),1400);}
function flash(id,cls){const el=$(id);if(!el||off())return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),900);}
function chip(id,label,tone){if(off())return;const r=$(id)?.getBoundingClientRect();if(!visible(r))return;const t=document.createElement('div');t.className='vfx-chip '+tone;t.textContent=label;t.style.left=r.left+r.width/2+'px';t.style.top=r.top+'px';fxLayer().append(t);setTimeout(()=>t.remove(),1600);}
function burst(id,colors){if(off())return;const r=$(id)?.getBoundingClientRect();if(!visible(r))return;const c=document.createElement('canvas'),w=innerWidth,h=innerHeight;c.width=w;c.height=h;fxLayer().append(c);const g=c.getContext('2d');
 const parts=Array.from({length:36},(_,i)=>{const a=Math.random()*Math.PI*2,s=1.5+Math.random()*4;return {x:r.left+r.width/2,y:r.top+r.height/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.5,s:1.5+Math.random()*3,c:colors[i%colors.length]};});
 const start=performance.now();(function frame(now){if(!c.isConnected)return;const k=(now-start)/1100;if(k>=1){c.remove();return;}g.clearRect(0,0,w,h);for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.05;p.vx*=.98;g.globalAlpha=1-k;g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.s*(1-k*.4),0,7);g.fill();}requestAnimationFrame(frame);})(start);setTimeout(()=>c.remove(),1600);}
function clear(){if(layer)layer.replaceChildren();$('state')?.classList.remove('vfx-armed','vfx-shake');}
// Diren: follow the rule's own state broadcasts.
let prev={state:'idle',reserved:0,reviewing:false};
addEventListener('resonance:vault-state',e=>{const d=e.detail||{};const was=prev;prev={state:d.state,reserved:d.reserved||0,reviewing:!!d.reviewing};const s=$('state');
 if(s)s.classList.toggle('vfx-armed',d.state==='queued'&&!reduce.matches);
 if(d.state==='waiting'&&was.state==='idle'&&d.reserved>0)flight('available','reserved',money(d.reserved),'gold');});
addEventListener('resonance:vault-outcome',e=>{const d=e.detail||{};
 if(d.state==='completed'){burst('owned',['#ffd99a','#b6dfcc','#fff2c8']);chip('owned','+'+Number(d.units).toFixed(4),'gold');flash('owned','vfx-up');}
 else{if(d.returned>0)flight('reserved','available',money(d.returned),'mint');if(d.state==='failed'){const s=$('state');if(s&&!off()){s.classList.remove('vfx-shake');void s.offsetWidth;s.classList.add('vfx-shake');setTimeout(()=>s.classList.remove('vfx-shake'),500);}}}});
addEventListener('resonance:vault-reset',clear);
new MutationObserver(()=>{if($('workspace')?.hidden)clear();}).observe(document.body,{attributes:true,subtree:true,attributeFilter:['hidden']});
// Ade: draw the comparison and growth lines in once per rebuild, keeping polyline B's dash pattern.
function drawIn(svg){if(!svg)return;let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;if(off())return;svg.querySelectorAll('polyline').forEach((line,i)=>line.animate?.([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:900,delay:i*140,easing:'cubic-bezier(.3,.1,.2,1)',fill:'backwards'}));});}).observe(svg,{childList:true});}
drawIn($('ade-chart'));drawIn($('growth-chart'));
// Denis: tone the proposal overview once per review so a reserve problem stands out.
const summary=$('proposal-summary');if(summary)new MutationObserver(()=>{const title=source(summary.querySelector('h3'));const tone=/needs attention|remain unfunded/.test(title)?'warn':title?'ok':'';if(summary.dataset.fxTone!==tone){if(tone)summary.dataset.fxTone=tone;else delete summary.dataset.fxTone;}}).observe(summary,{childList:true});
})();
