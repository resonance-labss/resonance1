// The four character lessons: Continue opens the lesson page with the character's four cards (no wave mission, no
// storm prologue), Esc leaves them, the last card starts the check, quiz progress survives a reload, older saves with
// the mission or the storm adventure restore with a backup, four learning passes, a second visit skips the cards,
// phone width. RESONANCE_LANG=tr runs the same journey in Turkish (check-character-lessons-tr.cjs).
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const TR=process.env.RESONANCE_LANG==='tr';
const names=['Diren','Ece','Denis','Ade'];
const studios=TR?['Koşullu Alım Kasası','Rezerv Atölyesi','Web3 Bütçe Atölyesi','Plan Laboratuvarı']:['Reactive Vault','Reserve Studio','Web3 Budget Studio','Plan Lab'];
const watch=TR?'Dört kartı izle →':'Watch the four cards →',startCheck=TR?'Dört soruluk kontrole başla →':'Start the four-question check →';
// English that must not survive in the Turkish cards.
const english=['Before the check','Next','Replay','Keep 20','Order A','Weekly allowance','Protected floor','Priority 1','Goals paused','Flexible savings','Every check','too old','Purchased assets','Ending balance','under this assumption','Continue to the check'];
async function cards(p){await p.locator('#rx').waitFor();for(let k=0;k<4;k++)await p.click('.rx-next');await p.waitForSelector('.mastery-option');}
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
 try{const p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const url=process.env.RESONANCE_TEST_URL||'file://'+process.cwd()+'/output/selection/resonance-playable-v1.html';await p.goto(url);
  if(TR){await p.selectOption('#resonance-language','tr');await p.waitForFunction(()=>document.documentElement.lang==='tr');}
  for(let i=0;i<4;i++){
   await p.locator('.rs-person').nth(i).click();await p.fill('#rs-input',names[i]);await p.click('#rs-start');
   // Continue opens the lesson page and its cards: no prologue, no mission, no storm button.
   await p.locator('#rx').waitFor();
   assert.equal(await p.locator('#enter, #lesson-register, #lesson-step, #lesson-rule, #lesson-briefing').count(),0,'no mission or prologue '+i);
   assert.equal(await p.locator('#chapter h1').textContent(),studios[i]);assert.equal(await p.locator('#lesson-cards li').count(),4);
   assert.equal(await p.locator('.rx-who').textContent(),names[i]+' · '+studios[i]);assert.equal(await p.locator('.rx-card').count(),4);
   if(TR){await p.waitForFunction(()=>document.querySelector('.rx-eyebrow').textContent==='Kontrolden önce');const text=await p.locator('#rx').textContent();for(const e of english)assert(!text.includes(e),'English left in '+names[i]+': '+e);}
   // Esc leaves the cards without starting the check; the button opens them again.
   await p.keyboard.press('Escape');assert(await p.locator('#rx').isHidden());assert.equal(await p.locator('.mastery-option').count(),0);
   assert.equal(await p.locator('#lesson-quiz').textContent(),watch);
   // A reload restores the lesson page without reopening the cards.
   await p.reload();await p.click('#save-continue');await p.waitForSelector('#lesson-quiz');assert.equal(await p.locator('#chapter h1').textContent(),studios[i]);assert(await p.locator('#rx').count()===0||await p.locator('#rx').isHidden());
   await p.click('#lesson-quiz');await cards(p);
   // One wrong answer and a retry, one right answer, then the check resumes at question 2 after a reload.
   await p.locator('.mastery-option').nth(2).click();await p.click('#lesson-answer-next');await p.locator('.mastery-option').nth(0).click();await p.click('#lesson-answer-next');
   await p.reload();await p.click('#save-continue');await p.waitForSelector('.mastery-option');assert.match(await p.locator('.mastery-progress').innerText(),/2 \/ 4/,'quiz restore '+i);
   if(i===3){await p.evaluate(()=>{const key='resonance.progress.v1',r=JSON.parse(localStorage.getItem(key));delete r.adeQuizVersion;localStorage.setItem(key,JSON.stringify(r));});await p.reload();await p.click('#save-continue');await p.waitForSelector('.mastery-option');
    assert.match(await p.locator('.mastery-progress').innerText(),/1 \/ 4/,'old Ade quiz migration');assert(await p.evaluate(()=>!!localStorage.getItem('resonance.progress.before-ade-quiz')),'Ade backup');
    await p.locator('.mastery-option').nth(0).click();await p.click('#lesson-answer-next');}
   // The cards stay one click away during the check, and closing them returns to the same question.
   await p.getByRole('button',{name:TR?'Kartlara göz at':'Review the cards',exact:true}).click();await p.locator('#rx').waitFor();for(let k=0;k<4;k++)await p.click('.rx-next');assert(await p.locator('#rx').isHidden());assert.match(await p.locator('.mastery-progress').innerText(),/2 \/ 4/);
   for(const answer of [1,3,2]){assert.equal(await p.locator('.mastery-option').count(),4);await p.locator('.mastery-option').nth(answer).click();await p.click('#lesson-answer-next');}
   await p.waitForSelector('#lesson-mint');assert.equal(await p.locator('.rm-card').count(),0,'no storm card on a lesson pass');
   assert((await p.locator('#lesson-mint').getAttribute('href')).endsWith('character='+i),'mint link');
   assert.equal(await p.locator('#lesson-tool-next').getAttribute('href'),['vault/index.html','vault/protection.html','vault/eric.html','vault/ade.html'][i]);
   const pass=await p.evaluate(i=>JSON.parse(localStorage.getItem('resonance.learning-passes.v1'))[i],i);assert.equal(pass.quizVersion,[3,4,2,2][i]);assert.equal(pass.correctAnswers,4);
   await p.click('#lesson-characters');}
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('resonance.explainers.v1'))),{0:1,1:1,2:1,3:1},'all four decks watched');
  // Four passes in the library.
  await p.reload();await p.click('#save-continue');await p.waitForSelector('#rs-input');await p.locator('.learning-passes:visible').first().click();
  assert.equal(await p.locator('.lesson-pass').count(),4);assert(!(await p.locator('.lesson-pass').allTextContents()).some(s=>/NOT COMPLETED|TAMAMLANMADI/.test(s)),'missing pass');await p.locator('.profile-close').click();
  // A second visit opens the lesson page directly, with the check button and a way back to the cards.
  await p.locator('.rs-person').nth(3).click();await p.click('#rs-start');await p.waitForSelector('#lesson-quiz');await p.waitForTimeout(300);
  assert(await p.locator('#rx').isHidden(),'watched cards do not reopen');assert.equal(await p.locator('#lesson-quiz').textContent(),startCheck);assert(await p.locator('.rx-again').isVisible());
  await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
  await p.screenshot({path:'output/selection/character-lesson-mobile.png',fullPage:true});await p.setViewportSize({width:1360,height:900});await p.screenshot({path:'output/selection/character-lesson-desktop.png',fullPage:true});
  // Older saves: the mission steps go, quiz answers stay; a storm adventure save resumes at the lesson page.
  const base={version:1,lessonQuizVersion:2,eceLessonVersion:1,ericLessonVersion:1,adeQuizVersion:1,toolQuizVersion:1,name:'Ece',location:'Keep a reserve for tomorrow',updated:new Date().toISOString()};
  const mission=[{type:'character',index:1},{type:'field',id:'rs-input',value:'Ece'},{type:'click',id:'rs-start'},{type:'click',id:'character-enter'},{type:'field',id:'lesson-rule',value:'recommended'},{type:'click',id:'lesson-register'},{type:'click',id:'lesson-step'},{type:'click',id:'lesson-step'},{type:'click',id:'lesson-step'},{type:'click',id:'lesson-quiz'},{type:'answer',index:0},{type:'click',id:'lesson-answer-next'}];
  await p.evaluate(r=>{localStorage.removeItem('resonance.progress.before-cards');localStorage.setItem('resonance.progress.v1',JSON.stringify(r));},{...base,actions:mission});await p.reload();await p.click('#save-continue');await p.waitForSelector('.mastery-option');
  assert.match(await p.locator('.mastery-progress').innerText(),/2 \/ 4/,'old mission save keeps its answer');assert.match(await p.locator('.save-status').textContent(),TR?/dört kısa kart/:/four short cards/);
  assert(await p.evaluate(()=>!!localStorage.getItem('resonance.progress.before-cards')),'backup of the old save');
  const storm=[{type:'character',index:0},{type:'field',id:'rs-input',value:'Diren'},{type:'click',id:'rs-start'},{type:'click',id:'enter'},{type:'field',id:'condition',value:'low'},{type:'click',id:'register'},{type:'click',id:'next'}];
  await p.evaluate(r=>localStorage.setItem('resonance.progress.v1',JSON.stringify(r)),{...base,actions:storm});await p.reload();await p.click('#save-continue');await p.waitForSelector('#lesson-cards');
  assert.equal(await p.locator('#chapter h1').textContent(),studios[0]);assert.equal(await p.locator('#enter').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS'+(TR?' Turkish':'')+': four card lessons open from Continue (no mission, no prologue), Esc and reload keep the lesson page, last card starts the check, quiz restore, Ade migration, review during the check, four passes, second visit skips the cards, mobile, old mission and storm saves restore with a backup.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
