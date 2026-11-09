const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{const page=await browser.newPage({viewport:{width:1365,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const route of ['index','protection','ade','eric']){
 await page.goto('file://'+__dirname+'/'+route+'.html');await page.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;document.getElementById('workspace').hidden=false;});
 assert.equal(await page.locator('.workspace-shortcuts button').count(),3);if(route==='ade'||route==='eric'){assert.equal(await page.locator('#practice-guide details').getAttribute('open'),null);}
 await page.locator('.workspace-shortcuts button').nth(2).click();assert(await page.locator(route==='index'?'#diren-extra':'#tool-extra').evaluate(e=>e.open));
 await page.locator('.workspace-shortcuts button').first().click();assert.equal(await page.evaluate(()=>document.activeElement.id),route==='index'?'diren-plan':'tool-plan');
 if(route==='eric'){assert.equal(await page.locator('#tool-plan #example-note').count(),1);assert.equal(await page.locator('#tool-result #reference-status').count(),1);}
 if(route==='ade'||route==='eric'){
  await page.evaluate(()=>window.resonanceVaultAuthorize=()=>new Promise(resolve=>window.finishCheck=resolve));
  const submit=page.locator(route==='ade'?'#ade-form button[type=submit]':'#budget-form button[type=submit]');await submit.click();assert(await submit.isDisabled());assert(await page.locator('#workspace-status').isVisible());await page.evaluate(()=>window.finishCheck(true));await page.waitForFunction(()=>document.querySelector('#ade-results,#results')?.hidden===false);assert(await submit.isEnabled());
 }
 await page.locator('.workspace-shortcuts button').nth(1).click();assert.equal(await page.evaluate(()=>document.activeElement.id),route==='index'?'diren-result':'tool-result');
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('resonance:wallet-check-paused',{detail:'Temporary access failure'})));assert(await page.locator('#workspace-status').isVisible());await page.evaluate(()=>window.dispatchEvent(new Event('resonance:wallet-verified')));assert(await page.locator('#workspace-status').isHidden());await page.screenshot({path:'/tmp/polish-'+route+'-desktop.png'});
 await page.selectOption('#resonance-language','tr');await page.waitForFunction(()=>document.documentElement.lang==='tr');assert.equal(await page.locator('.workspace-shortcuts button').first().textContent(),'Kurallar ve bütçe');
 for(const width of [390,320]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' overflow at '+width);await page.locator('.workspace-shortcuts button').first().click();assert.equal(await page.evaluate(()=>document.activeElement.id),route==='index'?'diren-plan':'tool-plan');}
 await page.screenshot({path:'/tmp/polish-'+route+'-mobile.png'});await page.setViewportSize({width:1365,height:900});await page.selectOption('#resonance-language','en');
}
assert.deepEqual(errors,[]);console.log('PASS workspace keyboard shortcuts, advanced access, Denis control placement, pending access feedback, TR labels and 320/390px mobile widths. Wallet mocked.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
