/* 3D emblems for the four character tools, in the page hero. Plain canvas 2D with a small perspective projection;
   decorative (aria-hidden), no text, no effect on any calculation.
   Diren · a price crystal crosses a threshold plane and lights up below the line (value condition).
   Ece   · a shield dome turns incoming sparks away from the reserve at its centre (protection limits).
   Denis · a clock ring: each tick the hand passes sends a pulse to the centre (time-triggered transfers).
   Ade   · three rings for value, risk and time around one core; it flares when they line up (combined conditions).
   Draws only while visible and the tab is shown; one still frame under reduced motion. */
(()=>{'use strict';
const body=document.body;if(!body.classList.contains('workspace-page'))return;
const who=Number(body.dataset.vaultCharacter||0),hero=document.querySelector('main .hero');if(!hero)return;
const figure=hero.querySelector('figure');
const host=document.createElement('div');host.className='emblem-3d'+(figure?' emblem-over':' emblem-side');if(who===2&&window.ResonanceRialoMark)host.dataset.mark='rialo';host.setAttribute('aria-hidden','true');
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;host.append(canvas);
// With a portrait, the emblem is a hologram over it (Ece inside her shield, Ade inside his rings); otherwise it stands beside the title.
if(figure)figure.append(host);else hero.append(host);
function place(){if(figure)return;const side=Math.max(300,Math.min(420,hero.offsetHeight+120));host.style.width=host.style.height=side+'px';}
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const CYAN='#33e3ff',PINK='#ff4fa3',VIOLET='#aa82ff',ORANGE='#ff8a4c',ICE='#d6fbff';
let w=0,h=0,dpr=1,cx=0,cy=0,R=0,time=0,last=0,frame=0,visible=false,tiltX=0,tiltY=0,aimX=0,aimY=0;
function rot([x,y,z],ay,ax,az=0){let c=Math.cos(az),s=Math.sin(az);[x,y]=[x*c-y*s,x*s+y*c];c=Math.cos(ay);s=Math.sin(ay);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(ax);s=Math.sin(ax);[y,z]=[y*c-z*s,y*s+z*c];return [x,y,z];}
function proj([x,y,z]){const k=3.4/(3.4+z);return [cx+x*R*k,cy+y*R*k,z];}
const fade=z=>.3+.7*Math.min(1,Math.max(0,(1.6-z)/3.2));
function line(a,b,color,alpha,width=1){ctx.strokeStyle=color;ctx.globalAlpha=alpha*.16;ctx.lineWidth=width*4*dpr;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.globalAlpha=alpha;ctx.lineWidth=width*dpr;ctx.stroke();}
function dot(p,color,radius,alpha){ctx.fillStyle=color;ctx.globalAlpha=alpha*.22;ctx.beginPath();ctx.arc(p[0],p[1],radius*3*dpr,0,7);ctx.fill();ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(p[0],p[1],radius*dpr,0,7);ctx.fill();}
function glow(p,color,radius,alpha){const g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],radius);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1],radius,0,7);ctx.fill();}
// One loop = four strokes: glow and core, each for the nearer and the farther half (a cheap depth cue).
function loopPath(points,color,alpha,width,dashed=false){ctx.strokeStyle=color;for(const near of [true,false]){ctx.beginPath();let any=false;
 for(let i=1;i<points.length;i++){if(dashed&&!(i%2))continue;const a=points[i-1],b=points[i];if((a[2]+b[2]<0)!==near)continue;ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);any=true;}
 if(!any)continue;const k=alpha*(near?1:.45);ctx.globalAlpha=k*.16;ctx.lineWidth=width*4*dpr;ctx.stroke();ctx.globalAlpha=k;ctx.lineWidth=width*dpr;ctx.stroke();}}
const circle=(r,n,y=0)=>Array.from({length:n+1},(_,i)=>{const a=i/n*Math.PI*2;return [Math.cos(a)*r,y,Math.sin(a)*r];});
const view=(v,spin)=>proj(rot(v,spin+tiltY,.42+tiltX));

