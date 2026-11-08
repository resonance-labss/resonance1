// Lesson end, learning pass, storm hand-over, mint page, vault results and the on-demand Turkish dictionary.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
const SEL=path.resolve(__dirname),PUB=path.resolve(__dirname,'../vercel-site/public'),checks=[];
const check=(name,fn)=>checks.push([name,fn]);
async function fresh(b,opts={}){const ctx=await b.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce',...opts});const p=await ctx.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));return p;}
async function done(p){assert.deepEqual(p.errors,[]);await p.context().close();}
async function enterLesson(p,i,name){await p.locator('.rs-person').nth(i).click();await p.fill('#rs-input',name);await p.click('#rs-start');await p.click('#character-enter');if(await p.locator('#lesson-briefing').count()){await p.check('#briefing-read');await p.click('#briefing-continue');}}
async function runLesson(p,steps){await p.click('#lesson-register');for(let n=0;n<steps;n++)await p.click('#lesson-step');}
async function quiz(p){for(const a of [0,1,3,2]){await p.waitForTimeout(150);await p.locator('.mastery-option').nth(a).click();await p.click('#lesson-answer-next');}}
async function stormMastery(p,character,name){await p.locator('.rs-person').nth(character).click();await p.fill('#rs-input',name);await p.click('#rs-start');await p.click('#enter');await p.click('#quick-recommend');await p.click('#register');await p.click('#next');await p.click('#next');await p.click('#quick-finish');await p.click('#mastery-start');
 for(let topic=0;topic<5&&!(await p.locator('.rm-card').count());topic++)for(let k=0;k<4;k++){await p.locator('.mastery-option').nth(k).click();const next=p.locator('#mastery-next'),label=await next.textContent();await next.click();if(!/again/.test(label))break;}
 await p.waitForSelector('.rm-card');}
const unlock=p=>p.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;document.getElementById('workspace').hidden=false;});

check('lesson end: the wrong rule asks for a retry, the right rule keeps its step message',async b=>{
 const p=await fresh(b);await p.goto('file://'+SEL+'/resonance-playable-v1.html');await enterLesson(p,0,'Diren');
 await p.selectOption('#lesson-rule','alternative');await runLesson(p,2);const wrong=await p.locator('#status').textContent();
 assert.match(wrong,/Try the recommended rule: Shield < 30 → transfer 20\.$/);assert.doesNotMatch(wrong,/Mission complete/);assert(await p.locator('#lesson-quiz').isHidden());
 await p.click('#lesson-retry');await runLesson(p,2);assert.match(await p.locator('#status').textContent(),/^Executed: .+ Mission complete\. You are ready for the knowledge check\.$/);
 await p.click('#lesson-quiz');if(await p.locator('#rx').isVisible())for(let k=0;k<4;k++)await p.click('.rx-next');await quiz(p);await p.waitForSelector('#lesson-mint');
 assert.equal(await p.locator('#mastery-content h1').textContent(),'Learning pass earned.');assert.equal(await p.locator('.rm-card').count(),0);
 assert.equal(await p.locator('#lesson-mint').getAttribute('href'),'mint/index.html?character=0');assert.equal(await p.locator('#lesson-mint').textContent(),'Claim your Diren learning pass on Sepolia →');
 assert.notEqual(await p.locator('#lesson-tool-next').evaluate(e=>getComputedStyle(e).color),'rgb(0, 0, 238)');assert.equal(await p.locator('.lesson-requirements a').count(),3);
 await p.click('#lesson-characters');await enterLesson(p,1,'Ece');await runLesson(p,3);const ece=await p.locator('#status').textContent();assert.match(ece,/Second reinforcement stopped.+Mission complete/);
 await done(p);
});

check('lesson end and pass screen in Turkish',async b=>{
 const p=await fresh(b);await p.goto('file://'+SEL+'/resonance-playable-v1.html');await p.evaluate(()=>localStorage.setItem('resonance.language.v1','tr'));await p.reload();await enterLesson(p,0,'Diren');
 await p.selectOption('#lesson-rule','alternative');await runLesson(p,2);assert.match(await p.locator('#status').textContent(),/Önerilen kuralı dene: Kalkan < 30 → 20 aktar\.$/);
 await p.click('#lesson-retry');await runLesson(p,2);assert.match(await p.locator('#status').textContent(),/Görev tamamlandı\. Bilgi kontrolüne hazırsın\.$/);
 await p.click('#lesson-quiz');if(await p.locator('#rx').isVisible())for(let k=0;k<4;k++)await p.click('.rx-next');await quiz(p);await p.waitForSelector('#lesson-mint');const text=await p.locator('#mastery-content').innerText();
 for(const english of ['Claim your','Already hold','Minting needs','Get Rabby','Get Sepolia','Review this knowledge','Learn with another'])assert(!text.includes(english),'English left: '+english);
 await done(p);
});

