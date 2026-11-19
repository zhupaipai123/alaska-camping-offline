'use strict';
const statusText=document.querySelector('#status'),detail=document.querySelector('#detail'),progress=document.querySelector('#progress'),prepareButton=document.querySelector('#prepare'),start=document.querySelector('#start');
let worker, timer;
function say(s,d=''){statusText.textContent=s;detail.textContent=d;}
function requestStatus(){if(worker)worker.postMessage({type:'STATUS'});}
navigator.serviceWorker?.addEventListener('message',event=>{
 const m=event.data||{};
 if(m.type==='STATUS'){
  clearTimeout(timer);progress.hidden=true;
  if(m.ready){say('离线资源准备完成',`已检查 ${m.total} 个文件。可以进入游戏并进行飞行模式测试。`);start.hidden=false;prepareButton.hidden=true;}
  else{start.hidden=true;prepareButton.hidden=false;prepareButton.disabled=!navigator.onLine;say('离线资源尚未准备完成',navigator.onLine?'请保持联网并点击下方按钮。':'请先联网，再准备离线资源。');}
 }
 if(m.type==='PROGRESS'){prepareButton.disabled=true;start.hidden=true;progress.hidden=false;progress.max=m.total;progress.value=m.done;say('正在准备离线资源',`${m.done} / ${m.total} 个文件已检查`);}
 if(m.type==='COMPLETE'){progress.hidden=true;prepareButton.hidden=true;start.hidden=false;say('离线资源准备完成',`已校验 ${m.total} 个文件。可以进入游戏并进行飞行模式测试。`);}
 if(m.type==='BUSY'){say('正在准备离线资源','请保持页面打开。');}
 if(m.type==='ERROR'){progress.hidden=true;prepareButton.hidden=false;prepareButton.disabled=false;start.hidden=true;say('准备失败，请重试',m.message||'请检查网络或手机存储空间。');}
});
prepareButton.addEventListener('click',async()=>{prepareButton.disabled=true;say('正在准备离线资源','请保持页面打开。');try{if(navigator.storage?.persist)await navigator.storage.persist();}catch(_){}worker.postMessage({type:'PREPARE'});});
window.addEventListener('online',()=>{if(worker)requestStatus();});
(async()=>{if(!('serviceWorker' in navigator)){say('当前浏览器不支持离线准备','请使用 iPhone Safari，并从主屏幕打开。');return;}try{const registration=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});await navigator.serviceWorker.ready;worker=registration.active||registration.waiting||registration.installing;if(!worker)throw new Error('离线服务未启动');requestStatus();timer=setTimeout(()=>{say('检查耗时较长','请保持页面打开，或联网后重新打开。');},15000);}catch(e){say('无法启动离线准备',navigator.onLine?'请使用 HTTPS 或稍后重试。':'请先联网并重新打开。');}})();
