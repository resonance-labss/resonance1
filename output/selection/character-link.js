/* Opening the academy with ?character=0..3 (Diren, Ece, Denis, Ade), as the home cover does for a lesson not yet
   finished, preselects that character on the selection screen. It only selects the card; the visitor still names
   themselves and presses Continue. Nothing happens if the selection screen is not showing. */
(()=>{'use strict';
const raw=new URLSearchParams(location.search).get('character');if(raw===null)return;
const i=Number(raw),select=document.getElementById('resonance-select');
if(!Number.isInteger(i)||i<0||i>3||!select||select.hidden)return;
const card=select.querySelectorAll('.rs-person')[i];if(!card)return;
card.click();
requestAnimationFrame(()=>{card.scrollIntoView({block:'nearest'});document.getElementById('rs-start')?.focus({preventScroll:true});});
})();