check('wave guide and crew follow the game state in Turkish',async b=>{
 const read=async lang=>{const p=await fresh(b);await p.goto('file://'+SEL+'/resonance-playable-v1.html?storm=1');if(lang==='tr'){await p.evaluate(()=>localStorage.setItem('resonance.language.v1','tr'));await p.reload();}
  await p.fill('#rs-input','Guide');await p.click('#rs-start');await p.click('#enter');await p.click('#quick-recommend');await p.click('#register');await p.click('#next');await p.waitForTimeout(300);
  const r=await p.evaluate(()=>({guide:window.ResonanceI18n.source(document.getElementById('wave-guide')),shown:document.getElementById('wave-guide').textContent,crew:window.ResonanceI18n.source(document.querySelector('.city-reaction p:last-child')||document.querySelector('.city-reaction'))}));await done(p);return r;};
 const en=await read('en'),tr=await read('tr');assert.match(en.guide,/^HOLD POSITION/);assert.equal(tr.guide,en.guide);assert.equal(tr.crew,en.crew);assert.match(tr.shown,/^MEVZİNİ KORU · /);
});

check('storm adventure: Ece is sent to her 4-question check, then to mint, and a reload replays it',async b=>{
 const p=await fresh(b);await p.goto('file://'+SEL+'/resonance-playable-v1.html?storm=1');await stormMastery(p,1,'Storm Ece');
 const button=p.locator('#collectible-quiz');assert.equal(await button.textContent(),'Finish Ece’s 4-question check to unlock minting →');assert.equal(await p.locator('.rm-side a[href^="mint/"]').count(),0);
 await button.click();await p.waitForSelector('.mastery-option');assert.match(await p.locator('.mastery-progress').textContent(),/1 \/ 4/);await quiz(p);
 await p.waitForSelector('#lesson-mint');assert.equal(await p.locator('#lesson-mint').getAttribute('href'),'mint/index.html?character=1');assert.equal(await p.locator('.rm-card').count(),1);assert.equal(await p.locator('.rm-side a[href^="mint/"]').count(),0);
 const pass=await p.evaluate(()=>JSON.parse(localStorage.getItem('resonance.learning-passes.v1'))[1]);assert.equal(pass.quizVersion,4);assert.equal(pass.correctAnswers,4);
 await p.reload();await p.click('#save-continue');await p.waitForSelector('#lesson-mint');assert.equal(await p.locator('.rm-card').count(),1);
 // With the pass already held, the storm screen links to mint and keeps the check as a quiet retake.
 await p.evaluate(()=>{localStorage.removeItem('resonance.progress.v1');});await p.goto('file://'+SEL+'/resonance-playable-v1.html?storm=1');await stormMastery(p,1,'Again');
 assert.equal(await p.locator('.rm-side a[href^="mint/"]').count(),1);assert.equal(await p.locator('#collectible-quiz').textContent(),'Take Ece’s 4-question check again');
 await done(p);
});