// Diren: threshold plane at y=.22; the crystal's centre moves between above and below it.
const octa=[[0,-1.25,0],[0,1.25,0],[.62,0,0],[-.62,0,0],[0,0,.62],[0,0,-.62]],octaEdges=[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[4,3],[3,5],[5,2]];
let pulse=0,wasBelow=false;
function diren(){const spin=time*.00025,plane=.22,y=Math.sin(time*.0011)*.78-.08,below=y+.2>plane;
 if(below&&!wasBelow)pulse=1;wasBelow=below;pulse=Math.max(0,pulse-.012);
 for(let i=-3;i<=3;i++){const k=i/3*1.15;loopPath([[k,plane,-1.15],[k,plane,1.15]].map(v=>view(v,spin)),CYAN,.32+(below?.25:0),1);loopPath([[-1.15,plane,k],[1.15,plane,k]].map(v=>view(v,spin)),CYAN,.32+(below?.25:0),1);}
 if(pulse>0)loopPath(circle(.4+(1-pulse)*1.4,48,plane).map(v=>view(v,spin)),PINK,pulse*.9,1.6);
 const crystalColor=below?PINK:CYAN,pts=octa.map(v=>view([v[0]*.45,v[1]*.45+y,v[2]*.45],spin*3));
 for(const [a,b] of octaEdges)line(pts[a],pts[b],crystalColor,fade((pts[a][2]+pts[b][2])/2),1.5);
 const centre=view([0,y,0],spin);glow(centre,below?'rgba(255,79,163,.55)':'rgba(51,227,255,.4)',R*(below?.55:.38),1);
 for(let k=1;k<=14;k++){const yy=Math.sin((time-k*70)*.0011)*.78-.08;dot(view([0,yy,0],spin),below?PINK:ICE,.9,(1-k/15)*.35);}}

// Ece: a shield dome over a small reserve core; sparks fly in and bounce off the dome.
const sparks=Array.from({length:12},(_,i)=>({p:[0,0,0],v:[0,0,0],flash:0,hit:[0,0,0],seed:i}));
function respawn(s){const a=Math.random()*Math.PI*2,e=-.15-Math.random()*1.1,d=2.6;s.p=[Math.cos(a)*Math.cos(e)*d,Math.sin(e)*d*.9,Math.sin(a)*Math.cos(e)*d];const n=Math.hypot(...s.p),sp=.0011+Math.random()*.0007;s.v=s.p.map(c=>-c/n*sp);}
sparks.forEach(respawn);
function ece(dt){const spin=time*.0002;
 for(let lat=0;lat<5;lat++){const phi=lat/5*Math.PI/2,r=Math.cos(phi)*1.15,y=-Math.sin(phi)*1.15+.35;loopPath(circle(r,32,y).map(v=>view(v,spin)),PINK,.5,1);}
 for(let m=0;m<12;m++){const a=m/12*Math.PI*2,arc=Array.from({length:13},(_,i)=>{const phi=i/12*Math.PI/2;return [Math.cos(phi)*1.15*Math.cos(a),-Math.sin(phi)*1.15+.35,Math.cos(phi)*1.15*Math.sin(a)];});loopPath(arc.map(v=>view(v,spin)),PINK,.32,1);}
 loopPath(circle(1.5,48,.35).map(v=>view(v,spin)),CYAN,.35,1,true);
 const core=view([0,.15,0],spin);glow(core,'rgba(51,227,255,.5)',R*.32,1);dot(core,ICE,2.6,1);
 for(const s of sparks){for(let k=0;k<3;k++)s.p=s.p.map((c,i)=>c+s.v[i]*dt/3);
  const q=[s.p[0],s.p[1]-.35,s.p[2]],d=Math.hypot(...q),inward=q[0]*s.v[0]+q[1]*s.v[1]+q[2]*s.v[2]<0;
  if(d<1.18&&inward&&q[1]<.05){const n=q.map(c=>c/d),dv=2*(s.v[0]*n[0]+s.v[1]*n[1]+s.v[2]*n[2]);s.v=s.v.map((c,i)=>c-dv*n[i]);s.flash=1;s.hit=s.p.slice();}
  if(d>2.8&&!inward)respawn(s);s.flash=Math.max(0,s.flash-.02);
  dot(view(s.p,spin),ICE,1.4,.85);if(s.flash>0){const hp=view(s.hit,spin);glow(hp,'rgba(255,79,163,.8)',R*.22*s.flash+2,s.flash);}}}

