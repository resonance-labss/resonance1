/* Depth effects for the home, mint and My Resonance pages. Presentation only: it wraps or adds aria-hidden
   decoration and never edits text, values or wallet logic.
   - Holographic pass (mint): the preview becomes a card with thickness that floats, leans toward the pointer
     (anime-theme.js sets the tilt) and turns over when another character is chosen.
   - Pass rack (My Resonance): the four passes on a slowly turning 3D ring; held passes glow, finished lessons
     are lit, the rest stay dim. It reads data-held / data-done from the dashboard's own cards.
   - Reveal: cards below the first screen rise into place in 3D the first time they scroll into view.
   Reduced motion: everything stays still and visible. */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,$=s=>document.querySelector(s);
const base=new URL(/\/(mint|my|vault)\//.test(location.pathname)?'../':'./',location.href);

// Holographic pass on the mint page.
const preview=document.querySelector('.pass-card #preview');
if(preview){const stage=document.createElement('span'),card=document.createElement('span');stage.className='holo-stage';card.className='holo';
 preview.before(stage);stage.append(card);
 for(let i=0;i<4;i++){const edge=document.createElement('span');edge.className='holo-edge';edge.setAttribute('aria-hidden','true');card.append(edge);}
 card.append(preview);const glare=document.createElement('span');glare.className='holo-glare';glare.setAttribute('aria-hidden','true');card.append(glare);
 const tone=()=>{const i=Number(document.getElementById('character')?.value||0);card.dataset.tone=['diren','ece','denis','ade'][i]||'diren';};tone();
 // Skip the first src only if the page has not set one yet (that is the initial pass, not a change).
 let first=!preview.getAttribute('src');new MutationObserver(()=>{tone();if(first){first=false;return;}if(reduce)return;card.classList.remove('holo-turn');void card.offsetWidth;card.classList.add('holo-turn');}).observe(preview,{attributes:true,attributeFilter:['src']});
 card.addEventListener('animationend',e=>{if(e.animationName==='holo-turn')card.classList.remove('holo-turn');});}

// Pass rack on My Resonance.
const list=document.getElementById('characters'),header=document.querySelector('body:has(#lesson-count) main > header, body:has(#lesson-count) header');
if(list&&header&&document.getElementById('lesson-count')){const rack=document.createElement('div');rack.className='pass-rack';rack.setAttribute('aria-hidden','true');
 const ring=document.createElement('div');ring.className='rack-ring';rack.append(ring);
 ['diren','ece','denis','ade'].forEach((name,i)=>{const fig=document.createElement('span');fig.className='rack-card';fig.style.setProperty('--i',i);const img=document.createElement('img');img.src=new URL('nft/'+name+'.webp',base).href;img.alt='';img.loading='lazy';img.decoding='async';fig.append(img);ring.append(fig);});
 const floor=document.createElement('span');floor.className='rack-floor';rack.append(floor);header.classList.add('has-rack');header.append(rack);
 const sync=()=>{for(const card of list.querySelectorAll('.card[data-character]')){const fig=ring.children[Number(card.dataset.character)];if(fig)fig.dataset.state=card.dataset.held==='true'?'held':card.dataset.done==='true'?'done':'locked';}};
 new MutationObserver(sync).observe(list,{childList:true});sync();
 if(!reduce)new IntersectionObserver(([e])=>{rack.classList.toggle('rack-paused',!e.isIntersecting);}).observe(rack);}

// Reveal on first scroll into view (only elements that start below the first screen).
if(!reduce&&'IntersectionObserver' in window){const targets=[...document.querySelectorAll('#journey .card, #characters .character-grid > .card, .hero .stats > *, #updates .release, .section.split > .card, .mint-page .step, body:has(#lesson-count) .summary > *, body:has(#lesson-count) .op')];
 const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const el=e.target;io.unobserve(el);el.classList.remove('reveal-wait');el.classList.add('reveal-in');el.addEventListener('animationend',()=>el.classList.remove('reveal-in'),{once:true});}},{rootMargin:'0px 0px -8% 0px'});
 const fold=innerHeight;let row=-1,order=0;
 // Tall panels rise flat; a 3D tilt would widen their near edge past the page.
 for(const el of targets){const box=el.getBoundingClientRect(),top=box.top;if(top<fold)continue;if(Math.round(top)!==row){row=Math.round(top);order=0;}el.style.setProperty('--reveal-delay',Math.min(order++,4)*90+'ms');if(box.height>360||box.width>innerWidth*.6)el.classList.add('reveal-flat');el.classList.add('reveal-wait');io.observe(el);}}
})();
