/* Lesson effects: the check button's pulse, answers fading in, a glow for the right answer, a shake for a wrong one and a
   sparkle when a learning pass is earned. Presentation only; reduced motion turns it all off. */
(()=>{'use strict';
const root=document.querySelector('#chapter');if(!root)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const css=document.createElement('style');css.textContent=`
#chapter #lesson-quiz{animation:fx-next 2s ease-in-out 4}
#chapter .mastery-option{animation:fx-in .28s ease-out both}#chapter .mastery-option:nth-child(2){animation-delay:.05s}#chapter .mastery-option:nth-child(3){animation-delay:.1s}#chapter .mastery-option:nth-child(4){animation-delay:.15s}
#chapter .mastery-option.correct{position:relative;animation:fx-correct .7s ease-out both;box-shadow:0 0 0 2px #8fe0c3,0 0 18px rgba(154,255,223,.35)}
#chapter .mastery-option.correct::after{content:'';position:absolute;right:16px;top:50%;width:8px;height:15px;margin-top:-10px;border:solid #8fe0c3;border-width:0 3px 3px 0;transform:rotate(45deg);animation:fx-in .35s ease-out both}
#chapter .mastery-option.wrong{animation:fx-shake .4s ease-out;box-shadow:0 0 0 2px #d98a7a,0 0 16px rgba(255,143,122,.3)}
#chapter #lesson-options:has(.wrong) .mastery-option.correct{animation:none;box-shadow:0 0 0 1px #8fe0c3}
#chapter #lesson-award{animation:fx-award 1.6s ease-out}
.fx-layer{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:30}.fx-layer canvas{position:absolute;inset:0;width:100%;height:100%}
@keyframes fx-next{0%,100%{box-shadow:0 0 0 0 rgba(243,213,159,0)}50%{box-shadow:0 0 0 1px rgba(243,213,159,.45),0 0 20px 2px rgba(243,213,159,.35)}}
@keyframes fx-in{from{opacity:.15}to{opacity:1}}
@keyframes fx-correct{0%{box-shadow:0 0 24px 5px rgba(154,255,223,.65)}100%{box-shadow:0 0 0 2px #8fe0c3,0 0 18px rgba(154,255,223,.35)}}
@keyframes fx-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
@keyframes fx-award{0%{box-shadow:0 0 10px 2px rgba(255,217,154,.3)}25%{box-shadow:0 0 34px 6px rgba(255,217,154,.55)}100%{box-shadow:0 0 40px 10px rgba(255,217,154,0)}}
@media(prefers-reduced-motion:reduce){#chapter :is(#lesson-quiz,.mastery-option,.mastery-option::after,#lesson-award){animation:none!important}.fx-layer{display:none}}`;
document.head.append(css);
// A short sparkle over the pass, only after a real click on the last answer (a restored journey stays quiet).
function sparkle(rect){
 const layer=document.createElement('div');layer.className='fx-layer';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 const c=document.createElement('canvas'),w=innerWidth,h=innerHeight;c.width=w;c.height=h;layer.append(c);const g=c.getContext('2d');
 const colors=['#9affdf','#ffd99a','#e9fff8'];
 const parts=Array.from({length:40},(_,i)=>{const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*3.5;return {x:rect.left+rect.width*(.25+Math.random()*.5),y:rect.top+rect.height*.5,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1,s:2+Math.random()*3,c:colors[i%3]};});
 const start=performance.now(),life=1300;
 (function frame(now){const k=(now-start)/life;if(k>=1||!c.isConnected){layer.remove();return;}g.clearRect(0,0,w,h);for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.03;p.vx*=.985;g.globalAlpha=1-k*k;g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.s*(1-k*.5),0,7);g.fill();}requestAnimationFrame(frame);})(start);
 setTimeout(()=>layer.remove(),life+500);
}
document.addEventListener('click',e=>{if(!e.isTrusted||reduce.matches||document.body.dataset.restoringJourney==='true')return;const b=e.target.closest?.('#lesson-answer-next');if(!b)return;
 requestAnimationFrame(()=>{const award=document.getElementById('lesson-award');const r=award?.getBoundingClientRect();if(r&&r.width>0)sparkle(r);});});
})();
