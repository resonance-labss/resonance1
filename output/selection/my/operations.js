/* Read-only Sepolia tools for pass holders: transaction status, pass verification and a transfer preview.
   They only read through the visitor's wallet (eth_call, receipts, estimates). Nothing is signed or sent from this page. */
(()=>{'use strict';
const $=id=>document.getElementById(id),c=window.RESONANCE_MINT,names=['Diren','Ece','Denis','Ade'],tools=['Diren’s vault','Ece’s studio','Denis’s Web3 Budget Studio','Ade’s Plan Lab'];
let busy=false,ethers=null,abi=null;const lib=async()=>{if(!abi){ethers=await window.resonanceEthers();abi=new ethers.Interface(c.abi);}};
const short=a=>a.slice(0,6)+'…'+a.slice(-4);
async function wallet(){const p=window.ResonanceWallet.current()||await window.ResonanceWallet.choose();if(!p)throw Error(window.ResonanceWallet.noneText);
 if(String(await p.request({method:'eth_chainId'})).toLowerCase()!==c.chainId)throw Error('Switch your wallet to Sepolia, then try again.');
 if(ethers.keccak256(await p.request({method:'eth_getCode',params:[c.address,'latest']}))!==c.runtimeHash)throw Error('Contract code does not match the verified deployment. Nothing was read.');
 return p;}
async function account(p){const a=(await p.request({method:'eth_accounts'}))?.[0]||(await p.request({method:'eth_requestAccounts'}))?.[0];if(!ethers.isAddress(a||''))throw Error('Connect a wallet account first.');return ethers.getAddress(a);}
const call=async(p,method,args)=>abi.decodeFunctionResult(method,await p.request({method:'eth_call',params:[{to:c.address,data:abi.encodeFunctionData(method,args)},'latest']}))[0];
async function holder(p,id){try{return ethers.getAddress(await call(p,'ownerOf',[id]));}catch{throw Error('Pass #'+id+' does not exist.');}}
function tokenId(value){if(!/^\d{1,12}$/.test(value.trim()))throw Error('Enter a pass number, for example 12.');return BigInt(value.trim());}
function show(id,lines,error){const box=$(id);box.replaceChildren();box.classList.toggle('error',!!error);for(const line of [].concat(lines)){const p=document.createElement('p');if(line instanceof Node)p.append(line);else p.textContent=line;box.append(p);}}
function run(button,result,work){$(button).onclick=async()=>{if(busy)return;busy=true;$(button).disabled=true;show(result,'Reading Sepolia…');try{await lib();show(result,await work());}catch(e){show(result,e.code===4001?'Request declined in your wallet. Nothing was read.':e.message||'Wallet request failed.',true);}finally{busy=false;$(button).disabled=false;}};}

// 01 · Diren: what happened to a transaction, and was it a Resonance pass mint or transfer?
run('op-tx-check','op-tx-result',async()=>{const hash=$('op-hash').value.trim();if(!/^0x[0-9a-fA-F]{64}$/.test(hash))throw Error('Enter a Sepolia transaction hash: 0x followed by 64 characters.');
 const p=await wallet(),tx=await p.request({method:'eth_getTransactionByHash',params:[hash]});
 if(!tx)return 'Not found on Sepolia yet. Check the hash, or wait a moment if it was just sent.';
 const receipt=await p.request({method:'eth_getTransactionReceipt',params:[hash]});
 const link=document.createElement('a');link.href='https://sepolia.etherscan.io/tx/'+hash;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open in Sepolia Etherscan ↗';
 if(!receipt)return ['Pending: sent, not yet in a block.',link];
 const lines=[(receipt.status==='0x1'?'Confirmed':'Failed')+' in block '+Number(receipt.blockNumber)+'.','From '+short(tx.from)+(tx.to?' to '+short(tx.to):'')+'.'];
 for(const log of receipt.logs||[]){if(log.address.toLowerCase()!==c.address.toLowerCase())continue;let e;try{e=abi.parseLog(log);}catch{continue;}
  if(e?.name==='RewardClaimed')lines.push('Pass mint: '+names[Number(e.args.character)]+' pass #'+e.args.tokenId+' for '+short(e.args.player)+'.');
  else if(e?.name==='Transfer'&&e.args.from!==ethers.ZeroAddress)lines.push('Pass transfer: #'+e.args.tokenId+' from '+short(e.args.from)+' to '+short(e.args.to)+'.');}
 if(lines.length===2)lines.push('This transaction did not mint or move a Resonance pass.');
 lines.push(link);return lines;});

// 02 · Ade: who holds a pass number, or which passes an address holds.
run('op-verify','op-verify-result',async()=>{const p=await wallet(),raw=$('op-token').value.trim();
 if(raw){const id=tokenId(raw),owner=await holder(p,id),who=Number(await call(p,'characterOf',[id]));let mine=false;try{mine=owner===await account(p);}catch{}
  return [names[who]+' pass #'+id+' is held by '+owner+(mine?' (your connected wallet).':'.'),'It opens '+tools[who]+' for that wallet. Ownership is read from the contract right now.'];}
 const typed=$('op-owner').value.trim();if(typed&&!ethers.isAddress(typed))throw Error('That is not a valid address.');
 const address=typed?ethers.getAddress(typed):await account(p),i=Number($('op-character').value);
 const [held,claimed]=await Promise.all([call(p,'balanceOfCharacter',[address,i]),call(p,'hasClaimed',[address,i])]);
 return [short(address)+(held>0n?' holds '+held+' '+names[i]+' pass'+(held>1n?'es':'')+', so '+tools[i]+' opens for it.':' holds no '+names[i]+' pass right now.'),'Claimed with this address: '+(claimed?'yes. A transfer does not restore the claim.':'no.')];});

// 03 · Ece: what a transfer would change. The page never sends it.
run('op-preview','op-preview-result',async()=>{const id=tokenId($('op-transfer-token').value),to=$('op-recipient').value.trim();if(!ethers.isAddress(to))throw Error('Enter the recipient’s address.');
 const recipient=ethers.getAddress(to),p=await wallet(),me=await account(p),owner=await holder(p,id),who=Number(await call(p,'characterOf',[id]));
 if(owner!==me)return [names[who]+' pass #'+id+' is held by '+short(owner)+', not by your connected wallet, so you could not transfer it.'];
 if(recipient===me)return ['The recipient is your own wallet. Nothing would change.'];
 if(recipient===ethers.ZeroAddress)throw Error('The zero address cannot receive a pass.');
 const lines=['If you sent it, '+names[who]+' pass #'+id+' would move from you to '+short(recipient)+'. They would open '+tools[who]+'.'];
 const left=await call(p,'balanceOfCharacter',[me,who]);lines.push(left>1n?'You would keep another '+names[who]+' pass, so your access stays.':'You would lose access to '+tools[who]+'. Your claim allowance does not come back.');
 if((await p.request({method:'eth_getCode',params:[recipient,'latest']}))!=='0x')lines.push('Warning: the recipient is a contract. It may not be able to use or return the pass.');
 try{const gas=BigInt(await p.request({method:'eth_estimateGas',params:[{from:me,to:c.address,data:abi.encodeFunctionData('transferFrom',[me,recipient,id])}]})),price=BigInt(await p.request({method:'eth_gasPrice'}));lines.push('Estimated network fee: about '+Number(ethers.formatEther(gas*price)).toFixed(6)+' Sepolia ETH.');}catch{lines.push('The fee could not be estimated right now.');}
 lines.push('This page sends nothing. To transfer, use your wallet and check the address twice.');return lines;});
})();
