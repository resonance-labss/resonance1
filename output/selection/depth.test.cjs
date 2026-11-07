// Motion and depth: the home cover/intro glide, no layout shift on load, the 3D pass (mint), the pass rack
// (My Resonance), reveal on scroll, the vault emblems and consistent site-bar tools. Runs on the public build.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const ROOT=path.resolve(__dirname,'../vercel-site/public');
const TYPES={'.jpg':'image/jpeg','.webp':'image/webp','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json'};
const PAGES=['/','/resonance-playable-v1.html','/mint/index.html','/my/index.html','/vault/index.html','/vault/protection.html','/vault/eric.html','/vault/ade.html'];
(async()=>{
 const server=http.createServer(async(req,res)=>{try{const url=decodeURIComponent(req.url.split(/[?#]/)[0]);const file=path.join(ROOT,url.endsWith('/')?url+'index.html':url);res.setHeader('Content-Type',TYPES[path.extname(file)]||'text/html');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const b=await chromium.launch({channel:'chrome',headless:true});
 const open=async(url,opts={})=>{const ctx=await b.newContext({viewport:{width:1440,height:900},...opts});const p=await ctx.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.goto(base+url);return p;};
 const done=async p=>{assert.deepEqual(p.errors,[]);await p.context().close();};
 const y=p=>p.evaluate(()=>Math.round(scrollY)),introTop=p=>p.evaluate(()=>Math.round(document.getElementById('intro').getBoundingClientRect().top+scrollY));
 try{
  // Home glide: one gesture, eased, always lands on a screen.
  {const p=await open('/');await p.waitForTimeout(500);const t=await introTop(p);await p.mouse.move(700,500);
   await p.mouse.wheel(0,100);const samples=[];for(let i=0;i<16;i++){await p.waitForTimeout(50);samples.push(await y(p));}
   assert.equal(samples.at(-1),t,'wheel lands on the intro');assert(samples.some(v=>v>0&&v<t),'it glides through');for(let i=1;i<samples.length;i++)assert(samples[i]>=samples[i-1],'never moves back');
   assert.equal(await p.evaluate(()=>getComputedStyle(document.getElementById('intro')).getPropertyValue('--cover-p').trim()),'1.0000');
   await p.waitForTimeout(300);await p.mouse.wheel(0,-100);await p.waitForTimeout(1100);assert.equal(await y(p),0,'wheel up returns to the cover');
   await p.keyboard.press('PageDown');await p.waitForTimeout(1100);assert.equal(await y(p),t,'PageDown');
   await p.keyboard.press('PageUp');await p.waitForTimeout(1100);assert.equal(await y(p),0,'PageUp');
   await p.click('.entry-down');await p.waitForTimeout(1100);assert.equal(await y(p),t,'arrow link');
   await p.evaluate(v=>scrollTo({top:v,behavior:'instant'}),Math.round(t*.3));await p.waitForTimeout(1200);assert.equal(await y(p),0,'a stop near the cover settles on it');
   await p.evaluate(v=>scrollTo({top:v,behavior:'instant'}),Math.round(t*.7));await p.waitForTimeout(1200);assert.equal(await y(p),t,'a stop near the intro settles on it');
   await p.evaluate(v=>scrollTo({top:v+400,behavior:'instant'}),t);await p.waitForTimeout(400);assert.equal(await y(p),t+400,'below the intro scrolling is normal');
   await done(p);}
  {const p=await open('/',{reducedMotion:'reduce'});await p.waitForTimeout(400);const t=await introTop(p);await p.mouse.move(700,500);await p.mouse.wheel(0,100);await p.waitForTimeout(40);
   assert.equal(await y(p),t,'reduced motion jumps at once');assert.equal(await p.evaluate(()=>getComputedStyle(document.querySelector('.entry-art')).transform),'none');
   assert.equal(await p.locator('.reveal-wait').count(),0,'reduced motion hides nothing');await done(p);}
  {const p=await open('/',{viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.waitForTimeout(500);const t=await introTop(p);const cdp=await p.context().newCDPSession(p);
   const swipe=async(y0,y1)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:y0}]});for(let k=1;k<=6;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:y0+(y1-y0)*k/6}]});await p.waitForTimeout(16);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(1100);};
   await swipe(600,420);assert.equal(await y(p),t,'swipe up glides to the intro');await swipe(300,480);assert.equal(await y(p),0,'swipe down at the intro returns');await done(p);}

  // No layout shift while pages load (site bar, vault tabs and wide layout are in place from the first paint).
  for(const viewport of [{width:1440,height:900},{width:390,height:844}])for(const url of PAGES){const ctx=await b.newContext({viewport});const p=await ctx.newPage();
   await p.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
   await p.goto(base+url,{waitUntil:'load'});await p.waitForTimeout(1500);const cls=await p.evaluate(()=>window.__cls);assert(cls<.02,url+' at '+viewport.width+'px shifts by '+cls.toFixed(3));await ctx.close();}

  // Mint: the preview is a 3D pass that turns when another character is chosen; the site-bar tools keep their own look.
  {const p=await open('/mint/index.html?character=0');await p.waitForTimeout(500);
   assert.equal(await p.locator('.holo-stage > .holo > #preview').count(),1);assert.equal(await p.locator('.holo > .holo-edge[aria-hidden=true]').count(),4);
   await p.selectOption('#character','2');await p.waitForTimeout(80);assert(await p.locator('.holo.holo-turn').count(),'turns on change');assert.equal(await p.locator('.holo').getAttribute('data-tone'),'denis');
   const mintTool=await p.evaluate(()=>getComputedStyle(document.getElementById('site-tour')).backgroundColor);
   const v=await open('/vault/index.html');await v.waitForTimeout(400);assert.equal(await v.evaluate(()=>getComputedStyle(document.getElementById('site-tour')).backgroundColor),mintTool,'site-bar tools look the same on mint and vault pages');await done(v);
   await done(p);}

  // My Resonance: the pass rack follows the dashboard's own held/done flags.
  {const p=await open('/my/index.html');await p.waitForTimeout(500);assert.equal(await p.locator('.pass-rack[aria-hidden=true] .rack-card').count(),4);
   assert.equal(await p.evaluate(()=>[...document.querySelectorAll('.rack-card')].map(c=>c.dataset.state).join()),'locked,locked,locked,locked');
   await p.evaluate(()=>{const c=document.querySelectorAll('#characters .card');c[0].dataset.held='true';c[2].dataset.done='true';document.getElementById('characters').append(document.createElement('i'));});await p.waitForTimeout(50);
   assert.equal(await p.evaluate(()=>[...document.querySelectorAll('.rack-card')].map(c=>c.dataset.state).join()),'held,locked,done,locked');await done(p);}

  // Reveal: cards below the first screen wait, then rise in once they are scrolled to.
  {const p=await open('/');await p.waitForTimeout(500);const waiting=await p.locator('.reveal-wait').count();assert(waiting>=6,'cards below the first screen wait: '+waiting);
   const h=await p.evaluate(()=>document.documentElement.scrollHeight);for(let top=await introTop(p);top<h;top+=400){await p.evaluate(v=>scrollTo({top:v,behavior:'instant'}),top);for(let k=0;k<3;k++){await p.waitForTimeout(50);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'a rising card never widens the page');}}
   await p.waitForTimeout(1300);assert.equal(await p.locator('.reveal-wait').count(),0,'all revealed');assert.equal(await p.locator('.reveal-in').count(),0,'animation classes are cleaned up');await done(p);}

  // Vault emblems: one decorative canvas per tool, drawn, beside the title or over the portrait.
  for(const [url,kind] of [['/vault/index.html','emblem-side'],['/vault/protection.html','emblem-over'],['/vault/eric.html','emblem-side'],['/vault/ade.html','emblem-over']])for(const reducedMotion of ['no-preference','reduce']){
   const p=await open(url,{reducedMotion});await p.waitForTimeout(700);assert.equal(await p.locator('.emblem-3d[aria-hidden=true] canvas').count(),1,url);assert(await p.locator('.emblem-3d').evaluate((e,k)=>e.classList.contains(k),kind));
   assert(await p.locator('.emblem-3d canvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let lit=0;for(let i=3;i<d.length;i+=16)if(d[i])lit++;return lit>50;}),url+' draws ('+reducedMotion+')');
   assert.equal(await p.locator('nav.tool-navigation').count(),1,'one set of tool tabs');await done(p);}
  console.log('PASS depth: eased cover/intro glide (wheel, keys, arrow, scrollbar, touch, reduced motion), no load shift on 8 pages at 1440 and 390 px, 3D mint pass, pass rack, reveal, vault emblems, consistent site-bar tools.');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
