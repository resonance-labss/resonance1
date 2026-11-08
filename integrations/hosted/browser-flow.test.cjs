const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../output/vercel-site/public');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.setHeader('Content-Type',{'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.json':'application/json'}[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  let limited=true;
  await page.route('**/api/ai/plan',route=>route.fulfill({status:limited?429:200,contentType:'application/json',body:JSON.stringify(limited?{code:'shared_limit',executed:false}:{executed:false,plan:{action:'buy',asset:'DEMO',budgetMinor:1500,limitMinor:800,expirySteps:5,explanation:'Buy DEMO only when the price is at most 8 Demo RLO.'}})}));
  await page.route('**/api/latch/check',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({decision:'allow',amountMinor:1500,executed:false})}));
  await page.goto(process.env.RESONANCE_TEST_URL || `http://127.0.0.1:${server.address().port}/vault/index.html`);
  await page.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;document.getElementById('workspace').hidden=false;});
  await page.locator('[data-entry=ai]').evaluate(e=>{for(let d=e.closest('details');d;d=d.parentElement.closest('details'))d.open=true;});
  await page.locator('[data-entry=ai]').click();
  await page.locator('#ai-intent').fill('Spend 15 Demo RLO at price 8, expiry 5 steps.');
  await page.locator('#ai-draft').click();await page.getByText('The shared free request limit has been reached.',{exact:false}).waitFor();
  assert(await page.locator('#ai-proposal').isHidden());
  limited=false;await page.locator('#ai-draft').click();await page.locator('#ai-apply').waitFor({state:'visible'});
  assert.equal(await page.locator('#reserved').textContent(),'0.00');
  await page.locator('#ai-apply').click();assert.equal(await page.locator('#budget').inputValue(),'15');
  assert.equal(await page.locator('#reserved').textContent(),'0.00');
  await page.locator('#latch-check').click();await page.locator('#latch-next').waitFor({state:'visible'});
  assert.equal(await page.locator('#reserved').textContent(),'0.00');
  await page.locator('#expiry').fill('6');assert(await page.locator('#latch-next').isHidden());
  await page.locator('#latch-check').click();await page.locator('#latch-next').waitFor({state:'visible'});
  await page.locator('#latch-next').click();await page.locator('#confirm').waitFor({state:'visible'});
  assert.equal(await page.locator('#reserved').textContent(),'0.00');
  await page.locator('#confirm').click();assert.equal(await page.locator('#reserved').textContent(),'15.00');
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);console.log('PASS hosted UI: quota fallback, draft/apply/check do not reserve, edits invalidate check, explicit confirmation, mobile. Providers and NFT access mocked.');
 } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1)});
