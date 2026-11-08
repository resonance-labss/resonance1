// Read-only operations on My Resonance: transaction status, pass verification and transfer preview, with a mocked wallet.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{const me='0x'+'1'.repeat(40),other='0x'+'2'.repeat(40),hash='0x'+'a'.repeat(64);window.calls=[];
 window.ethereum={on(){},removeListener(){},async request({method,params}){calls.push(method);const e=window.ethers,c=window.RESONANCE_MINT,abi=new e.Interface(c.abi);
  if(method==='eth_chainId')return c.chainId;if(method==='eth_accounts'||method==='eth_requestAccounts')return [me];
  if(method==='eth_getCode')return params[0].toLowerCase()===c.address.toLowerCase()?'0x1234':'0x';
  if(method==='eth_call'){const f=abi.parseTransaction({data:params[0].data});const a=f.args;
   if(f.name==='ownerOf'){if(a[0]!==12n)throw Object.assign(Error('execution reverted'),{code:3});return abi.encodeFunctionResult('ownerOf',[me]);}
   if(f.name==='characterOf')return abi.encodeFunctionResult('characterOf',[1n]);
   if(f.name==='balanceOfCharacter')return abi.encodeFunctionResult('balanceOfCharacter',[Number(a[1])===1?1n:0n]);
   if(f.name==='hasClaimed')return abi.encodeFunctionResult('hasClaimed',[Number(a[1])===1]);throw Error('unexpected '+f.name);}
  if(method==='eth_getTransactionByHash')return params[0]===hash?{hash,from:me,to:c.address}:null;
  if(method==='eth_getTransactionReceipt'){const log=abi.encodeEventLog('RewardClaimed',[me,12n,1]);return {status:'0x1',blockNumber:'0x10',logs:[{address:c.address,topics:log.topics,data:log.data}]};}
  if(method==='eth_estimateGas')return '0x5208';if(method==='eth_gasPrice')return '0x3b9aca00';throw Error('Unexpected '+method);}};});
await p.goto('file://'+__dirname+'/index.html');await p.evaluate(()=>window.resonanceEthers());await p.evaluate(()=>{window.RESONANCE_MINT.runtimeHash=ethers.keccak256('0x1234');});
const result=async(button,id)=>{await p.click(button);await p.waitForFunction(i=>{const t=document.getElementById(i).textContent;return t&&!t.startsWith('Reading');},id);return p.locator('#'+id).textContent();};
await p.fill('#op-hash','0x'+'a'.repeat(64));let text=await result('#op-tx-check','op-tx-result');
assert.match(text,/Confirmed in block 16/);assert.match(text,/Pass mint: Ece pass #12 for 0x1111…1111/);assert.equal(await p.locator('#op-tx-result a').getAttribute('href'),'https://sepolia.etherscan.io/tx/0x'+'a'.repeat(64));
await p.fill('#op-hash','0x'+'b'.repeat(64));assert.match(await result('#op-tx-check','op-tx-result'),/Not found on Sepolia yet/);
await p.fill('#op-hash','0x12');assert.match(await result('#op-tx-check','op-tx-result'),/64 characters/);assert(await p.locator('#op-tx-result').evaluate(e=>e.classList.contains('error')));
await p.fill('#op-token','12');text=await result('#op-verify','op-verify-result');assert.match(text,/Ece pass #12 is held by 0x1{40} \(your connected wallet\)/);
await p.fill('#op-token','99');assert.match(await result('#op-verify','op-verify-result'),/Pass #99 does not exist/);
await p.fill('#op-token','');await p.selectOption('#op-character','1');text=await result('#op-verify','op-verify-result');assert.match(text,/holds 1 Ece pass/);assert.match(text,/Claimed with this address: yes/);
await p.selectOption('#op-character','0');assert.match(await result('#op-verify','op-verify-result'),/holds no Diren pass/);
await p.fill('#op-transfer-token','12');await p.fill('#op-recipient','0x'+'2'.repeat(40));text=await result('#op-preview','op-preview-result');
assert.match(text,/Ece pass #12 would move from you to 0x2222…2222/);assert.match(text,/You would lose access to Ece’s studio/);assert.match(text,/about 0\.000021 Sepolia ETH/);assert.match(text,/This page sends nothing/);
await p.fill('#op-recipient','0x'+'1'.repeat(40));assert.match(await result('#op-preview','op-preview-result'),/your own wallet/);
await p.fill('#op-recipient','not an address');assert.match(await result('#op-preview','op-preview-result'),/recipient’s address/);
await p.selectOption('#resonance-language','tr');await p.waitForFunction(()=>document.documentElement.lang==='tr');
await p.fill('#op-token','12');text=await result('#op-verify','op-verify-result');assert.match(text,/Ece geçişi #12, 0x1{40} adresinde \(bağlı cüzdanın\)\./);assert.match(text,/Ece’nin atölyesi/);
await p.fill('#op-hash','0x'+'a'.repeat(64));text=await result('#op-tx-check','op-tx-result');assert.match(text,/16\. blokta onaylandı\./);assert.match(text,/Geçiş mint’i: Ece geçişi #12/);
await p.selectOption('#resonance-language','en');
const calls=await p.evaluate(()=>window.calls);for(const forbidden of ['eth_sendTransaction','eth_sign','personal_sign','eth_signTypedData_v4'])assert(!calls.includes(forbidden),forbidden);
await p.setViewportSize({width:390,height:844});assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'mobile overflow');
assert.deepEqual(errors,[]);console.log('PASS operations: transaction status, pass mint log, verify by number and address, transfer preview with fee estimate, read-only (no signing), mobile.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