check('mint page: first-visit texts, lesson link, wallet needs, Denis artwork note',async b=>{
 const p=await fresh(b);await p.goto('file://'+SEL+'/mint/index.html');
 assert.equal(await p.locator('#account').textContent(),'Not connected');assert.equal(await p.locator('#holdings').textContent(),'NFT ownership has not been checked.');assert.equal(await p.locator('#fee').textContent(),'No fee estimate yet.');
 assert(await p.locator('#lesson-start').isVisible());assert.equal(await p.locator('#lesson-start a').textContent(),'Start Diren’s lesson in the academy →');assert.match(await p.locator('#artwork-note').textContent(),/original artwork; this preview uses the new neon portrait/);assert.equal(await p.locator('.wallet-needs a').count(),3);
 await p.selectOption('#character','2');assert.match(await p.locator('#artwork-note').textContent(),/original Eric artwork/);assert.equal(await p.locator('#lesson-start a').textContent(),'Start Denis’s lesson in the academy →');assert.equal(await p.locator('#vault-access').textContent(),'Already have a Denis NFT? Check vault access →');assert.equal(await p.locator('#vault-access').getAttribute('href'),'../vault/eric.html');assert.equal(await p.locator('#account').textContent(),'Not connected');
 await p.evaluate(()=>localStorage.setItem('resonance.learning-passes.v1',JSON.stringify({2:{character:2,quizVersion:2,correctAnswers:4}})));await p.goto('file://'+SEL+'/mint/index.html?character=2');assert(await p.locator('#lesson-start').isHidden());
 await p.click('#connect');await p.waitForSelector('.wallet-picker');assert.equal(await p.locator('#wallet-picker-title').textContent(),'No wallet found');assert.equal(await p.locator('.wallet-picker .wallet-install a').count(),5);await p.click('.wallet-cancel');await p.waitForFunction(()=>/No browser wallet was found\. Install MetaMask, OKX Wallet/.test(document.getElementById('status').textContent));
 await p.evaluate(()=>localStorage.setItem('resonance.language.v1','tr'));await p.reload();const tr=await p.locator('main').innerText();for(const english of ['Minting needs','Wallets show this pass','Get Rabby'])assert(!tr.includes(english),'English left: '+english);
 await done(p);
});

check('wallet picker: several wallets are listed, the chosen one is used and remembered',async b=>{
 const p=await fresh(b);await p.addInitScript(()=>{const make=(name,rdns,account)=>({info:{uuid:rdns,name,rdns,icon:'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'},provider:{calls:[],on(){},removeListener(){},async request({method}){this.calls.push(method);if(method==='eth_requestAccounts'||method==='eth_accounts')return [account];if(method==='eth_chainId')return '0x1';throw Object.assign(Error('stop'),{code:4001});}}});
  const list=[make('MetaMask','io.metamask','0x'+'1'.repeat(40)),make('Rabby Wallet','io.rabby','0x'+'2'.repeat(40))];window.testWallets=list;
  window.addEventListener('eip6963:requestProvider',()=>{for(const w of list)window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:Object.freeze({info:w.info,provider:w.provider})}));});});
 await p.goto('file://'+SEL+'/mint/index.html');await p.click('#connect');await p.waitForSelector('.wallet-picker');
 assert.deepEqual(await p.locator('.wallet-picker li button').allInnerTexts(),['MetaMask','Rabby Wallet']);assert.deepEqual(await p.locator('.wallet-picker .wallet-install a').allTextContents(),['Get OKX Wallet ↗','Get Coinbase Wallet ↗','Get Trust Wallet ↗']);
 await p.locator('.wallet-picker li button').nth(1).click();await p.waitForFunction(()=>window.testWallets[1].provider.calls.includes('eth_requestAccounts'));
 assert.equal(await p.evaluate(()=>window.testWallets[0].provider.calls.length),0,'the other wallet is never asked');
 assert.equal(await p.evaluate(()=>localStorage.getItem('resonance.wallet.v1')),'io.rabby');
 await p.reload();await p.click('#connect');await p.waitForSelector('.wallet-picker');assert.match(await p.locator('.wallet-picker li').nth(1).innerText(),/Last used/i);
 await done(p);
});

check('wallet picker: a wallet that both announces itself and sets window.ethereum is listed once',async b=>{
 const p=await fresh(b);await p.addInitScript(()=>{const mk=()=>({calls:[],on(){},removeListener(){},async request({method}){this.calls.push(method);if(method==='eth_requestAccounts'||method==='eth_accounts')return ['0x'+'3'.repeat(40)];if(method==='eth_chainId')return '0x1';throw Object.assign(Error('stop'),{code:4001});}});
  window.legacy=Object.assign(mk(),{isRabby:true,isMetaMask:true});window.ethereum=window.legacy;window.announced=mk();
  window.addEventListener('eip6963:requestProvider',()=>window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:Object.freeze({info:{uuid:'r',name:'Rabby Wallet',rdns:'io.rabby',icon:''},provider:window.announced})})));});
 await p.goto('file://'+SEL+'/mint/index.html');await p.click('#connect');await p.waitForFunction(()=>window.announced.calls.includes('eth_requestAccounts'));
 assert.equal(await p.locator('.wallet-picker').count(),0,'one wallet connects without a picker');assert.equal(await p.evaluate(()=>window.legacy.calls.length),0);
 await done(p);
});

