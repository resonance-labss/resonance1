// Denis: funded expenses are listed as Rialo time-triggered transfers, unfunded ones get no rule, in English and Turkish.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const BASE=process.env.RESONANCE_TEST_BASE||'file://'+__dirname+'/';
const unlock=p=>p.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;document.getElementById('workspace').hidden=false;});
const review=async(p,example)=>{await p.click('[data-example='+example+']');await p.click('#budget-form button[type=submit]');await p.waitForSelector('#results:not([hidden])');return p.locator('#rialo-schedule-list li').allTextContents();};
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await b.newPage(),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(BASE+'eric.html');await unlock(p);p.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith(BASE))requests.push(r.url());});
 assert(await p.locator('#rialo-schedule').isHidden(),'hidden until a proposal is reviewed');
 assert.deepEqual(await review(p,'normal'),['Day 1 of this period → transfer 600.00 Demo RLO to “Web3 service subscription”, once.','Day 5 of this period → transfer 300.00 Demo RLO to “RPC subscription”, once.']);
 assert.match(await p.locator('#rialo-schedule').textContent(),/Nothing is scheduled from this page/);
 const income=await review(p,'income');assert.equal(income[1],'“RPC subscription” is not funded in this proposal, so no rule is written.');
 assert.equal(await p.locator('#rialo-schedule-list li.missing').count(),1);
 await p.locator('#bills [data-key=day]').first().fill('20');assert(await p.locator('#rialo-schedule').isHidden(),'editing hides the old rules');
 await p.click('#budget-form button[type=submit]');await p.waitForSelector('#results:not([hidden])');
 assert.match((await p.locator('#rialo-schedule-list li').allTextContents()).join('|'),/^“RPC subscription” is not funded.+\|Day 20 of this period → transfer 600\.00/,'sorted by due day');
 assert.deepEqual(requests,[]);
 await p.evaluate(()=>localStorage.setItem('resonance.language.v1','tr'));await p.reload();await unlock(p);await review(p,'income');
 await p.waitForFunction(()=>/Dönemin 1\. günü → “Web3 hizmet aboneliği” için 600\.00 Demo RLO aktar, bir kez\./.test(document.getElementById('rialo-schedule').textContent));
 const text=await p.locator('#rialo-schedule').textContent();assert.match(text,/“RPC aboneliği” bu öneride karşılanmadığı için kural yazılmaz\./);
 for(const english of ['As Rialo','native timers','of this period','not funded'])assert(!text.includes(english),'English left: '+english);
 await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);await p.close();
 console.log('PASS Denis Rialo schedule: funded expenses as time-triggered transfers, unfunded without rules, sorted by due day, hidden after edits, Turkish, no network, mobile. NFT mocked.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
