// The Rialo symbol stays exactly as Rialo publishes it: same path data as the downloaded brand file, the same shape
// when drawn (canvas vs the SVG), the official colour, never turned far enough to be seen mirrored, and used where intended.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const REPO=path.resolve(__dirname,'../..'),PUB=path.resolve(__dirname,'../vercel-site/public');
const read=f=>fs.readFileSync(path.join(REPO,f),'utf8'),sha=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO,f))).digest('hex');
const pathOf=svg=>svg.match(/<path d="([^"]+)"/)[1];
(async()=>{
 // 1. Path data: official download = shipped SVG = drawing module, character for character; files match their recorded hashes.
 const source=read('assets/brand/rialo/SOURCE.md');
 for(const f of ['rialo-symbol-on-cream.svg','rialo-symbol-on-dark.svg'])assert(source.includes(sha('assets/brand/rialo/'+f)),f+' changed since download');
 const official=pathOf(read('assets/brand/rialo/rialo-symbol-on-cream.svg')),shipped=read('output/selection/brand/rialo-symbol.svg');
 assert.equal(pathOf(shipped),official,'brand/rialo-symbol.svg path');assert.match(shipped,/fill="#BBEBE1"/);
 const module=read('output/selection/rialo-mark.js');assert(module.includes("const D='"+official+"';"),'rialo-mark.js path');
 assert.match(read('assets/brand/rialo/rialo-symbol-on-dark.svg'),/fill="#BBEBE1"/,'the colour comes from the official dark variant');

 const TYPES={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2'};
 const server=http.createServer(async(req,res)=>{try{const url=decodeURIComponent(req.url.split(/[?#]/)[0]);const file=path.join(PUB,url.endsWith('/')?url+'index.html':url);res.setHeader('Content-Type',TYPES[path.extname(file)]||'text/html');res.end(await fsp.readFile(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const b=await chromium.launch({channel:'chrome',headless:true});
 try{
  // 2. Drawn at rest, the canvas symbol covers the same pixels as the official SVG, in the official colour; turns are capped.
  const p=await b.newPage();await p.goto(base+'/404.html');
  await p.setContent('<body style="margin:0;background:#000"><script src="'+base+'/rialo-mark.js"></script></body>');
  const r=await p.evaluate(async src=>{const H=424,W=Math.round(H*96.8036/106),pad=20;
   const img=new Image();img.src=src;await img.decode();
   const mk=()=>{const c=document.createElement('canvas');c.width=W+pad*2;c.height=H+pad*2;return c;};
   const a=mk(),ca=a.getContext('2d');ca.drawImage(img,pad,pad,W,H);
   const m=window.ResonanceRialoMark,bb=mk(),cb=bb.getContext('2d');m.draw(cb,pad+W/2,pad+H/2,H,0,{glow:0});
   const da=ca.getImageData(0,0,a.width,a.height).data,db=cb.getImageData(0,0,a.width,a.height).data;let both=0,either=0,colour=0,solid=0;
   for(let i=3;i<da.length;i+=4){const A=da[i]>127,B=db[i]>127;if(A&&B)both++;if(A||B)either++;if(db[i]===255){solid++;if(db[i-3]===187&&db[i-2]===235&&db[i-1]===225)colour++;}}
   const turned=(y)=>{const c=mk(),x=c.getContext('2d');m.draw(x,pad+W/2,pad+H/2,H,y,{glow:0});return c.toDataURL();};
   return {iou:both/either,colour:colour/solid,cap:turned(3)===turned(m.maxYaw)&&turned(-3)===turned(-m.maxYaw),maxYaw:m.maxYaw};},base+'/brand/rialo-symbol.svg');
  assert(r.iou>.995,'canvas and SVG shapes match: IoU '+r.iou.toFixed(4));assert(r.colour>.99,'front face is #BBEBE1');
  assert(r.cap,'turns beyond the limit are clamped');assert(r.maxYaw<Math.PI/2*.5,'never turned far enough to show its back');
  await p.close();
  // 3. Where it is used: the home core, Denis's clock, and beside links to Rialo's sites (decorative, official file).
  for(const [url,sel] of [['/','.core[data-mark=rialo]'],['/vault/eric.html','.emblem-3d[data-mark=rialo]']]){const q=await b.newPage({viewport:{width:1440,height:900}});const errors=[];q.on('pageerror',e=>errors.push(e.message));await q.goto(base+url);await q.waitForTimeout(500);assert.equal(await q.locator(sel).count(),1,url);
   const marks=q.locator('a[href*="rialo.io"] img.rialo-mark');const links=await q.locator('a[href*="rialo.io"]').count();assert.equal(await marks.count(),links,url+': every Rialo link has the symbol');
   if(links){assert.equal(await marks.first().getAttribute('alt'),'');assert.equal(await marks.first().getAttribute('aria-hidden'),'true');assert.match(await marks.first().getAttribute('src'),/\/brand\/rialo-symbol\.svg$/);
    const box=await marks.first().boundingBox();assert(Math.abs(box.width/box.height-96.8036/106)<.02,'icon keeps its proportions');}
   assert.deepEqual(errors,[]);await q.close();}
  // All four tool emblems: over a portrait the symbol has its own canvas, with no blending and full opacity up to the figure.
  for(const url of ['/vault/index.html','/vault/protection.html','/vault/eric.html','/vault/ade.html']){const q=await b.newPage({viewport:{width:1440,height:900}});await q.goto(base+url);await q.waitForTimeout(600);
   assert.equal(await q.locator('.emblem-3d[data-mark=rialo]').count(),1,url);
   const layer=await q.locator('main .hero figure > canvas.emblem-mark').evaluate(c=>{let e=c,clean=true;while(e&&e.tagName!=='FIGURE'){const cs=getComputedStyle(e);if(cs.mixBlendMode!=='normal'||cs.opacity!=='1'||cs.filter!=='none')clean=false;e=e.parentElement;}
    const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let mint=0;for(let i=0;i<d.length;i+=4)if(d[i+3]===255&&d[i]===187&&d[i+1]===235&&d[i+2]===225)mint++;return {clean,mint};});
   assert(layer.clean,url+': symbol layer is not blended');assert(layer.mint>40,url+': symbol drawn in #BBEBE1 ('+layer.mint+' px)');await q.close();}
  // Tab icon, wordmark, menu brand and site bar: the official files, unaltered.
  assert.equal(sha('output/selection/favicon.svg'),sha('assets/brand/rialo/rialo-symbol-on-dark.svg'),'favicon is the official dark icon');
  assert.equal(sha('output/selection/brand/rialo-wordmark.svg'),sha('assets/brand/rialo/rialo-wordmark-off-white.svg'),'wordmark is the official file');
  assert(source.includes(sha('assets/brand/rialo/rialo-wordmark-off-white.svg')),'wordmark recorded in SOURCE.md');
  {const q=await b.newPage({viewport:{width:1440,height:900}});await q.goto(base+'/');assert.match(await q.locator('body>nav .brand img.brand-mark').getAttribute('src'),/\/brand\/rialo-symbol\.svg$/);
   assert.match(await q.locator('.core b img.core-wordmark').getAttribute('src'),/\/brand\/rialo-wordmark\.svg$/);assert.equal(await q.locator('link[rel~=icon]').getAttribute('href'),'/favicon.svg');
   await q.goto(base+'/mint/index.html');await q.waitForTimeout(300);assert.match(await q.locator('#site-home img.rialo-mark').getAttribute('src'),/\/brand\/rialo-symbol\.svg$/);
   const box=await q.locator('#site-home img.rialo-mark').boundingBox();assert(Math.abs(box.width/box.height-96.8036/106)<.03,'site-bar symbol keeps its proportions');await q.close();}
  console.log('PASS Rialo symbol: official path unchanged in the SVG and the drawing module, canvas = SVG at rest (IoU '+r.iou.toFixed(4)+'), official colour, capped turn, used in the home core, all four tool emblems (own unblended layer), the tab icon, the wordmark, the menu, the site bar and beside Rialo links.');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
