const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
// Shared site bar on every public page, plus a size guard for the academy page. Run output/selection/build.py first.
(async()=>{const game=fs.readFileSync(path.join(__dirname,'resonance-playable-v1.html'),'utf8');assert(!game.includes('data:image/'),'academy page must not embed base64 images');assert(game.length<400000,'academy page grew to '+game.length+' bytes');
const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const root='file://'+__dirname+'/';
for(const page of ['resonance-playable-v1.html','my/index.html','mint/index.html','vault/index.html','vault/protection.html','vault/ade.html','vault/eric.html']){
 await p.setViewportSize({width:1280,height:800});await p.goto(root+page);
 assert.equal(await p.evaluate(()=>document.body.firstElementChild.id),'site-bar',page);
 assert.equal(await p.locator('#site-bar #demo-unit').count(),1,page);assert.equal(await p.locator('#site-bar #resonance-language').count(),1,page);
 assert.equal(await p.locator('#site-home').getAttribute('href'),root,page);assert.match(await p.locator('#site-release').textContent(),/^v\d+\.\d+\.\d+$/);
 assert.equal(await p.locator('link[rel~=icon]').count(),1,page);assert(await p.locator('#demo-unit-info > p').isHidden(),page);
 for(const width of [1280,320]){await p.setViewportSize({width,height:800});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),page+' overflows at '+width);}
 assert(await p.evaluate(()=>{const r=document.getElementById('site-bar').getBoundingClientRect();return r.height<140&&r.top===0;}),page+' bar too tall');}
await p.setViewportSize({width:1280,height:800});await p.goto(root+'mint/index.html');
await p.waitForFunction(()=>{const i=document.getElementById('preview');return i.complete&&i.naturalWidth===720;});assert.match(await p.locator('#preview').getAttribute('src'),/nft\/diren\.webp$/);
await p.click('#demo-unit-info > summary');assert(await p.locator('#demo-unit-info > p').isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await p.keyboard.press('Escape');assert(await p.locator('#demo-unit-info > p').isHidden());assert.equal(await p.evaluate(()=>document.activeElement.parentElement.id),'demo-unit-info');
await p.click('#demo-unit-info > summary');await p.click('h1');assert(await p.locator('#demo-unit-info > p').isHidden());
await p.selectOption('#resonance-language','tr');await p.waitForFunction(()=>document.documentElement.lang==='tr');assert.equal(await p.locator('#site-bar').getAttribute('aria-label'),'Site tercihleri');assert.match(await p.locator('#demo-unit-info > p').textContent(),/kurgusal birimler/);
await p.selectOption('#resonance-language','en');assert.deepEqual(errors,[]);
console.log('PASS site bar on seven pages, home link, release, favicon, unit info toggle, TR labels, 320px width, WebP pass preview and academy size guard.');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
