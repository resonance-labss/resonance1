// The character lessons are animated cards before the four-question check. Continue opens the lesson page, the cards
// follow once the scene curtain has shown the tool's name, four cards per character, keys/Back/Replay, Esc leaves
// without starting the check, the last button starts it (recorded once for the saved journey), restore and later
// visits skip the cards with a way back to them, Turkish, reduced motion, phone width, each character's own deck, and
// the old storm adventure gone even with ?storm=1.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
const URL='file://'+path.join(__dirname,'resonance-playable-v1.html');
async function begin(p,i=0,name='Diren'){await p.locator('.rs-person').nth(i).click();await p.fill('#rs-input',name);await p.click('#rs-start');}
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
 const fresh=async(opts={})=>{const ctx=await b.newContext({viewport:{width:1280,height:900},...opts});const p=await ctx.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.goto(URL);return p;};
 try{
  {const p=await fresh();
   await begin(p);assert.equal(await p.locator('#enter').count(),0,'no storm prologue');assert.equal(await p.locator('#lesson-cards li').count(),4,'lesson page lists the cards');
   assert.equal(await p.locator('#rx').count(),0,'the curtain plays first');
   await p.locator('#rx[role=dialog][aria-modal=true]').waitFor();assert.equal(await p.locator('.mastery-option').count(),0,'check not started yet');
   assert.equal(await p.locator('.rx-card').count(),4);assert.equal(await p.locator('.rx-count').textContent(),'1 / 4');assert(await p.locator('.rx-back').isDisabled());
   assert.equal(await p.evaluate(()=>document.activeElement.className),'rx-next','focus on Next');
   assert.match(await p.locator('.rx-card:not([hidden]) .rx-cap').textContent(),/7\.5 is at or below 8/);
   await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.rx-count').textContent(),'2 / 4','arrow keys move');
   await p.click('.rx-back');assert.equal(await p.locator('.rx-count').textContent(),'1 / 4');
   await p.click('.rx-replay >> nth=0');assert(await p.locator('.rx-card:not([hidden])').evaluate(c=>c.classList.contains('play')));
   const caps=[];for(let k=0;k<4;k++){caps.push(await p.locator('.rx-card:not([hidden]) .rx-cap').textContent());if(k<3)await p.click('.rx-next');}
   assert.match(caps[1],/stops, and your Demo RLO comes back/);assert.match(caps[2],/19\.90 for the asset and 0\.10 for the fee/);assert.match(caps[3],/reserved Demo RLO returns/);
   assert.equal(await p.locator('.rx-next').textContent(),'Continue to the check →');
   // Esc leaves without starting the check and without marking the cards as watched.
   await p.keyboard.press('Escape');assert(await p.locator('#rx').isHidden());assert.equal(await p.locator('.mastery-option').count(),0);
   assert.equal(await p.evaluate(()=>localStorage.getItem('resonance.explainers.v1')),null);
   assert.equal(await p.locator('#lesson-quiz').textContent(),'Watch the four cards →');assert.equal(await p.evaluate(()=>document.activeElement.id),'lesson-quiz','focus returns to the lesson page');
   // The button opens the cards again; the last button starts the check, once.
   await p.click('#lesson-quiz');assert(await p.locator('#rx').isVisible());for(let k=0;k<4;k++)await p.click('.rx-next');
   assert(await p.locator('#rx').isHidden());assert.equal(await p.locator('.mastery-option').count(),4,'check started');
   assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('resonance.explainers.v1'))[0]),1);
   assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('resonance.progress.v1')).actions.filter(a=>a.id==='lesson-quiz').length),1,'recorded once');
   // The saved journey restores into the check without showing the cards.
   await p.reload();await p.click('#save-continue');await p.waitForSelector('.mastery-option');assert(await p.locator('#rx').count()===0||await p.locator('#rx').isHidden());
   // Another run of the lesson: no cards on arrival, the check opens directly, with "Watch the cards again".
   await p.evaluate(()=>localStorage.removeItem('resonance.progress.v1'));await p.reload();await begin(p);await p.waitForTimeout(1300);
   assert.equal(await p.locator('#rx').isHidden(),true,'watched cards stay closed');assert.equal(await p.locator('#lesson-quiz').textContent(),'Start the four-question check →');
   assert(await p.locator('.rx-again').isVisible(),'way back to the cards');await p.click('#lesson-quiz');assert.equal(await p.locator('.mastery-option').count(),4,'straight to the check');
   assert.deepEqual(p.errors,[]);await p.context().close();}
  // Turkish, phone width and reduced motion: translated text, no horizontal overflow, final frames shown, no wait.
  {const p=await fresh({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.evaluate(()=>localStorage.setItem('resonance.language.v1','tr'));await p.reload();
   await begin(p);await p.locator('#rx').waitFor({timeout:500});
   await p.waitForFunction(()=>document.querySelector('.rx-eyebrow').textContent==='Kontrolden önce');
   const text=await p.locator('#rx').textContent();for(const english of ['Before the check','Checked at the end','End of step','Queue','Next'])assert(!text.includes(english),'English left: '+english);
   assert(await p.evaluate(()=>document.querySelector('.rx-panel').scrollWidth<=document.querySelector('.rx-panel').clientWidth+1),'fits a phone');
   assert.equal(await p.locator('.rx-card:not([hidden]) .rx-pop >> nth=0').evaluate(e=>getComputedStyle(e).animationName),'none','no motion');
   assert.equal(await p.locator('.rx-card:not([hidden]) .rx-pop >> nth=0').evaluate(e=>getComputedStyle(e).opacity),'1','final frame visible');
   assert.deepEqual(p.errors,[]);await p.context().close();}
  // Every character has its own four cards, colour and portrait.
  for(const [i,name,tool,face,colour] of [[1,'Ece','Reserve Studio','ece.jpg','#ff4fa3'],[2,'Denis','Web3 Budget Studio','denis.jpg','#aa82ff'],[3,'Ade','Plan Lab','ade.jpg','#ff8a4c']]){
   const p=await fresh({reducedMotion:'reduce'});await begin(p,i,name);await p.locator('#rx').waitFor();
   assert.equal(await p.locator('.rx-who').textContent(),name+' · '+tool);assert.equal(await p.locator('.rx-card').count(),4);
   assert((await p.locator('.rx-face').getAttribute('src')).endsWith(face));assert.equal(await p.locator('#rx').evaluate(e=>e.style.getPropertyValue('--rx-c')),colour);
   for(let k=0;k<4;k++)await p.click('.rx-next');assert.equal(await p.locator('.mastery-option').count(),4,name+' check');
   assert.deepEqual(p.errors,[]);await p.context().close();}
  // The old storm adventure is gone: ?storm=1 opens the same lesson.
  {const p=await fresh();await p.goto(URL+'?storm=1');await begin(p);await p.locator('#rx').waitFor();assert.equal(await p.locator('#enter, #character-enter').count(),0);await p.context().close();}
  console.log('PASS cards: Continue opens the lesson page and, after the curtain, four Diren cards; keys/Back/Replay, Esc leaves, last button starts the check once, restore skips the cards, watch-again link, Turkish, phone, reduced motion, Ece/Denis/Ade decks, no storm adventure.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
