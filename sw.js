const CACHE='dw-erp-v240';
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./'])).catch(()=>{}));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(event.request,{cache:'no-store'});
        const cache=await caches.open(CACHE);
        cache.put('./',fresh.clone()).catch(()=>{});
        return fresh;
      }catch{
        return (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    try{
      return await fetch(event.request,{cache:'no-store'});
    }catch{
      return (await caches.match(event.request)) || Response.error();
    }
  })());
});
