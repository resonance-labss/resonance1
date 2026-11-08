/* Wallet picker shared by the academy, mint page, vault gates and My Resonance.
   Finds every browser wallet that announces itself (EIP-6963: MetaMask, Rabby, Coinbase Wallet, OKX, Brave, Trust and others)
   plus a plain injected window.ethereum, lets the visitor choose one when there are several, and remembers the choice.
   It only hands back an EIP-1193 provider: network checks, ownership checks and minting stay with each page. */
(()=>{'use strict';
if(window.ResonanceWallet)return;
const KEY='resonance.wallet.v1',found=new Map(),listeners=new Set();
// Well-known wallets offered as install links when they are not in this browser.
const INSTALL=[['MetaMask','https://metamask.io/download/','io.metamask'],['OKX Wallet','https://www.okx.com/web3','com.okex.wallet'],['Coinbase Wallet','https://www.coinbase.com/wallet/downloads','com.coinbase.wallet'],['Trust Wallet','https://trustwallet.com/download','com.trustwallet.app'],['Rabby','https://rabby.io/','io.rabby']];
const NONE='No browser wallet was found. Install MetaMask, OKX Wallet or another wallet, or open this page in your wallet app’s browser. You can still play every lesson.';
window.addEventListener('eip6963:announceProvider',e=>{const d=e.detail,id=d?.info?.uuid||d?.info?.rdns||d?.info?.name;if(!id||typeof d.provider?.request!=='function')return;const known=found.has(id);found.set(id,{info:{name:d.info.name||'Browser wallet',icon:d.info.icon||'',rdns:d.info.rdns||'',uuid:id},provider:d.provider});if(!known)listeners.forEach(f=>f());});
const discover=()=>window.dispatchEvent(new Event('eip6963:requestProvider'));
discover();
// Wallets that announce themselves usually also set window.ethereum, often as a different object, so the old injected
// provider is only offered when no wallet announced itself (otherwise Rabby or MetaMask would be listed twice).
function injected(){const p=window.ethereum;if(!p||typeof p.request!=='function'||found.size)return null;
 const name=p.isRabby?'Rabby':p.isCoinbaseWallet?'Coinbase Wallet':p.isOkxWallet||p.isOKExWallet?'OKX Wallet':p.isTrust||p.isTrustWallet?'Trust Wallet':p.isBraveWallet?'Brave Wallet':p.isMetaMask?'MetaMask':'Browser wallet';
 return {info:{uuid:'injected',rdns:'injected',name,icon:''},provider:p};}
function wallets(){const list=[...found.values()],legacy=injected();if(legacy)list.push(legacy);return list;}
function saved(){try{return localStorage.getItem(KEY)||'';}catch{return '';}}
function remember(w){try{localStorage.setItem(KEY,w.info.rdns||w.info.uuid);}catch{}return w.provider;}
// Without asking: the wallet chosen last time if it is still here, or the only wallet in this browser.
function current(){const list=wallets(),last=saved();return (list.find(w=>(w.info.rdns||w.info.uuid)===last)||(list.length===1?list[0]:null))?.provider||null;}
function name(provider){return wallets().find(w=>w.provider===provider)?.info.name||'your wallet';}
let style=null;
function css(){if(style)return;style=document.createElement('style');style.textContent='.wallet-picker{width:min(420px,calc(100% - 32px));padding:22px;border:1px solid rgba(51,227,255,.45);border-radius:2px;background:linear-gradient(160deg,#111d33,#070d1a);color:#e6eeff;box-shadow:0 0 50px -10px rgba(51,227,255,.45),0 30px 80px #000c}.wallet-picker::backdrop{background:#020510cc;backdrop-filter:blur(3px)}.wallet-picker h2{margin:0 0 6px;font-size:20px;letter-spacing:.06em;text-transform:uppercase}.wallet-picker p{margin:0 0 14px;color:#a6b5d4;font-size:14px}.wallet-picker ul{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:8px}.wallet-picker li button{width:100%;display:flex;align-items:center;gap:12px;min-height:48px;padding:10px 14px;border:1px solid #5e7194!important;border-radius:2px!important;background:#0d1526!important;color:#e6eeff!important;box-shadow:none!important;text-transform:none!important;letter-spacing:.02em!important;font-weight:700;cursor:pointer;text-align:left;margin:0!important}.wallet-picker li button:hover,.wallet-picker li button:focus-visible{border-color:#33e3ff!important;color:#33e3ff!important;box-shadow:0 0 18px -6px #33e3ff!important}.wallet-picker img,.wallet-picker .wallet-dot{width:28px;height:28px;flex:none}.wallet-picker .wallet-dot{display:grid;place-items:center;border:1px solid #33e3ff;color:#33e3ff;font-size:14px}.wallet-picker .wallet-last{margin-left:auto;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6cf5cb}.wallet-picker .wallet-install a{color:#33e3ff}.wallet-picker .wallet-more{margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8ea0c0}.wallet-picker .wallet-cancel{border:1px solid #5e7194!important;border-radius:2px!important;background:transparent!important;color:#e6eeff!important;box-shadow:none!important;min-height:44px;padding:8px 18px;cursor:pointer}';document.head.append(style);}
function dialog(list){css();return new Promise(resolve=>{const d=document.createElement('dialog');d.className='wallet-picker';d.setAttribute('aria-labelledby','wallet-picker-title');
 const h=document.createElement('h2');h.id='wallet-picker-title';const p=document.createElement('p');d.append(h,p);let chosen=null;
 if(list.length){h.textContent='Choose a wallet';p.textContent='Wallets found in this browser. Connecting only shares your address; nothing is signed here.';const ul=document.createElement('ul');const last=saved();
  for(const w of list){const li=document.createElement('li'),b=document.createElement('button');b.type='button';
   if(/^data:image\//.test(w.info.icon||'')){const img=document.createElement('img');img.src=w.info.icon;img.alt='';b.append(img);}else{const dot=document.createElement('span');dot.className='wallet-dot';dot.textContent='◈';dot.setAttribute('aria-hidden','true');b.append(dot);}
   const label=document.createElement('span');label.textContent=w.info.name;b.append(label);
   if((w.info.rdns||w.info.uuid)===last){const tag=document.createElement('span');tag.className='wallet-last';tag.textContent='Last used';b.append(tag);}
   b.onclick=()=>{chosen=w;d.close();};li.append(b);ul.append(li);}
  d.append(ul);}
 else{h.textContent='No wallet found';p.textContent=NONE;}
 const here=new Set(list.map(w=>w.info.rdns)),more=INSTALL.filter(([,,rdns])=>!here.has(rdns));
 if(more.length){if(list.length){const t=document.createElement('p');t.className='wallet-more';t.textContent='Other popular wallets';d.append(t);}
  const links=document.createElement('p');links.className='wallet-install';more.forEach(([n,href],i)=>{const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener';a.textContent='Get '+n+' ↗';if(i)links.append(' · ');links.append(a);});d.append(links);}
 const cancel=document.createElement('button');cancel.type='button';cancel.className='wallet-cancel';cancel.textContent=list.length?'Cancel':'Close';cancel.onclick=()=>d.close();d.append(cancel);
 d.addEventListener('close',()=>{d.remove();resolve(chosen?remember(chosen):null);});document.body.append(d);d.showModal();(d.querySelector('li button')||cancel).focus();});}
// Asks only when there is a real choice; one wallet connects straight away. Resolves to null when there is none or the visitor cancels.
async function choose(){window.resonanceEthers?.().catch(()=>{});discover();await new Promise(r=>setTimeout(r,80));const list=wallets();if(list.length===1)return remember(list[0]);return dialog(list);}
window.ResonanceWallet={choose,current,name,wallets:()=>wallets().map(w=>w.info.name),onChange:f=>listeners.add(f),noneText:NONE};
})();
