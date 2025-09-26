// Firebase Messaging Service Worker
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js'
)
importScripts(
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js'
)

// Firebase 설정 - 실제 프로젝트 설정
try {
  firebase.initializeApp({
    apiKey: 'AIzaSyCHbM7Fm03JD_EqLI3xrvNiY3WoFJw1PhM',
    authDomain: 'keeping-6130e.firebaseapp.com',
    projectId: 'keeping-6130e',
    storageBucket: 'keeping-6130e.firebasestorage.app',
    messagingSenderId: '381411579605',
    appId: '1:381411579605:web:bcc34d8ab7481e732cf45c',
    measurementId: 'G-CLZVC2TEN8',
  })
  console.log('Firebase Service Worker 초기화 성공')
} catch (error) {
  console.error('Firebase Service Worker 초기화 실패:', error)
}

// Firebase messaging 초기화 (에러 처리 포함)
let messaging = null
try {
  messaging = firebase.messaging()
  console.log('Firebase Messaging Service Worker 초기화 성공')
} catch (error) {
  console.error('Firebase Messaging 초기화 실패:', error)
}

// messaging이 성공적으로 초기화된 경우에만 리스너 등록
if (messaging) {
  messaging.onBackgroundMessage(payload => {
    console.log('백그라운드 메시지 수신:', payload)

    const notificationTitle =
      payload.notification?.title || payload.data?.title || 'KEEPING 알림'
    const notificationBody =
      payload.notification?.body ||
      payload.data?.body ||
      '새로운 알림이 있습니다'

    // FCM에서는 data.type 필드로 알림 타입을 받음
    const notificationType = payload.data?.type
    console.log('FCM 백그라운드 알림 타입:', notificationType)

    // 알림 타입에 따른 아이콘 선택
    let icon = '/icons/bell.svg'
    if (['PAYMENT_APPROVED', 'PAYMENT_REQUEST', 'PAYMENT_CANCELED', 'SETTLEMENT_COMPLETED'].includes(notificationType)) {
      icon = '/icons/bell.svg' // 결제 관련 아이콘
    } else if (['POINT_CHARGE', 'PERSONAL_POINT_USE', 'POINT_CANCELED'].includes(notificationType)) {
      icon = '/icons/bell.svg' // 포인트 관련 아이콘
    } else if (notificationType?.includes('GROUP_')) {
      icon = '/icons/bell.svg' // 그룹 관련 아이콘
    }

    // 알림 타입에 따른 URL 설정
    let clickAction = '/notifications'
    if (payload.data?.userType === 'owner') {
      clickAction =
        payload.data?.type === 'PAYMENT'
          ? '/owner/notification'
          : '/owner/dashboard'
    } else if (payload.data?.userType === 'customer') {
      clickAction =
        payload.data?.type === 'PAYMENT'
          ? '/customer/notification'
          : '/customer/dashboard'
    }

    const notificationOptions = {
      body: notificationBody,
      icon: icon,
      badge: '/icons/bell.svg',
      tag: `notification-${payload.data?.userId || Date.now()}`,
      data: {
        ...payload.data,
        clickAction: clickAction,
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'view',
          title: '확인하기',
        },
        {
          action: 'dismiss',
          title: '닫기',
        },
      ],
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200], // 진동 패턴 추가
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
  })
} else {
  console.log(
    'Firebase Messaging이 초기화되지 않아 백그라운드 메시지 리스너를 등록하지 않습니다.'
  )
}

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', event => {
  console.log('알림 클릭됨:', event)

  event.notification.close()

  if (event.action === 'dismiss') {
    // 닫기 버튼 클릭 시 아무것도 하지 않음
    return
  }

  if (event.action === 'view' || !event.action) {
    // 확인하기 버튼 또는 알림 본체 클릭
    const targetUrl =
      event.notification.data?.clickAction || '/owner/notification'

    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then(clientList => {
          // 이미 열린 창 중에서 대상 URL과 일치하는 창 찾기
          for (const client of clientList) {
            if (client.url.includes(targetUrl) && 'focus' in client) {
              return client.focus()
            }
          }

          // 기존 창이 있으면 해당 URL로 이동
          for (const client of clientList) {
            if (
              client.url.includes(self.location.origin) &&
              'navigate' in client
            ) {
              return client.navigate(targetUrl).then(() => client.focus())
            }
          }

          // 새 창 열기
          if (clients.openWindow) {
            return clients.openWindow(targetUrl)
          }
        })
    )
  }
})

// 서비스 워커 설치 이벤트
self.addEventListener('install', event => {
  console.log('Service Worker 설치됨')
  self.skipWaiting()
})

// 서비스 워커 활성화 이벤트
self.addEventListener('activate', event => {
  console.log('Service Worker 활성화됨')
  event.waitUntil(clients.claim())
})
