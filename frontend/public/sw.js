self.addEventListener('install', event => {
  console.log('📥 Service Worker installing...')
  self.skipWaiting() // 바로 활성화 원하면
})

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...')
  clients.claim()
})

self.addEventListener('fetch', event => {
  // 캐싱 전략 필요하면 여기서 작성
  // event.respondWith(fetch(event.request));
})
