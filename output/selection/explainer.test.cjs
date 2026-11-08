// Diren's animated explainer before the four-question check: opens on the first real press, steps through four cards,
// Esc leaves without starting the check, the last button starts it (recorded once for the saved journey), later
// visits go straight to the check with a way back to the cards, Turkish, reduced motion, phone width, and the storm
// adventure hidden unless ?storm=1. Characters without a deck go straight to the check.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
const URL='file://'+path.join(__dirname,'resonance-playable-v1.html');
async function toCheck(p,i=0,name='Diren'){await p.locator('.rs-person').nth(i).click();await p.fill('#rs-input',name);await p.click('#rs-start');await p.click('#character-enter');
 if(await p.locator('#lesson-briefing').count()){await p.check('#briefing-read');await p.click('#briefing-continue');}
 await p.click('#lesson-register');for(let n=0;n<[2,3,3,3][i];n++)await p.click('#lesson-step');}
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
 const fresh=async(opts={})=>{const ctx=await b.newContext({viewport:{width:1280,height:900},...opts});const p=await ctx.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.goto(URL);return p;};
 try{
  {const p=await fresh();
   assert.equal(await p.locator('#enter').isVisible(),false,'storm adventure hidden');
   await toCheck(p);await p.click('#lesson-quiz');
   assert(await p.locator('#rx[role=dialog][aria-modal=true]').isVisible(),'cards open on the first press');assert.equal(await p.locator('.mastery-option').count(),0,'check not started yet');
   assert.equal(await p.locator('.rx-card').count(),4);assert.equal(await p.locator('.rx-count').textContent(),'1 / 4');assert(await p.locator('.rx-back').isDisabled());
   assert.equal(await p.evaluate(()=>document.activeElement.className),'rx-next','focus on Next');
   assert.match(await p.locator('.rx-card:not([hidden]) .rx-cap').textContent(),/7\.5 is at or below 8/);
   await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.rx-count').textContent(),'2 / 4','arrow keys move');
   await p.click('.rx-back');assert.equal(await p.locator('.rx-count').textContent(),'1 / 4');
   await p.click('.rx-replay >> nth=0');assert(await p.locator('.rx-card:not([hidden])').evaluate(c=>c.classList.contains('play')));
   const caps=[];for(let k=0;k<4;k++){caps.push(await p.locator('.rx-card:not([hidden]) .rx-cap').textContent());if(k<3)await p.click('.rx-next');}
   assert.match(caps[1],/stops, and your Demo RLO comes back/);assert.match(caps[2],/19\.90 for the asset and 0\.10 for the fee/);assert.match(caps[3],/reserved Demo RLO returns/);
   assert.equal(await p.locator('.rx-next').textContent(),'Continue to the check →');
   // Esc leaves without starting the check and without marking the cards as seen.
   await p.keyboard.press('Escape');assert(await p.locator('#rx').isHidden());assert.equal(await p.locator('.mastery-option').count(),0);
   assert.equal(await p.evaluate(()=>localStorage.getItem('resonance.explainers.v1')),null);
   // Second press: cards again; the last button starts the check, once.
   await p.click('#lesson-quiz');assert(await p.locator('#rx').isVisible());for(let k=0;k<4;k++)await p.click('.rx-next');
   assert(await p.locator('#rx').isHidden());assert.equal(await p.locator('.mastery-option').count(),4,'check started');
   assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('resonance.explainers.v1'))[0]),1);
   assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('resonance.progress.v1')).actions.filter(a=>a.id==='lesson-quiz').length),1,'recorded once');
   // The saved journey restores into the check without showing the cards.
   await p.reload();await p.click('#save-continue');await p.waitForSelector('.mastery-option');assert(await p.locator('#rx').count()===0||await p.locator('#rx').isHidden());
   // Another run of the lesson: the check opens directly, with "Watch the explainer again".
   await p.evaluate(()=>localStorage.removeItem('resonance.progress.v1'));await p.reload();await toCheck(p);
   assert(await p.locator('.rx-again').isVisible(),'way back to the cards');await p.click('#lesson-quiz');assert.equal(await p.locator('.mastery-option').count(),4,'straight to the check');
   assert.deepEqual(p.errors,[]);await p.context().close();}
  // Turkish, phone width and reduced motion: translated text, no horizontal overflow, final frames shown.
  {const p=await fresh({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.evaluate(()=>localStorage.setItem('resonance.language.v1','tr'));await p.reload();
   await toCheck(p,0,'Diren');await p.click('#lesson-quiz');
   await p.waitForFunction(()=>document.querySelector('.rx-eyebrow').textContent==='Kontrolden önce');
   const text=await p.locator('#rx').textContent();for(const english of ['Before the check','Checked at the end','End of step','Queue','Next'])assert(!text.includes(english),'English left: '+english);
   assert(await p.evaluate(()=>document.querySelector('.rx-panel').scrollWidth<=document.querySelector('.rx-panel').clientWidth+1),'fits a phone');
   assert.equal(await p.locator('.rx-card:not([hidden]) .rx-pop >> nth=0').evaluate(e=>getComputedStyle(e).animationName),'none','no motion');
   assert.equal(await p.locator('.rx-card:not([hidden]) .rx-pop >> nth=0').evaluate(e=>getComputedStyle(e).opacity),'1','final frame visible');
   assert.deepEqual(p.errors,[]);await p.context().close();}
  // Ece has no deck yet: her check opens directly. ?storm=1 still shows the storm adventure for development.
  {const p=await fresh();await toCheck(p,1,'Ece');await p.click('#lesson-quiz');assert.equal(await p.locator('.mastery-option').count(),4);assert.equal(await p.locator('#rx').count(),0);await p.context().close();}
  {const p=await fresh();await p.goto(URL+'?storm=1');await p.locator('.rs-person').nth(0).click();await p.fill('#rs-input','Diren');await p.click('#rs-start');assert(await p.locator('#enter').isVisible());await p.context().close();}
  console.log('PASS explainer: storm hidden, four Diren cards on the first press, keys/Back/Replay, Esc leaves, last button starts the check once, restore skips the cards, watch-again link, Turkish, phone, reduced motion, Ece direct.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
