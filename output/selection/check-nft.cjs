// NFT preview from the academy: the real token name and collection, the character's current tool, the learning-pass
// state, the mint link, no custom player name, phone width.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});
 try{const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('file://'+process.cwd()+'/output/selection/resonance-playable-v1.html');
  await p.locator('.rs-person').nth(1).click();await p.fill('#rs-input','PRIVATE PLAYER NAME');
  await p.locator('.learning-passes:visible').first().click();assert.equal(await p.locator('.lesson-pass button').count(),0,'no pass yet, no preview');
  assert.equal(await p.locator('dialog.player-profile a[href="my/index.html"]').count(),1,'link to My Resonance');await p.locator('.profile-close').click();
  await p.evaluate(()=>window.resonancePreviewNFT({character:1}));const d=p.locator('dialog.player-profile[open]');
  assert.equal(await d.locator('h2').textContent(),'Resonance Learning Pass');assert.equal(await d.locator('.nft-character').textContent(),'Ece');
  assert.match(await d.locator('.nft-collection').textContent(),/Resonance - Chapter Rewards/);assert.match(await d.locator('.nft-tool').textContent(),/Reserve Studio/);
  assert.match(await d.locator('.nft-eligibility').textContent(),/Finish this character’s lesson/);assert.equal(await d.locator('.nft-live-mint').getAttribute('href'),'mint/index.html?character=1');
  assert(!(await d.innerText()).includes('PRIVATE PLAYER NAME'),'custom name stays local');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('.profile-close').click();
  await p.evaluate(()=>localStorage.setItem('resonance.learning-passes.v1',JSON.stringify({3:{quizVersion:2,correctAnswers:4,character:3,name:'X'}})));
  await p.evaluate(()=>window.resonancePreviewNFT({character:3}));assert.match(await p.locator('dialog.player-profile[open] .nft-eligibility').textContent(),/completed in this browser/);
  assert.deepEqual(errors,[]);console.log('PASS NFT preview: token name and collection, current tool, eligibility, mint link, private name kept local, phone width.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
