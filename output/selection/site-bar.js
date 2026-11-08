/* Shared page chrome: one compact bar for the home link, demo budget unit and language. Load before i18n and demo-unit. */
(()=>{'use strict';
const RELEASE='0.11.0';
const script=document.currentScript,root=new URL('./',script&&script.src||document.baseURI).href;
const css=`
#site-bar{position:relative;z-index:40;display:flex;align-items:center;gap:8px 18px;flex-wrap:wrap;min-height:53px;margin:0;padding:8px clamp(16px,3vw,32px);background:#0a131a;border-bottom:1px solid #22323a;color:#dfe7e3;font:13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:0;box-sizing:border-box;width:100%;max-width:100%}
#site-bar *{box-sizing:border-box}
#site-bar a#site-home{display:inline-flex;align-items:center;gap:8px;min-height:36px;margin:0 auto 0 0;color:#e9e2d4;text-decoration:none;font:600 12px/1 system-ui,sans-serif;letter-spacing:2.2px;text-transform:uppercase}
#site-bar a#site-home:hover{color:#f3d9a8}
#site-bar a#site-home img.rialo-mark{height:13px;width:auto;margin:0;vertical-align:-2px}
#site-bar #site-release{border:1px solid #3a4b52;border-radius:20px;padding:3px 8px;color:#a9bab4;font:500 11px/1.2 system-ui,sans-serif;letter-spacing:.3px;text-transform:none}
#site-bar #site-spacer{margin-right:auto}
#site-bar label{display:inline;margin:0;font:500 12px/1.4 system-ui,sans-serif;color:#aebdb7;letter-spacing:.2px}
#site-bar select{width:auto;min-width:0;min-height:36px;margin:0;padding:6px 30px 6px 10px;border:1px solid #3b4f57;border-radius:8px;background:#122029 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23c9d6d1' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 10px center;color:#eef3f0;font:500 13px/1.2 system-ui,sans-serif;appearance:none;-webkit-appearance:none;cursor:pointer;max-width:100%}
#site-bar select:hover{border-color:#5f7a80}
#site-bar select:focus-visible,#site-bar a:focus-visible,#site-bar summary:focus-visible{outline:3px solid #edce91;outline-offset:2px}
#site-bar #demo-unit-control,#site-bar #language-control{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;max-width:100%}
#site-bar #demo-unit-info{position:static;margin:0}
#site-bar #demo-unit-info>summary{display:inline-grid;place-items:center;width:28px;height:28px;min-height:0;border:1px solid #3b4f57;border-radius:50%;color:#c9d6d1;font:600 13px/1 system-ui,sans-serif;cursor:pointer;list-style:none}
#site-bar #demo-unit-info>summary::-webkit-details-marker{display:none}
#site-bar #demo-unit-info[open]>summary{background:#22343c;border-color:#7c969b}
#site-bar #demo-unit-info>p{position:absolute;right:clamp(16px,3vw,32px);top:calc(100% + 6px);width:min(420px,calc(100vw - 32px));margin:0;padding:14px 16px;border:1px solid #3b4f57;border-radius:12px;background:#101c24;color:#d3ddd9;font:13px/1.55 system-ui,sans-serif;box-shadow:0 18px 40px #0009}
#site-bar #demo-unit-status:empty,#site-bar #language-status:empty{display:none}
#site-bar #demo-unit-status,#site-bar #language-status{flex-basis:100%;margin:0;color:#f3d9a8;font-size:12px}
@media(max-width:560px){#site-bar{gap:6px 10px}#site-bar label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}#site-bar #site-release{display:none}}
@media print{#site-bar{display:none}}
/* The controls arrive at DOMContentLoaded; where they wrap to a second row, reserve that row from the first paint (widths measured in English and Turkish). */
@media(max-width:395px){#site-bar{min-height:95px}}@media(min-width:564px) and (max-width:743px){#site-bar{min-height:97px}}
@media(max-width:503px){#site-bar:has(#site-home){min-height:95px}}@media(min-width:564px) and (max-width:923px){#site-bar:has(#site-home){min-height:97px}}
#site-bar .site-tool{display:inline-flex;align-items:center;gap:7px;width:auto;min-height:36px;margin:0;padding:6px 12px;border:1px solid #3b4f57;border-radius:8px;background:#122029;color:#eef3f0;font:500 13px/1.2 system-ui,sans-serif;letter-spacing:0;cursor:pointer;box-shadow:none;filter:none;opacity:1}
#site-bar .site-tool:hover{border-color:#5f7a80;background:#16303a}
#site-bar .site-tool[aria-expanded=true]{background:#22343c;border-color:#7c969b}
#site-bar .site-tool-icon{font:600 11px/1 system-ui,sans-serif;color:#edce91}
#site-bar #site-tour{order:1}#site-bar #site-terms{order:2}#site-bar #language-control{order:3}#site-bar #demo-unit-control{order:4}
#terms-panel{position:absolute;right:clamp(16px,3vw,32px);top:calc(100% + 6px);z-index:45;width:min(460px,calc(100vw - 32px));max-height:min(70vh,560px);overflow:auto;margin:0;padding:18px 20px;border:1px solid #3b4f57;border-radius:12px;background:#101c24;color:#d3ddd9;box-shadow:0 18px 40px #0009;font:14px/1.5 system-ui,sans-serif;text-align:left}
#terms-panel:focus{outline:none}
#terms-panel h2{margin:0 0 6px;font:600 15px/1.3 system-ui,sans-serif;color:#f1ead9;letter-spacing:0}
#terms-panel dl{margin:0}#terms-panel dt{margin:12px 0 2px;font-weight:600;color:#edce91}#terms-panel dd{margin:0;color:#c7d3d0}
.term-chip{display:inline-grid;place-items:center;width:17px;height:17px;margin:0 0 0 6px;padding:0;vertical-align:1px;border:1px solid currentColor;border-radius:50%;color:#9fc7ba;font:italic 600 11px/1 Georgia,serif;cursor:help;opacity:.85}
.term-chip::before{content:"i"}
.term-chip:hover{opacity:1;color:#edce91}
#term-popover{position:absolute;z-index:60;box-sizing:border-box;padding:12px 14px;border:1px solid #3b4f57;border-radius:10px;background:#101c24;color:#d3ddd9;box-shadow:0 14px 34px #0009;font:13px/1.5 system-ui,sans-serif;text-align:left}
#term-popover strong{display:block;margin-bottom:4px;color:#edce91}
#term-popover p{margin:0;color:#d3ddd9;font-size:13px}
#tour-layer{position:fixed;inset:0;z-index:1000;pointer-events:none}
#tour-spot{position:fixed;border-radius:12px;box-shadow:0 0 0 3px #edce91,0 0 0 9999px #050b10b8;transition:left .25s,top .25s,width .25s,height .25s}
#tour-card{position:fixed;box-sizing:border-box;pointer-events:auto;padding:18px 20px;border:1px solid #4a6068;border-radius:14px;background:#101c24;color:#e6ece9;box-shadow:0 20px 50px #000a;font:14px/1.55 system-ui,sans-serif;text-align:left}
#tour-card:focus{outline:none}
#tour-count{font:600 11px/1 system-ui,sans-serif;letter-spacing:2px;color:#edce91}
#tour-card h2{margin:8px 0 6px;font:22px/1.25 Georgia,serif;color:#f4efe4;letter-spacing:0}
#tour-card p{margin:0 0 14px;color:#c7d3d0;font-size:14px}
#tour-actions{display:flex;flex-wrap:wrap;gap:8px}
#tour-actions button{width:auto;min-height:38px;margin:0;padding:8px 14px;border:1px solid #4a6068;border-radius:8px;background:transparent;color:#e6ece9;font:600 13px/1.2 system-ui,sans-serif;cursor:pointer;box-shadow:none;filter:none;opacity:1}
#tour-actions #tour-next{background:#edce91;border-color:#edce91;color:#16130c}
#tour-actions #tour-close{margin-left:auto;border-color:transparent;text-decoration:underline}
#tour-actions button:disabled{opacity:.4;cursor:default;border-style:solid}
@media(max-width:560px){#site-bar .site-tool{padding:6px 10px}#site-bar .site-tool-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}
details.fine-print{margin:16px 0;padding:0;border:1px solid #34474f;border-left:3px solid #d9bd89;border-radius:10px;background:#14212999;color:#cfd9dc;font:14px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
details.fine-print>summary{display:flex;align-items:center;gap:10px;min-height:44px;margin:0;padding:9px 14px;cursor:pointer;list-style:none;color:#e6e0d3;font-weight:500}
details.fine-print>summary::-webkit-details-marker{display:none}
details.fine-print>summary::before{content:"i";flex:none;display:inline-grid;place-items:center;width:20px;height:20px;border:1px solid #d9bd89;border-radius:50%;color:#d9bd89;font:italic 600 12px/1 Georgia,serif}
details.fine-print>summary::after{content:"Details";margin-left:auto;flex:none;padding-left:12px;font-size:12px;font-weight:400;color:#9fb6bd;text-decoration:underline;text-underline-offset:3px}
details.fine-print[open]>summary::after{content:"Hide"}
:root[lang=tr] details.fine-print>summary::after{content:"Detay"}
:root[lang=tr] details.fine-print[open]>summary::after{content:"Gizle"}
details.fine-print>summary strong{font-weight:600}
details.fine-print>:not(summary){margin:0;padding:0 14px 14px 44px;color:#bfccd0;font-size:14px;line-height:1.6}
:where(a,button,select,input,textarea,summary,[tabindex]):focus-visible{outline:3px solid #edce91;outline-offset:3px}
::selection{background:#e2c48b;color:#141b22}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;
let bar=null;
function ensure(){
 if(bar)return bar;
 const style=document.createElement('style');style.id='site-bar-style';style.textContent=css;document.head.append(style);
 bar=document.createElement('div');bar.id='site-bar';bar.setAttribute('role','region');bar.setAttribute('aria-label','Site preferences');
 const here=location.href.split(/[?#]/)[0];
 if(here===root||here===root+'index.html'){const spacer=document.createElement('span');spacer.id='site-spacer';bar.append(spacer);}
 else{const home=document.createElement('a');home.id='site-home';home.href=root;home.innerHTML='<span aria-hidden="true">←</span> <img class="rialo-mark" alt="" aria-hidden="true" width="12" height="13"> Resonance <span id="site-release"></span>';home.querySelector('img').src=root+'brand/rialo-symbol.svg';home.querySelector('#site-release').textContent='v'+RELEASE;bar.append(home);}
 document.body.prepend(bar);return bar;
}
if(!document.querySelector('link[rel~="icon"]')){const icon=document.createElement('link');icon.rel='icon';icon.type='image/svg+xml';icon.href=root+'favicon.svg';document.head.append(icon);}
window.ResonanceSiteBar={release:RELEASE,add(el){ensure().append(el);return true;}};
// Mount the bar the moment <body> exists, before the first paint, so it never pushes the page down later.
if(document.body)ensure();else new MutationObserver((records,observer)=>{if(document.body){observer.disconnect();ensure();}}).observe(document.documentElement,{childList:true});
// The two fonts every page uses first, requested now instead of after the first layout.
for(const name of ['chakra-petch-700-latin','rajdhani-500-latin']){const link=document.createElement('link');link.rel='preload';link.as='font';link.type='font/woff2';link.crossOrigin='anonymous';link.href=root+'fonts/'+name+'.woff2';document.head.append(link);}
// Same-site links are fetched when the pointer rests on them, so the next page opens without a wait (Chromium only; no prerendering).
if(location.protocol.startsWith('http')&&window.HTMLScriptElement&&HTMLScriptElement.supports&&HTMLScriptElement.supports('speculationrules')){const rules=document.createElement('script');rules.type='speculationrules';rules.textContent=JSON.stringify({prefetch:[{where:{and:[{href_matches:'/*'},{not:{href_matches:'/api/*'}}]},eagerness:'moderate'}]});document.head.append(rules);}
})();
