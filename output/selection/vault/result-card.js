/* One-sentence result headline and a downloadable PNG card. Reads finished results only; never changes balances, approvals or saved plans. */
(()=>{'use strict';
const themes=[{name:'Diren',tool:'Reactive Vault',accent:'#b6dfcc',image:'diren.jpg'},{name:'Ece',tool:'Reserve Studio',accent:'#e5a9ab',image:'ece.jpg'},{name:'Denis',tool:'Web3 Budget Studio',accent:'#9fd4c6',image:'denis.jpg'},{name:'Ade',tool:'Plan Lab',accent:'#dbb579',image:'ade.jpg'}];
const theme=themes[Number(document.body.dataset.vaultCharacter)]||themes[0];
// Card text follows the visible language and demo unit, exactly like the page.
const say=text=>{const translated=window.ResonanceI18n?window.ResonanceI18n.t(text):text;return window.ResonanceUnit?window.ResonanceUnit.text(translated):translated;};
let box=null,current=null;
function build(){
 box=document.createElement('section');box.id='result-headline';box.className='result-headline';box.dataset.character=theme.name.toLowerCase();
 box.innerHTML='<div class="result-headline-eyebrow">Result in one sentence</div><p id="result-sentence"></p><div class="result-headline-actions"><button type="button" id="result-card-download" class="secondary">Download result card</button><span id="result-card-status" role="status"></span></div>';
 box.querySelector('button').onclick=()=>download().catch(()=>{box.querySelector('#result-card-status').textContent='The card could not be created in this browser.';});
}
function show(container,data){
 if(!box)build();current=data;box.querySelector('#result-sentence').textContent=data.headline;box.querySelector('#result-card-status').textContent='';
 // Sit directly under the result heading, so the sentence is the first thing read.
 const heading=container.querySelector(':scope > h2');if(box.parentElement!==container||(heading?box.previousElementSibling!==heading:container.firstElementChild!==box)){if(heading)heading.after(box);else container.prepend(box);}box.hidden=false;
}
function hide(){current=null;if(box)box.hidden=true;}
function load(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});}
function lines(ctx,text,width){const words=text.split(/\s+/),out=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){out.push(line);line=word;}else line=next;}if(line)out.push(line);return out;}
function draw(canvas,data,img){
 const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,accent=theme.accent;
 const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0c161e');bg.addColorStop(1,'#16242e');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 const text=img?720:W-120;
 if(img){const area={x:760,w:W-760},scale=Math.max(area.w/img.width,H/img.height),w=img.width*scale,h=img.height*scale;ctx.save();ctx.beginPath();ctx.rect(area.x,0,area.w,H);ctx.clip();ctx.drawImage(img,area.x+(area.w-w)/2,0,w,h);ctx.restore();
  const fade=ctx.createLinearGradient(area.x,0,area.x+220,0);fade.addColorStop(0,'#111e27');fade.addColorStop(1,'#111e2700');ctx.fillStyle=fade;ctx.fillRect(area.x,0,220,H);}
 ctx.fillStyle=accent;ctx.fillRect(0,0,10,H);
 ctx.fillStyle='#eee9de';ctx.font='600 20px system-ui,sans-serif';ctx.textBaseline='top';ctx.fillText('R E S O N A N C E',60,48);
 ctx.fillStyle=accent;ctx.font='600 22px system-ui,sans-serif';ctx.fillText((theme.name+' · '+say(theme.tool)).toUpperCase(),60,96);
 ctx.fillStyle='#f4efe4';let size=46;ctx.font=size+'px Georgia,serif';let wrapped=lines(ctx,data.headline,text);
 while(wrapped.length>5&&size>30){size-=4;ctx.font=size+'px Georgia,serif';wrapped=lines(ctx,data.headline,text);}
 wrapped.slice(0,6).forEach((line,i)=>ctx.fillText(line,60,150+i*size*1.22));
 const facts=data.facts.slice(0,4),tile=(text-(facts.length-1)*16)/Math.max(1,facts.length);
 facts.forEach(([label,value],i)=>{const x=60+i*(tile+16),y=H-200;ctx.fillStyle='#ffffff10';ctx.fillRect(x,y,tile,96);ctx.fillStyle=accent;ctx.fillRect(x,y,3,96);ctx.fillStyle='#a9bcc2';ctx.font='15px system-ui,sans-serif';ctx.fillText(lines(ctx,say(label),tile-28)[0]||'',x+16,y+16);ctx.fillStyle='#f4efe4';ctx.font='600 28px system-ui,sans-serif';ctx.fillText(say(value),x+16,y+46);});
 ctx.fillStyle='#93a8ae';ctx.font='15px system-ui,sans-serif';ctx.fillText(say('Fictional demo units · Not financial advice · No real funds moved')+' · '+new Date().toISOString().slice(0,10),60,H-62);
}
function blob(canvas){return new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('empty')),'image/png');}catch(e){reject(e);}});}
async function download(){
 if(!current)return;const data={...current,headline:say(current.headline)},sheet=()=>Object.assign(document.createElement('canvas'),{width:1200,height:630});
 let img=null;try{img=await load(new URL('../'+theme.image,location.href).href);}catch{}
 let canvas=sheet(),file;draw(canvas,data,img);
 // A portrait read from file:// taints the canvas for good; fall back to a fresh, text-only card instead of failing.
 try{file=await blob(canvas);}catch{canvas=sheet();draw(canvas,data,null);file=await blob(canvas);}
 const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download='resonance-'+theme.name.toLowerCase()+'-result.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 box.querySelector('#result-card-status').textContent='Result card downloaded.';
}
window.ResonanceResultCard={show,hide,current:()=>current};
})();
