// KEEPING PWA Service Worker
const CACHE_NAME = 'keeping-cache-v1'
const STATIC_CACHE_NAME = 'keeping-static-v1'

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/qr.png',
  '/icons/logo_owner+cust.png',
  '/icons/logo_owner+cust1.png',
  '/kakao-icon.png',
  '/customer.png',
  '/owner.png',
]

// Service Worker 설치
self.addEventListener('install', event => {
  console.log('Service Worker 설치 중...')

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('정적 파일 캐시 중...')
        return cache.addAll(STATIC_FILES)
      })
      .catch(error => {
        console.error('캐시 설치 실패:', error)
      })
  )

  // 새 Service Worker를 즉시 활성화
  self.skipWaiting()
})

// Service Worker 활성화
self.addEventListener('activate', event => {
  console.log('Service Worker 활성화 중...')

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 이전 버전 캐시 삭제
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  // 모든 클라이언트에서 즉시 제어권 가져오기
  self.clients.claim()
})

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // 같은 origin 요청만 처리
  if (url.origin !== self.location.origin) {
    return
  }

  // API 요청은 항상 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // API 요청 실패 시 오프라인 페이지
        return caches.match('/offline.html')
      })
    )
    return
  }

  // 정적 파일은 캐시 우선
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response
      }

      // 캐시에 없으면 네트워크에서 가져오기
      return fetch(request)
        .then(response => {
          // 응답이 유효하지 않으면 그대로 반환
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response
          }

          // 응답을 복사해서 캐시에 저장
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // 네트워크 실패 시 오프라인 페이지
          return caches.match('/offline.html')
        })
    })
  )
})

// 푸시 알림 처리
self.addEventListener('push', event => {
  console.log('푸시 알림 수신:', event)

  const options = {
    body: '새로운 알림이 있습니다.',
    icon: '/icons/logo_owner+cust.png',
    badge: '/icons/logo_owner+cust.png',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icons/qr.png',
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/qr.png',
      },
    ],
  }

  if (event.data) {
    try {
      const data = event.data.json()
      options.body = data.body || data.message || options.body
      options.title = data.title || 'KEEPING'
    } catch (e) {
      console.error('푸시 데이터 파싱 실패:', e)
    }
  }

  event.waitUntil(self.registration.showNotification('KEEPING', options))
})

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('알림 클릭:', event)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // 알림 클릭 시 앱 열기
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }

      // 새 창 열기
      if (self.clients.openWindow) {
        return self.clients.openWindow('/')
      }
    })
  )
})
