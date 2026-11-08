/* ethers (about 500 KB) is needed only for contract reads after a wallet connects: the pass check, minting and the
   Sepolia tools. Pages load this small loader instead, and window.resonanceEthers() fetches the library the first time
   it is needed (choosing a wallet starts it early). A failed download can be retried. */
(()=>{'use strict';
if(window.resonanceEthers)return;
const src=new URL('deploy/ethers.umd.min.js',document.currentScript?.src||location.href).href;let pending=null;
window.resonanceEthers=()=>{if(window.ethers)return Promise.resolve(window.ethers);
 return pending||(pending=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;
  s.onload=()=>window.ethers?resolve(window.ethers):(pending=null,reject(new Error('The wallet library did not load. Check your connection and try again.')));
  s.onerror=()=>{pending=null;s.remove();reject(new Error('The wallet library did not load. Check your connection and try again.'));};document.head.append(s);}));};
})();
