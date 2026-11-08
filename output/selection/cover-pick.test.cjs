// Home cover: the four characters are the way in. Pointing or focusing lights one character's shape and dims the
// rest, a click or tap opens that character's tool, the first view lights each character once, and reduced motion
// keeps it still. Also checks the glass menus and the portraits on all four tool pages. Runs on the public build.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),http=require('node:http'),fsp=require('node:fs/promises'),path=require('node:path');
const PUB=path.resolve(__dirname,'../vercel-site/public');
const TYPES={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
(async()=>{
 const server=http.createServer(async(req,res)=>{try{const url=decodeURIComponent(req.url.split(/[?#]/)[0]);const file=path.join(PUB,url.endsWith('/')?url+'index.html':url);res.setHeader('Content-Type',TYPES[path.extname(file)]||'text/html');res.end(await fsp.readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const b=await chromium.launch({channel:'chrome',headless:true});
 const open=async(opts={})=>{const ctx=await b.newContext({viewport:{width:1440,height:900},...opts});const p=await ctx.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.goto(base+'/');return p;};
 const active=p=>p.evaluate(()=>document.querySelector('.entry-pick').dataset.active||'');
 try{
  {const p=await open();
   // The first view lights each character once, left to right.
   const seen=new Set();for(let i=0;i<40&&seen.size<4;i++){const a=await active(p);if(a)seen.add(a);await p.waitForTimeout(100);}
   assert.deepEqual([...seen],['diren','ece','ade','denis'],'intro lights each character in order');
   const art=await p.locator('.entry-art').boundingBox();
   for(const [who,fx] of [['diren',.14],['ece',.38],['ade',.61],['denis',.86]]){await p.mouse.move(art.x+art.width*fx,art.y+art.height*.45);await p.waitForTimeout(80);
    assert.equal(await active(p),who,'pointing at '+who);assert(await p.locator('.entry-pick a[data-who='+who+']').evaluate(a=>a.classList.contains('on')));
    assert.match(await p.locator('.entry-pick').evaluate(e=>e.style.getPropertyValue('--mask')),new RegExp('pick-'+who+'\\.webp'));}
   await p.waitForTimeout(400);assert.equal(await p.locator('.pick-dim').evaluate(e=>getComputedStyle(e).opacity),'1','the others are dimmed');
   await p.mouse.move(art.x+art.width*.5,art.y+art.height+60);await p.waitForTimeout(80);assert.equal(await active(p),'','leaving the cover clears it');
   // Every mask file loads.
   for(const who of ['diren','ece','ade','denis'])for(const f of ['pick-'+who+'.webp','pick-'+who+'-rim.webp'])assert.equal((await p.request.get(base+'/hero/'+f)).status(),200,f);
   // Routing by this browser's progress: unfinished lessons lead to the academy with the character selected.
   assert.deepEqual(await p.evaluate(()=>[...document.querySelectorAll('.entry-pick a')].map(a=>a.getAttribute('href')+'|'+a.querySelector('small').textContent)),
    ['/resonance-playable-v1.html?character=0|Start the lesson','/resonance-playable-v1.html?character=1|Start the lesson','/resonance-playable-v1.html?character=3|Start the lesson','/resonance-playable-v1.html?character=2|Start the lesson']);
   // Keyboard: focus lights the character; Enter follows its link.
   await p.locator('.entry-pick a[data-who=ade]').focus();assert.equal(await active(p),'ade');
   await Promise.all([p.waitForURL(/\/resonance-playable-v1\.html\?character=3$/),p.keyboard.press('Enter')]);await p.waitForTimeout(400);
   assert.equal(await p.evaluate(()=>[...document.querySelectorAll('.rs-person')].map(b=>b.getAttribute('aria-pressed')).join()),'false,false,false,true','the academy opens with Ade selected');
   assert.equal(await p.inputValue('#rs-input'),'Ade');assert.equal(await p.evaluate(()=>document.activeElement.id),'rs-start','Continue is ready');
   // A finished lesson (same rule as the academy: current quiz version and 4/4) opens the tool directly.
   await p.evaluate(()=>localStorage.setItem('resonance.learning-passes.v1',JSON.stringify({1:{quizVersion:3,correctAnswers:4},2:{quizVersion:0,correctAnswers:4}})));
   await p.goto(base+'/');await p.waitForTimeout(300);
   assert.equal(await p.locator('.entry-pick a[data-who=ece]').getAttribute('href'),'/vault/protection.html');assert.equal(await p.locator('.entry-pick a[data-who=ece] small').textContent(),'Reserve Studio');
   assert.equal(await p.locator('.entry-pick a[data-who=denis]').getAttribute('href'),'/resonance-playable-v1.html?character=2','an outdated quiz still leads to the lesson');
   await Promise.all([p.waitForURL(/\/vault\/protection\.html$/),p.mouse.click(art.x+art.width*.38,art.y+art.height*.4)]);
   assert.deepEqual(p.errors,[]);await p.context().close();}
  // Touch: a tap follows the link directly; the names stay visible.
  {const p=await open({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.waitForTimeout(300);
   assert.equal(await p.locator('.entry-pick a[data-who=denis] .pick-tag').evaluate(e=>getComputedStyle(e).opacity),'0.92','names visible on touch screens');
   const art=await p.locator('.entry-art').boundingBox();await Promise.all([p.waitForURL(/\/resonance-playable-v1\.html\?character=2$/),p.tap('.entry-pick a[data-who=denis]',{position:{x:20,y:art.height*.4}})]);
   await p.context().close();}
  // Reduced motion: no intro sequence, no sweep; pointing still works.
  {const p=await open({reducedMotion:'reduce'});await p.waitForTimeout(1600);assert.equal(await active(p),'','no intro under reduced motion');
   const art=await p.locator('.entry-art').boundingBox();await p.mouse.move(art.x+art.width*.61,art.y+art.height*.4);await p.waitForTimeout(60);assert.equal(await active(p),'ade');
   assert.equal(await p.locator('.pick-sweep').evaluate(e=>getComputedStyle(e).display),'none');await p.context().close();}
  // Glass menus: on wide screens the bar and the menu float over the cover; both are see-through.
  {const p=await open();await p.waitForTimeout(300);
   const r=await p.evaluate(()=>{const bar=document.getElementById('site-bar'),nav=document.querySelector('body>nav'),cover=document.querySelector('.entry');const alpha=e=>{const m=getComputedStyle(e).backgroundImage.match(/rgba\([^)]*,\s*([\d.]+)\)/g)||[];return Math.max(...m.map(x=>Number(x.match(/([\d.]+)\)$/)[1])));};
    return {bar:getComputedStyle(bar).position,nav:getComputedStyle(nav).position,coverTop:Math.round(cover.getBoundingClientRect().top),barAlpha:alpha(bar),navAlpha:alpha(nav),blur:getComputedStyle(bar).backdropFilter};});
   assert.equal(r.bar,'absolute');assert.equal(r.nav,'absolute');assert.equal(r.coverTop,0,'the art starts at the top');assert(r.barAlpha<=.5&&r.navAlpha<=.5,'see-through: '+r.barAlpha+' / '+r.navAlpha);assert.match(r.blur,/blur/);
   await p.context().close();}
  // Every tool page shows its character's portrait.
  for(const [url,img] of [['/vault/index.html','diren.jpg'],['/vault/protection.html','ece.jpg'],['/vault/eric.html','denis.jpg'],['/vault/ade.html','ade.jpg']]){const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();await p.goto(base+url);
   const src=await p.locator('main .hero figure img').getAttribute('src');assert(src.endsWith(img),url+' shows '+img);await p.waitForFunction(()=>{const i=document.querySelector('main .hero figure img');return i.complete&&i.naturalWidth>0;});
   assert((await p.locator('main .hero figure').boundingBox()).height>150);await ctx.close();}
  console.log('PASS cover pick: intro lights the four characters, pointer/keyboard light one and dim the rest, unfinished lessons open the academy with that character selected, finished ones open the tool (click/Enter/tap), reduced motion; glass menus over the cover; portraits on all four tool pages.');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
