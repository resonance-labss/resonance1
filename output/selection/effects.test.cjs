const {chromium}=require('playwright'),assert=require('node:assert/strict');
// Vault effect layers: they ride on the tools' events and never change vault values or chart structure.
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const errors=[];const V='file://'+__dirname+'/vault/';
const page=async(opts={})=>{const p=await b.newPage(opts);p.on('pageerror',e=>errors.push(e.message));return p;};
// Vaults: budget token and purchase burst ride on the tool's events; values and chart structure stay exact.
const p=await page({viewport:{width:1360,height:900}});const open=async f=>{await p.goto(V+f);await p.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;document.getElementById('workspace').hidden=false;});};
await open('index.html');await p.click('#example-next');await p.click('#example-next');await p.click('#example-next');assert.equal(await p.locator('.vfx-token').count(),1);assert.equal(await p.locator('#reserved').textContent(),'20.00');
await p.waitForTimeout(1500);assert.equal(await p.locator('.vfx-token').count(),0,'token removes itself');await p.click('#example-next');assert.equal(await p.locator('#state').getAttribute('class'),'badge vfx-armed');await p.click('#example-next');
assert.equal(await p.locator('#owned').textContent(),'2.4875');assert.equal(await p.locator('.vfx-chip').textContent(),'+2.4875');
await open('ade.html');await p.click('#example-next');await p.click('#ade-form button[type=submit]');assert.equal(await p.locator('#ade-chart polyline').count(),2);assert.equal(await p.locator('#ade-chart polyline').nth(1).getAttribute('stroke-dasharray'),'8 5');
await open('eric.html');await p.click('#example-next');await p.click('#budget-form button[type=submit]');assert.equal(await p.locator('#proposal-summary').getAttribute('data-fx-tone'),'ok');
await p.evaluate(()=>{document.getElementById('workspace').hidden=true;});await p.waitForTimeout(50);assert.equal(await p.locator('.vfx-layer > *').count(),0);await p.close();
assert.deepEqual(errors,[]);console.log('PASS vault effects: budget token, purchase burst, armed badge, Ade dash kept, Denis tone, layer cleared when the workspace hides.');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
