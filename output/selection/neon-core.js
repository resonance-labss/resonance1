/* 3D neon core for the home intro: a wireframe crystal with an inner core, two orbit rings and the four characters'
   colours circling it. Plain canvas 2D with a small perspective projection; no library. Decorative (aria-hidden).
   It draws only while visible, follows the pointer gently, and shows one still frame under reduced motion. */
(()=>{'use strict';
const host=document.querySelector('.core');if(!host)return;
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
canvas.setAttribute('aria-hidden','true');host.prepend(canvas);host.classList.add('has-3d');
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),CAST=['#35dcff','#ff4fa3','#aa82ff','#ff8a4c'];
const P=(1+Math.sqrt(5))/2,ico=[[-1,P,0],[1,P,0],[-1,-P,0],[1,-P,0],[0,-1,P],[0,1,P],[0,-1,-P],[0,1,-P],[P,0,-1],[P,0,1],[-P,0,-1],[-P,0,1]].map(v=>v.map(c=>c/Math.hypot(1,P)));
const edgesOf=(pts,len)=>{const e=[];for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)if(Math.abs(Math.hypot(...pts[i].map((c,k)=>c-pts[j][k]))-len)<.01)e.push([i,j]);return e;};
const icoEdges=edgesOf(ico,ico[0].map((c,k)=>c-ico[1][k]).reduce((s,c)=>s+c*c,0)**.5);
const octa=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],octaEdges=edgesOf(octa,Math.SQRT2);
const stars=Array.from({length:46},(_,i)=>{const t=Math.acos(1-2*(i+.5)/46),f=Math.PI*(1+Math.sqrt(5))*i;return [Math.sin(t)*Math.cos(f),Math.cos(t),Math.sin(t)*Math.sin(f)];});
let w=0,h=0,dpr=1,spin=0,tiltX=0,tiltY=0,aimX=0,aimY=0,last=0,frame=0,visible=true;
function size(){dpr=Math.min(2,devicePixelRatio||1);w=host.clientWidth;h=host.clientHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);if(reduce.matches)draw(0);}
function rotate([x,y,z],ay,ax,az=0){let c=Math.cos(az),s=Math.sin(az);[x,y]=[x*c-y*s,x*s+y*c];c=Math.cos(ay);s=Math.sin(ay);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(ax);s=Math.sin(ax);[y,z]=[y*c-z*s,y*s+z*c];return [x,y,z];}
function project([x,y,z],r,cx,cy){const k=3.2/(3.2+z);return [cx+x*r*k,cy+y*r*k,z];}
function line(a,b,color,alpha,width){ctx.strokeStyle=color;ctx.globalAlpha=alpha*.16;ctx.lineWidth=width*4*dpr;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.globalAlpha=alpha;ctx.lineWidth=width*dpr;ctx.stroke();}
function dot(p,color,radius,alpha){ctx.fillStyle=color;ctx.globalAlpha=alpha*.25;ctx.beginPath();ctx.arc(p[0],p[1],radius*3*dpr,0,7);ctx.fill();ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(p[0],p[1],radius*dpr,0,7);ctx.fill();}
const depth=z=>.35+.65*(1-(z+1)/2);
function ring(r,cx,cy,tilt,color,phase){let prev=null;for(let i=0;i<=72;i++){const a=i/72*Math.PI*2,p=project(rotate([Math.cos(a)*1.55,0,Math.sin(a)*1.55],spin*.3+phase,tiltX+tilt,.35),r,cx,cy);if(prev&&i%2)line(prev,p,color,depth(p[2]/1.55)*.75,1);prev=p;}}
function draw(t){const cx=w*dpr/2,cy=h*dpr*.46,r=Math.min(w,h)*dpr*.27;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 // Platform: three flat ellipses under the crystal.
 for(let i=0;i<3;i++){ctx.globalAlpha=.22-i*.05;ctx.strokeStyle=i===1?'#a679ff':'#33e3ff';ctx.lineWidth=dpr;ctx.beginPath();ctx.ellipse(cx,cy+r*1.55,r*(1.2+i*.42),r*(.26+i*.09),0,0,7);ctx.stroke();}
 for(const s of stars){const p=project(rotate(s.map(c=>c*1.9),spin*.15+tiltY,tiltX),r,cx,cy);dot(p,'#a4f3ff',.8,(.25+.35*Math.sin(t/700+s[0]*9))*depth(p[2]/1.9));}
 ring(r,cx,cy,.42,'#a679ff',0);ring(r,cx,cy,-.5,'#33e3ff',1.7);
 const outer=ico.map(v=>project(rotate(v,spin+tiltY,tiltX+.35),r,cx,cy));for(const [a,b] of icoEdges)line(outer[a],outer[b],'#33e3ff',depth((outer[a][2]+outer[b][2])/2),1.4);for(const p of outer)dot(p,'#d6fbff',1.4,depth(p[2]));
 const inner=octa.map(v=>project(rotate(v.map(c=>c*.5),-spin*1.6+tiltY,tiltX-.2),r,cx,cy));for(const [a,b] of octaEdges)line(inner[a],inner[b],'#ff4fa3',depth((inner[a][2]+inner[b][2])/.5/2)*.95,1.3);
 const core=ctx.createRadialGradient(cx,cy,0,cx,cy,r*.55);core.addColorStop(0,'rgba(255,79,163,.35)');core.addColorStop(1,'rgba(255,79,163,0)');ctx.globalAlpha=1;ctx.fillStyle=core;ctx.beginPath();ctx.arc(cx,cy,r*.55,0,7);ctx.fill();
 // The four characters' lights, with short trails, on the two rings.
 CAST.forEach((color,i)=>{const tilt=i%2?-.5:.42,phase=i%2?1.7:0;for(let k=6;k>=0;k--){const a=spin*.9+i*Math.PI/2-k*.06,p=project(rotate([Math.cos(a)*1.55,0,Math.sin(a)*1.55],spin*.3+phase,tiltX+tilt,.35),r,cx,cy);dot(p,color,k?1.6:3.2,(k?.18*(7-k)/7:1)*depth(p[2]/1.55));}});
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
function loop(t){frame=0;if(!visible||document.hidden)return;const dt=Math.min(50,t-(last||t));last=t;spin+=dt*.00035;tiltX+=(aimX-tiltX)*.05;tiltY+=(aimY-tiltY)*.05;draw(t);frame=requestAnimationFrame(loop);}
const start=()=>{if(!reduce.matches&&!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(loop);}};
const area=host.closest('section')||host;
area.addEventListener('pointermove',e=>{const b=host.getBoundingClientRect();aimY=Math.max(-1,Math.min(1,(e.clientX-b.left-b.width/2)/b.width))*.6;aimX=Math.max(-1,Math.min(1,(e.clientY-b.top-b.height/2)/b.height))*.4;});
area.addEventListener('pointerleave',()=>{aimX=aimY=0;});
new IntersectionObserver(([e])=>{visible=e.isIntersecting;start();}).observe(host);
document.addEventListener('visibilitychange',start);reduce.addEventListener?.('change',()=>{size();start();});
new ResizeObserver(size).observe(host);size();draw(0);start();
})();
