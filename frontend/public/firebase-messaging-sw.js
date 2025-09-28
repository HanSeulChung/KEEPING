// Service Worker: 반드시 public/ 디렉토리에 위치해야 함
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCHbM7Fm03JD_EqLI3xrvNiY3WoFJw1PhM',
  authDomain: 'keeping-6130e.firebaseapp.com',
  projectId: 'keeping-6130e',
  storageBucket: 'keeping-6130e.firebasestorage.app',
  messagingSenderId: '381411579605',
  appId: '1:381411579605:web:bcc34d8ab7481e732cf45c',
  measurementId: 'G-CLZVC2TEN8',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  console.log('백그라운드 메시지 수신:', payload)

  const notificationTitle = payload.notification?.title || '알림'
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/logo_owner+cust.png',
    badge: '/icons/logo_owner+cust.png',
    tag: payload.data?.notificationId || 'default',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: '열기',
      },
      {
        action: 'close',
        title: '닫기',
      },
    ],
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', event => {
  console.log('알림 클릭:', event)

  event.notification.close()

  if (event.action === 'open') {
    // 앱 열기
    event.waitUntil(clients.openWindow('/'))
  } else if (event.action === 'close') {
    // 알림 닫기 (아무것도 하지 않음)
    return
  } else {
    // 기본 동작: 앱 열기
    event.waitUntil(clients.openWindow('/'))
  }
})