// Denis: a tilted clock ring with twelve ticks; the hand lights each tick and sends a pulse to the centre.
const pulses=[];let lastTick=-1;
function denis(){const spin=Math.sin(time*.0003)*.35,hand=time*.0009,tick=Math.floor(hand/(Math.PI/6))%12;
 if(tick!==lastTick){if(lastTick>=0)pulses.push({a:tick*Math.PI/6,t:0});lastTick=tick;}
 const ring=v=>proj(rot(v,spin+tiltY,.95+tiltX));
 loopPath(circle(1.3,72).map(ring),VIOLET,.75,1.4);loopPath(circle(.62,48).map(v=>ring(rot(v,-time*.0005,0))),CYAN,.45,1,true);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,p=ring([Math.cos(a)*1.3,0,Math.sin(a)*1.3]),lit=i===tick;dot(p,lit?ICE:VIOLET,lit?3.2:1.6,fade(p[2]));line(ring([Math.cos(a)*1.18,0,Math.sin(a)*1.18]),p,VIOLET,.5*fade(p[2]),1);}
 const tip=ring([Math.cos(hand)*1.22,0,Math.sin(hand)*1.22]),centre=ring([0,0,0]);line(centre,tip,ICE,.9,1.8);
 for(const pu of pulses){pu.t+=.012;const k=1-pu.t;const p=ring([Math.cos(pu.a)*1.3*k,0,Math.sin(pu.a)*1.3*k]);dot(p,CYAN,2.2,1-pu.t*.5);}
 while(pulses.length&&pulses[0].t>=1){pulses.shift();}
 const arrived=pulses.some(pu=>pu.t>.85);glow(centre,'rgba(170,130,255,.6)',R*(arrived?.5:.3),1);
 const stem=ring([0,-1.05,0]);line(centre,stem,VIOLET,.35,1);
 // The pulses arrive at Rialo: its symbol (rialo-mark.js, official path and colour) sits at the centre of the clock.
 const mark=window.ResonanceRialoMark;if(mark)mark.draw(ctx,centre[0],centre[1],R*.46,Math.sin(time*.0006)*.4+tiltY*.5,{glow:arrived?.45:.22});else dot(centre,ICE,2.4,1);}

// Ade: value (cyan), risk (pink) and time (violet) rings turn independently, then line up for a moment.
function ade(){const cycle=(time%7000)/7000,lock=cycle>.78?Math.sin((cycle-.78)/.22*Math.PI):0,ease=lock*lock*(3-2*lock);
 const rings=[[1.32,CYAN,.0007,0],[1.12,PINK,-.0005,1.3],[.92,VIOLET,.0009,2.4]];
 rings.forEach(([r,color,speed,phase],i)=>{const ax=(time*speed+phase)*(1-ease),ay=(time*speed*.7+phase*1.7)*(1-ease);
  loopPath(circle(r,48).map(v=>proj(rot(rot(v,ay,ax+i*.5*(1-ease)),tiltY+time*.0002,.35+tiltX))),color,.8,1.4);});
 const core=proj([0,0,0]),flare=.32+ease*.5;glow(core,'rgba(255,138,76,.65)',R*flare,1);
 const ico=octa.map(v=>proj(rot([v[0]*.28,v[1]*.22,v[2]*.28],time*.001,.4)));for(const [a,b] of octaEdges)line(ico[a],ico[b],ORANGE,.9,1.3);dot(core,'#ffe1cf',2.6+ease*2,1);}

const scenes=[diren,ece,denis,ade];
function size(){place();dpr=Math.min(2,devicePixelRatio||1);w=host.clientWidth;h=host.clientHeight;canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));cx=canvas.width/2;cy=canvas.height/2;R=Math.min(canvas.width,canvas.height)*(figure?.4:.27);if(figure)cy=canvas.height*.56;else cy=canvas.height*.42;draw(16);}
function draw(dt){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';scenes[who]?.(dt);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
// About 30 frames a second is enough for these slow motions and halves the drawing cost.
function loop(t){frame=0;if(!visible||document.hidden)return;frame=requestAnimationFrame(loop);if(last&&t-last<30)return;const dt=Math.min(66,t-(last||t));last=t;time+=dt;tiltX+=(aimX-tiltX)*.05;tiltY+=(aimY-tiltY)*.05;draw(dt);}
const start=()=>{if(!reduce.matches&&!frame&&visible&&!document.hidden){last=0;frame=requestAnimationFrame(loop);}};
hero.addEventListener('pointermove',e=>{const b=host.getBoundingClientRect();aimY=Math.max(-1,Math.min(1,(e.clientX-b.left-b.width/2)/b.width))*.5;aimX=Math.max(-1,Math.min(1,(e.clientY-b.top-b.height/2)/b.height))*.25;});
hero.addEventListener('pointerleave',()=>{aimX=aimY=0;});
time=who===0?1900:2600;
new IntersectionObserver(([e])=>{visible=e.isIntersecting&&host.offsetWidth>0;start();}).observe(host);
document.addEventListener('visibilitychange',start);reduce.addEventListener?.('change',()=>{size();start();});
const resize=new ResizeObserver(size);resize.observe(host);resize.observe(hero);size();
})();
