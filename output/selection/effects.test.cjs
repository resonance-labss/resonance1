const {chromium}=require('playwright'),assert=require('node:assert/strict');
// Scene and effect layers: they react to play, stay silent on replay and reduced motion, and never change game or vault values.
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const errors=[];const G='file://'+__dirname+'/resonance-playable-v1.html?storm=1',V='file://'+__dirname+'/vault/';
const page=async(opts={})=>{const p=await b.newPage(opts);p.on('pageerror',e=>errors.push(e.message));return p;};
const idle=p=>p.waitForFunction(()=>document.querySelector('#chapter').dataset.visualBusy!=='true');
const draws=p=>p.evaluate(()=>new Promise(r=>{const c=document.querySelector('.tutorial-canvas'),g=c.getContext('2d'),orig=g.drawImage;let n=0;g.drawImage=function(...a){n++;return orig.apply(this,a);};setTimeout(()=>{g.drawImage=orig;r(n);},700);}));
let p=await page({viewport:{width:1280,height:900}});await p.goto(G);await p.click('#rs-start');await p.click('#enter');await p.locator('.tutorial-canvas').scrollIntoViewIfNeeded();
assert(await draws(p)>3,'idle scene keeps moving');
await p.selectOption('#condition','low');await p.selectOption('#amount','20');await p.click('#register');await p.waitForSelector('#chapter[data-fx-phase=ready]',{timeout:2000});
await p.click('#next');assert.equal(await p.locator('#shield').textContent(),'25','state is final right after the click');await idle(p);
assert.equal(await p.locator('.node:has(#shield)').getAttribute('data-fx-delta'),'−15');assert.equal(await p.locator('#chapter').getAttribute('data-fx-phase'),'queued');
await p.click('#next');await idle(p);assert.equal(await p.locator('.node:has(#reserve)').getAttribute('data-fx-delta'),'−20');assert.match(await p.locator('.node:has(#reserve)').getAttribute('class'),/fx-spend/,'spending reserve is gold, not a loss');assert.equal(await p.locator('#shield').textContent(),'45');assert.equal(await p.locator('#chapter').getAttribute('data-fx-phase'),'executed');
assert.equal(await p.evaluate(()=>document.body.firstElementChild.id),'site-bar');
// Retry during a block releases the busy state instead of leaving results hidden.
await p.click('#retry');await p.selectOption('#condition','low');await p.selectOption('#amount','20');await p.click('#register');await p.click('#next');await p.waitForTimeout(300);await p.click('#retry');await p.waitForTimeout(250);
assert.equal(await p.locator('#chapter').getAttribute('data-visual-busy'),null);await p.waitForTimeout(1700);assert.equal(await p.locator('.node[data-fx-delta]').count(),0,'Retry makes no fake pops');
// Turkish: a transfer-only block plays the transfer, not a fake 15-energy wave (about 1.25 s, not 3.25 s).
await p.selectOption('#resonance-language','tr');await p.waitForFunction(()=>document.documentElement.lang==='tr');await p.selectOption('#condition','low');await p.selectOption('#amount','20');await p.click('#register');await p.click('#next');await idle(p);
const t0=Date.now();await p.click('#next');await idle(p);assert(Date.now()-t0<2300,'TR transfer block took '+(Date.now()-t0)+' ms');await p.selectOption('#resonance-language','en');
// Replay after reload: state restores with no celebrations, toasts or pops.
await p.reload();await p.click('#save-continue');await p.waitForSelector('#next');await p.waitForTimeout(400);
assert.equal(await p.locator('.fx-layer > *').count(),0);assert.equal(await p.locator('.node[data-fx-delta]').count(),0);assert(!/executed|failed|survived/.test(await p.locator('#chapter').getAttribute('data-fx-phase')||''),'no outcome mood on replay');await p.close();
// Reduced motion: no ambient loop, instant blocks, no effect layer.
p=await page({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto(G);await p.click('#rs-start');await p.click('#enter');await p.locator('.tutorial-canvas').scrollIntoViewIfNeeded();
assert.equal(await draws(p),0,'no ambient frames under reduced motion');await p.selectOption('#condition','low');await p.selectOption('#amount','20');await p.click('#register');await p.click('#next');
assert.equal(await p.locator('#chapter').getAttribute('data-visual-busy'),null);assert.equal(await p.locator('.fx-layer > *').count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.close();
// Phone: the canvas is above the fold when Next is tapped, so a short toast reports the change.
p=await page({viewport:{width:390,height:844}});await p.goto(G);await p.evaluate(()=>localStorage.clear());await p.reload();await p.click('#rs-start');await p.click('#enter');await p.selectOption('#condition','low');await p.selectOption('#amount','20');await p.click('#register');
await p.click('#next');await idle(p);assert.match(await p.locator('.fx-toast').textContent(),/SHIELD 40 → 25/);assert.equal(await p.locator('.fx-layer').evaluate(e=>getComputedStyle(e).pointerEvents),'none');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.close();
// Vaults: budget token and purchase burst ride on the tool's events; values and chart structure stay exact.
p=await page({viewport:{width:1360,height:900}});const open=async f=>{await p.goto(V+f);await p.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;document.getElementById('workspace').hidden=false;});};
await open('index.html');await p.click('#example-next');await p.click('#example-next');await p.click('#example-next');assert.equal(await p.locator('.vfx-token').count(),1);assert.equal(await p.locator('#reserved').textContent(),'20.00');
await p.waitForTimeout(1500);assert.equal(await p.locator('.vfx-token').count(),0,'token removes itself');await p.click('#example-next');assert.equal(await p.locator('#state').getAttribute('class'),'badge vfx-armed');await p.click('#example-next');
assert.equal(await p.locator('#owned').textContent(),'2.4875');assert.equal(await p.locator('.vfx-chip').textContent(),'+2.4875');
await open('ade.html');await p.click('#example-next');await p.click('#ade-form button[type=submit]');assert.equal(await p.locator('#ade-chart polyline').count(),2);assert.equal(await p.locator('#ade-chart polyline').nth(1).getAttribute('stroke-dasharray'),'8 5');
await open('eric.html');await p.click('#example-next');await p.click('#budget-form button[type=submit]');assert.equal(await p.locator('#proposal-summary').getAttribute('data-fx-tone'),'ok');
await p.evaluate(()=>{document.getElementById('workspace').hidden=true;});await p.waitForTimeout(50);assert.equal(await p.locator('.vfx-layer > *').count(),0);await p.close();
assert.deepEqual(errors,[]);console.log('PASS idle scene, ready/queued/executed moods, number pops (gold reserve spend), no pops after Retry, retry releases busy, TR transfer timing, silent replay and reduced motion, phone toast, vault token/burst/armed badge, Ade dash kept, Denis tone.');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
