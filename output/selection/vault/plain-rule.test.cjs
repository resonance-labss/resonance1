// "Describe it in words": a sentence (English or Turkish) fills Diren's three rule fields in this browser only.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const BASE=process.env.RESONANCE_TEST_BASE||'file://'+__dirname+'/';
async function open(b,lang){const p=await b.newPage(),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(BASE+'index.html');if(lang){await p.evaluate(l=>localStorage.setItem('resonance.language.v1',l),lang);await p.reload();}
 await p.evaluate(()=>{window.resonanceVaultAuthorize=async()=>true;document.getElementById('workspace').hidden=false;document.getElementById('diren-extra').open=true;});
 p.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith(BASE))requests.push(r.url());});
 return {p,errors,requests};}
const values=p=>p.evaluate(()=>['limit','budget','expiry'].map(id=>document.getElementById(id).value));
const fill=async(p,text)=>{await p.fill('#plain-text',text);await p.click('#plain-fill');return p.locator('#plain-result').textContent();};
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 {const {p,errors,requests}=await open(b);
  assert(await p.locator('#plain-rule').isHidden());await p.click('[data-entry=words]');assert(await p.locator('#plain-rule').isVisible());
  assert.equal(await p.locator('[data-entry=words]').getAttribute('aria-pressed'),'true');assert(await p.locator('#scenario-guide').isHidden());
  let out=await fill(p,'Buy when the price is 6.5 or below, spend up to 40 RLO, stop after 7 steps.');
  assert.deepEqual(await values(p),['6.5','40','7']);assert.match(out,/Filled in the form below/);assert(await p.locator('#plain-rule').isVisible(),'result stays on screen');
  out=await fill(p,'price limit 9, budget 500 RLO, 50 steps');
  assert.deepEqual(await values(p),['9','40','7'],'out-of-range values keep the current ones');assert.match(out,/Budget must be between 1 and 100\. Kept: 40/);assert.match(out,/Expiry must be between 2 and 20 \(whole steps\)\. Kept: 7/);
  out=await fill(p,'4.5 steps');assert.deepEqual(await values(p),['9','40','7']);assert.match(out,/Expiry must be between 2 and 20 \(whole steps\)/);
  out=await fill(p,'hello there');assert.match(out,/No price, budget or step count found/);assert.deepEqual(await values(p),['9','40','7']);
  await p.evaluate(()=>document.getElementById('limit').disabled=true);out=await fill(p,'buy at 3 or below');
  assert.match(out,/Finish or cancel your current rule first/);assert.equal(await p.locator('#limit').inputValue(),'9');
  await p.evaluate(()=>document.getElementById('limit').disabled=false);await p.click('[data-entry=manual]');assert(await p.locator('#plain-rule').isHidden());
  assert.deepEqual(requests,[],'nothing is sent anywhere');assert.deepEqual(errors,[]);await p.close();}
 {const {p,errors}=await open(b,'tr');await p.click('[data-entry=words]');
  await p.waitForFunction(()=>document.querySelector('[data-entry=words]').textContent==='Kendi cümlelerinle anlat');assert.equal(await p.locator('#plain-rule h2').textContent(),'Kendi cümlelerinle söyle.');
  let out=await fill(p,'Fiyat 9 veya altındaysa al, bütçe 30 RLO, 12 adımdan sonra dur.');
  assert.deepEqual(await values(p),['9','30','12']);await p.waitForFunction(()=>/Aşağıdaki form dolduruldu/.test(document.getElementById('plain-result').textContent));
  out=await fill(p,'8 veya altında al, bütçe 500 RLO, 5 adım');await p.waitForFunction(()=>/Bütçe 1 ile 100 arasında olmalı\. Korunan:/.test(document.getElementById('plain-result').textContent));
  assert.deepEqual(await values(p),['8','30','5']);
  const text=await p.locator('#plain-rule').textContent();for(const english of ['Describe your rule','Your rule','Fill the form','not found','must be between'])assert(!text.includes(english),'English left: '+english);
  await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);await p.close();}
 console.log('PASS plain-sentence rule: English and Turkish sentences fill the form, out-of-range and fractional steps keep current values, locked form refuses, no network, mobile. NFT mocked.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
