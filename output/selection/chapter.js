/* The academy's lesson area (#chapter): base styles for the lesson page, the four-question check and the pass screen,
   and Continue on the selection screen showing it. character-lessons.js renders what goes inside. */
(()=>{
const shell=document.getElementById('resonance-select');
const style=document.createElement('style');style.textContent=`
#chapter{background:#0e1725;color:#eee7db;font-family:Arial,sans-serif;min-height:650px;padding:28px;box-sizing:border-box}#chapter *{box-sizing:border-box}
#chapter header{display:flex;justify-content:space-between;gap:15px;align-items:center;border-bottom:1px solid #344258;padding-bottom:18px}
#chapter .brand{font:23px Georgia,serif;letter-spacing:4px}#chapter .small{font-size:12px;color:#c6b594;letter-spacing:1px}
#chapter h1{font:42px Georgia,serif;margin:16px 0}#chapter h2{font:25px Georgia,serif;margin:12px 0}#chapter p{font-size:15px;line-height:1.7;color:#cbd2dc}
#chapter button{padding:12px 18px;min-height:44px;background:#dbb579;color:#101723;border:1px solid #dbb579;border-radius:3px;font-size:14px;cursor:pointer}
#chapter button:disabled{opacity:.4;cursor:not-allowed}#chapter .secondary{background:#172536;color:#eee7db;border-color:#5f6e82}
#chapter .row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}#chapter .tag{color:#95d4c5;font-size:12px;letter-spacing:1px}
#chapter .foot{font-size:11px;color:#a8b4c3;border-top:1px solid #344258;margin-top:26px;padding-top:14px}
#chapter .mastery-wrap{max-width:760px;margin:28px auto}#chapter .mastery-progress{color:#a8d6cc;font-size:13px;letter-spacing:1px}
#chapter .mastery-option{display:block;width:100%;text-align:left;background:#1b2d40;color:#eee7db;border:1px solid #657b92;margin:12px 0;line-height:1.6;padding:16px}
#chapter .mastery-option:disabled{opacity:1;cursor:default}#chapter .mastery-option.correct{border:2px solid #9dd6be;background:#203b34}#chapter .mastery-option.wrong{border:2px solid #e5a39b;background:#3c2c32}
#chapter .mastery-feedback{padding:18px;border-left:3px solid #dcb778;background:#182a3a;margin:20px 0;line-height:1.7}#chapter .mastery-feedback:empty{display:none}
@media(max-width:650px){#chapter{padding:18px}#chapter h1{font-size:32px}#chapter header{flex-wrap:wrap}}
@media(prefers-reduced-motion:reduce){#chapter *{transition:none!important}}`;
document.head.append(style);
const chapter=document.createElement('main');chapter.id='chapter';chapter.hidden=true;shell.after(chapter);
document.getElementById('rs-start').addEventListener('click',()=>{if(!document.getElementById('rs-input').value.trim())return;shell.hidden=true;chapter.hidden=false;window.scrollTo({top:0,behavior:'instant'});});
})();
