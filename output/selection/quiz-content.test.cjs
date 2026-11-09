// The four-question checks ask about each character's tool directly. This keeps the quiz versions identical everywhere
// they are read (academy, mint, NFT preview, My Resonance, home cover), every question translated, the correct answers
// where the lesson checks expect them, and an unfinished old check restarting from question 1.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const SEL=__dirname,read=f=>fs.readFileSync(path.join(SEL,f),'utf8');
const VERSIONS='[3,4,2,2]';
(async()=>{
 // 1. One version table, read the same way in every place that decides "lesson finished".
 const lessons=read('character-lessons.js');
 assert.equal((lessons.match(/\[3,4,2,2\]\[i\]/g)||[]).length,1,'learning-passes status label');
 assert.equal((lessons.match(/\[3,4,2,2\]\[index\]/g)||[]).length,1,'academy pass record');
 assert(read('mint/mint.js').includes(VERSIONS+'[index()]'),'mint eligibility');
 assert(read('nft-preview.js').includes(VERSIONS+'[index]'),'NFT preview');
 assert.match(read('my/dashboard.js'),/'index\.html',3\].*'protection\.html',4\].*'eric\.html',2\].*'ade\.html',2\]/,'My Resonance');
 assert(fs.readFileSync(path.join(SEL,'../../integrations/web/home.html'),'utf8').includes('VERSION='+VERSIONS),'home cover');
 assert(!/\?2:i===1\?3:1|\?2:index===1\?3:1/.test(lessons+read('mint/mint.js')+read('nft-preview.js')),'no old version expressions left');

 // 2. Sixteen questions about the tools, each with four options, the correct answer at 0,1,3,2 and a Turkish version of every string.
 const tr=JSON.parse(read('i18n/tr.json'));
 // Each lesson's quiz is the array literal after "q:"; read it by matching brackets outside strings.
 const arrayAt=i=>{let depth=0,j=i;for(;j<lessons.length;j++){const c=lessons[j];if(c==='"'||c==="'"){j++;while(lessons[j]!==c){if(lessons[j]==='\\')j++;j++;}continue;}if(c==='[')depth++;else if(c===']'&&--depth===0)break;}return lessons.slice(i,j+1);};
 const blocks=[...lessons.matchAll(/q:\[\[/g)].map(m=>Function('return '+arrayAt(m.index+2))());
 assert.equal(blocks.length,4,'four characters');
 const topics=[/vault rule|queued at 8|spending cap|expires after/,/keep 20 untouched|shared weekly cap|data-age|new demo week/,/cash floor|priority 1|flexible savings|rehearsal/,/Plan Lab order|cash\.|invested RLO|recovery scenario/];
 blocks.forEach((qs,c)=>{assert.equal(qs.length,4,'character '+c);qs.forEach(([q,options,correct,why],k)=>{
  assert.equal(options.length,4,'four options');assert.equal(correct,[0,1,3,2][k],'answer position '+c+'/'+k);
  assert.match(q,topics[c],'character '+c+' question '+(k+1)+' is about the tool: '+q);
  for(const text of [q,why,...options])assert(tr[text],'Turkish missing: '+text);});});
 for(const old of ['The shield is at 25. Your rule says','What does your Diren NFT do','After allocating 20 of your 50 energy','Shield is 25 and reserve is 10'])assert(!lessons.includes(old),'old question removed: '+old);

 // 3. An unfinished check saved before this change restarts from question 1, with a backup of the old save.
 const b=await chromium.launch({channel:'chrome',headless:true});
 try{const p=await b.newPage({reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('file://'+path.join(SEL,'resonance-playable-v1.html'));
  await p.locator('.rs-person').nth(0).click();await p.fill('#rs-input','Diren');await p.click('#rs-start');await p.locator('#rx').waitFor();for(let k=0;k<4;k++)await p.click('.rx-next');
  assert.match(await p.locator('#chapter').textContent(),/Your vault rule says: buy when the unit price is at or below 8/);
  for(const a of [0,1]){await p.locator('.mastery-option').nth(a).click();await p.click('#lesson-answer-next');}
  assert.match(await p.locator('.mastery-progress').innerText(),/3 \/ 4/);
  await p.evaluate(()=>{const k='resonance.progress.v1',r=JSON.parse(localStorage.getItem(k));delete r.toolQuizVersion;localStorage.setItem(k,JSON.stringify(r));});
  await p.reload();await p.click('#save-continue');await p.waitForSelector('.mastery-option');
  assert.match(await p.locator('.mastery-progress').innerText(),/1 \/ 4/,'restarts from question 1');
  assert(await p.evaluate(()=>!!localStorage.getItem('resonance.progress.before-tool-quiz')),'old save kept as a backup');
  await p.locator('.mastery-option').nth(0).click();await p.click('#lesson-answer-next');assert.match(await p.locator('.mastery-progress').innerText(),/2 \/ 4/);
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('resonance.progress.v1')).toolQuizVersion),1,'the next save records the new quiz version');
  assert.deepEqual(errors,[]);
 }finally{await b.close();}
 console.log('PASS tool quizzes: one version table in five places, 16 tool questions with Turkish and answer positions, old unfinished checks restart from question 1 with a backup.');
})().catch(e=>{console.error(e);process.exit(1);});