check('vault: the result sentence comes into view and a typed comma becomes a dot',async b=>{
 const runs={'index.html':async p=>{for(let i=0;i<6&&!(await p.locator('#example-next').isDisabled());i++)await p.click('#example-next');},'eric.html':async p=>{await p.click('#example-next');await p.waitForTimeout(1200);await p.click('#budget-form button[type=submit]');},'ade.html':async p=>{await p.click('#example-next');await p.waitForTimeout(1200);await p.click('#ade-form button[type=submit]');},'protection.html':async p=>{await p.click('#example-next');await p.click('#review-protection');await p.click('#confirm-protection');for(let i=0;i<6&&!(await p.locator('#advance-protection').isDisabled());i++)await p.click('#advance-protection');}};
 for(const [file,run] of Object.entries(runs))for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  const p=await fresh(b,{viewport});await p.goto('file://'+SEL+'/vault/'+file);await unlock(p);await run(p);await p.waitForSelector('#result-headline:not([hidden])');await p.waitForTimeout(700);
  const r=await p.locator('#result-sentence').evaluate(e=>{const box=e.getBoundingClientRect(),bar=document.querySelector('.workspace-shortcuts')?.getBoundingClientRect().bottom||0;return {top:box.top,bar,h:innerHeight,focus:document.activeElement?.id};});
  assert(r.top>=r.bar-1&&r.top<r.h,file+' at '+viewport.width+': result sentence out of view '+JSON.stringify(r));assert.equal(r.focus,'result-headline',file);await done(p);
 }
 const p=await fresh(b);await p.goto('file://'+SEL+'/vault/index.html');await unlock(p);const field=p.locator('#limit');await field.fill('');await field.click();await p.keyboard.type('8,5');
 assert.deepEqual(await field.evaluate(e=>[e.value,e.validationMessage]),['8.5','']);await done(p);
});

check('Turkish dictionary: only Turkish visitors download it, and a saved choice renders in Turkish',async b=>{
 const p=await fresh(b),seen=[];p.on('request',r=>{if(r.url().endsWith('/i18n/tr.js'))seen.push(r.url());});
 await p.goto('file://'+SEL+'/vault/index.html');assert.equal(seen.length,0,'English visitor downloaded tr.js');
 await p.selectOption('#resonance-language','tr');await p.waitForFunction(()=>document.documentElement.lang==='tr');assert.equal(seen.length,1);
 assert.notEqual(await p.locator('h1').first().textContent(),await p.evaluate(()=>window.ResonanceI18n.source(document.querySelector('h1'))));
 await p.selectOption('#resonance-language','en');await p.selectOption('#resonance-language','tr');assert.equal(await p.evaluate(()=>document.documentElement.lang),'tr','second switch is immediate');assert.equal(seen.length,1);await done(p);
 const q=await fresh(b);await q.goto('file://'+SEL+'/mint/index.html');await q.evaluate(()=>localStorage.setItem('resonance.language.v1','tr'));
 await q.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{window.firstHeading=document.querySelector('h1')?.textContent;}),{once:true}));await q.reload();
 assert.equal(await q.evaluate(()=>window.firstHeading),'Karakterin zincir üzerinde.');
 for(const page of [PUB+'/index.html',SEL+'/my/index.html',SEL+'/vault/eric.html',SEL+'/vault/ade.html',SEL+'/vault/protection.html',SEL+'/resonance-playable-v1.html']){await q.goto('file://'+page);await q.waitForTimeout(150);assert.equal(await q.evaluate(()=>document.documentElement.lang),'tr',page);}
 await done(q);
});

check('public home: one honest AI/Latch card and the wallet note, in both languages',async b=>{
 const p=await fresh(b);await p.goto('file://'+PUB+'/index.html');const card=await p.locator('.card:has(h3:text("Guided examples and manual rules"))').innerText();assert.doesNotMatch(card,/20 AI drafts|quota/);
 assert.equal(await p.locator('.card-note a').count(),3);await p.evaluate(()=>localStorage.setItem('resonance.language.v1','tr'));await p.reload();
 const text=await p.locator('main').innerText();for(const english of ['Guided examples and manual rules','AI drafts and live','Minting needs','Get Rabby'])assert(!text.includes(english),'English left: '+english);
 await done(p);
});

(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{for(const [name,fn] of checks){try{await fn(b);}catch(e){e.message=name+': '+e.message;throw e;}}console.log('PASS pass flow: lesson end, learning pass, storm hand-over, mint page, wallet picker, vault results, comma input, on-demand Turkish, public home.');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
