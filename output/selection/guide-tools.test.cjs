const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
// Folded fine print, one-sentence results and cards, term explanations and the guided tour. NFT access is mocked; nothing is signed or sent.
(async()=>{const root=path.resolve(__dirname,'../vercel-site/public'),types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((q,r)=>{const file=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/\/$/,'/index.html'));try{r.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');r.end(fs.readFileSync(file));}catch{r.statusCode=404;r.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const site='http://127.0.0.1:'+server.address().port,vault='file://'+__dirname+'/vault/';
const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage({acceptDownloads:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
const open=async url=>{await p.goto(url);await p.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;});};
const reveal=()=>p.evaluate(()=>{document.getElementById('workspace').hidden=false;});
const png=async()=>{const [d]=await Promise.all([p.waitForEvent('download'),p.click('#result-card-download')]);const bytes=fs.readFileSync(await d.path());assert.equal(bytes.subarray(1,4).toString(),'PNG');assert(bytes.length>20000);return d.suggestedFilename();};
// Fine print: every first-screen safety note is one line until opened, with its full text kept.
for(const [file,text] of [['index.html',/No token approval or purchase transaction is sent/],['protection.html',/never authorizes spending/],['ade.html',/not forecasts or investment recommendations/],['eric.html',/proposed allocations, never payments/]]){
 await open(vault+file);const fold=p.locator('main details.fine-print').first();assert.equal(await fold.evaluate(d=>d.open),false,file);
 assert((await fold.locator('summary').innerText()).length<90,file);assert.match(await fold.textContent(),text);await fold.locator('summary').click();assert(await fold.locator('summary + *').isVisible(),file);}
// Diren: one purchase → sentence and card; a new rule hides the old sentence.
await open(vault+'index.html');await reveal();for(let i=0;i<6&&!(await p.locator('#example-next').isDisabled());i++)await p.click('#example-next');
assert.equal(await p.locator('#result-sentence').textContent(),'Diren’s rule bought 2.4875 demo units for 20.00 Demo RLO, within the 8.00 price limit.');
assert.equal(await png(),'resonance-diren-result.png');assert.match(await p.locator('#result-card-status').textContent(),/downloaded/);
const before=await p.locator('#available').textContent();await p.click('#site-tour');assert(await p.locator('#tour-card').isVisible());for(let i=0;i<12&&await p.locator('#tour-layer').isVisible();i++)await p.click('#tour-next');
assert.equal(await p.locator('#available').textContent(),before,'the tour must not change the simulation');assert.equal(await p.evaluate(()=>document.activeElement.id),'site-tour');
await p.click('#new-rule');assert(await p.locator('#result-sentence').isHidden());
// Ece: rehearsal → sentence; Turkish follows; revising hides it.
await open(vault+'protection.html');await reveal();await p.click('#example-next');await p.click('#review-protection');await p.click('#confirm-protection');
for(let i=0;i<6&&!(await p.locator('#advance-protection').isDisabled());i++)await p.click('#advance-protection');
assert.match(await p.locator('#result-sentence').textContent(),/^Ece’s rules stopped \d+ of \d+ proposed orders and left [\d.]+ Demo RLO, including the 40\.00 reserve\.$/);
await p.selectOption('#resonance-language','tr');await p.waitForFunction(()=>document.documentElement.lang==='tr');assert.match(await p.locator('#result-sentence').textContent(),/^Ece’nin kuralları \d+ önerilen emirden \d+ tanesini durdurdu/);
assert.equal(await p.locator('.result-headline-eyebrow').textContent(),'Tek cümlede sonuç');await p.selectOption('#resonance-language','en');
assert.equal(await png(),'resonance-ece-result.png');await p.click('#revise-protection');assert(await p.locator('#result-sentence').isHidden());
// Denis and Ade starters.
await open(vault+'eric.html');await reveal();await p.click('#example-next');await p.click('#budget-form button[type=submit]');
assert.match(await p.locator('#result-sentence').textContent(),/^\d+ of \d+ expenses are covered, [\d.]+ Demo RLO goes to goals and [\d.]+ Demo RLO stays as operating cash\.$/);assert.equal(await png(),'resonance-denis-result.png');
await open(vault+'ade.html');await reveal();await p.click('#example-next');await p.click('#ade-form button[type=submit]');
assert.match(await p.locator('#result-sentence').textContent(),/^On the .+ path, (Plan [AB] ends [\d.]+ Demo RLO higher in modeled total value than Plan [AB] \(A: [\d.]+, B: [\d.]+\)|Plans A and B end with the same modeled total value: [\d.]+ Demo RLO)\.$/);
const first=await p.locator('#result-sentence').textContent();await p.selectOption('#ade-path-view','0');assert(first.length>0);assert.equal(await png(),'resonance-ade-result.png');
// Term explanations: marks next to labels, popover, Terms panel; labels keep their text and accessible names.
await open(vault+'protection.html');await reveal();assert(await p.locator('.term-chip').count()>=6);
assert.equal(await p.locator('label:has(#floor)').evaluate(l=>l.childNodes[0].data.trim()),'Keep untouched');assert.equal(await p.locator('.term-chip').first().getAttribute('aria-hidden'),'true');
await p.locator('label:has(#floor) .term-chip').click();assert.match(await p.locator('#term-popover').textContent(),/^Protected reserveMoney the rules never spend/);assert.notEqual(await p.evaluate(()=>document.activeElement.id),'floor');
await p.keyboard.press('Escape');assert(await p.locator('#term-popover').isHidden());
await p.click('#site-terms');assert(await p.locator('#terms-panel').isVisible());assert(await p.locator('#terms-panel dt').count()>=20);assert.equal(await p.locator('#site-terms').getAttribute('aria-expanded'),'true');
await p.keyboard.press('Escape');assert(await p.locator('#terms-panel').isHidden());assert.equal(await p.evaluate(()=>document.activeElement.id),'site-terms');
await p.selectOption('#resonance-language','tr');await p.waitForFunction(()=>document.documentElement.lang==='tr');await p.click('#site-terms');assert.equal(await p.locator('#terms-panel dt').first().textContent(),'Demo RLO');assert.match(await p.locator('#terms-panel dd').first().textContent(),/Uydurma bir alıştırma birimi/);await p.selectOption('#resonance-language','en');
// Tour on every page: visible steps only, keyboard controls, no layout overflow on phones.
const expect={[site+'/']:['Your controls','Start here','Learn, earn, apply','Four tools','What changed'],['file://'+__dirname+'/resonance-playable-v1.html']:['Choose a guide','Your name','Begin','Learn more','Learning passes','Your controls'],
 ['file://'+__dirname+'/mint/index.html']:['Pick your pass','Connect and check','Mint','Your controls'],['file://'+__dirname+'/my/index.html']:['Check your passes','Your progress','Your next step','Saved plans','Your controls'],
 [vault+'eric.html']:['What this tool does','The fine print','Four tools','Open the tool','Unfamiliar word?']};
for(const [url,titles] of Object.entries(expect)){await p.setViewportSize({width:1280,height:800});await p.goto(url);await p.click('#site-tour');
 assert.deepEqual(await p.evaluate(()=>window.ResonanceTour.steps()),titles,url);assert.equal(await p.locator('#tour-count').textContent(),'1 / '+titles.length);assert(await p.locator('#tour-back').isDisabled());
 await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#tour-title').textContent(),titles[1]);await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('#tour-title').textContent(),titles[0]);
 await p.setViewportSize({width:320,height:700});await p.click('#tour-next');assert(await p.evaluate(()=>{const c=document.getElementById('tour-card').getBoundingClientRect();return c.left>=0&&c.right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth;}),url);
 await p.keyboard.press('Escape');assert(await p.locator('#tour-layer').isHidden());}
await p.setViewportSize({width:1280,height:800});await open(vault+'eric.html');await reveal();await p.click('#site-tour');assert((await p.evaluate(()=>window.ResonanceTour.steps())).includes('Your rules'));await p.keyboard.press('Escape');
// Served build: the card can include the portrait without tainting the canvas.
await open(site+'/vault/protection.html');await reveal();await p.click('#example-next');await p.click('#review-protection');await p.click('#confirm-protection');for(let i=0;i<6&&!(await p.locator('#advance-protection').isDisabled());i++)await p.click('#advance-protection');
await png();assert.match(await p.locator('#result-card-status').textContent(),/downloaded/);
assert.deepEqual(errors,[]);console.log('PASS folded fine print, four result sentences and PNG cards (EN/TR, hidden after revision), term marks, Terms panel, tours on six pages, keyboard, 320px. NFT mocked.');}finally{await b.close();server.close();}})().catch(e=>{console.error(e);process.exit(1);});
