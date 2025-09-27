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

    // 알림 내용 구성 (민감한 정보 보호)
    const notificationType = payload.data?.type
    const storeName = payload.data?.storeName || payload.data?.storeNameKr
    const amount = payload.data?.amount || payload.data?.price
    const customerName = payload.data?.customerName || payload.data?.receiverName
    const groupName = payload.data?.groupName

    // 민감한 정보 마스킹 함수
    const maskStoreName = (name) => {
      if (!name) return '매장'
      if (name.length <= 2) return name
      return name.substring(0, 2) + '*'.repeat(Math.max(1, name.length - 2))
    }

    const maskCustomerName = (name) => {
      if (!name) return '고객'
      if (name.length <= 1) return name
      return name.substring(0, 1) + '*'.repeat(name.length - 1)
    }

    const formatAmount = (amount) => {
      if (!amount) return ''
      const num = parseInt(amount)
      if (num >= 100000) {
        return `${Math.floor(num / 10000)}만원`
      } else if (num >= 10000) {
        return `${Math.floor(num / 1000)}천원`
      } else {
        return `${num.toLocaleString()}원`
      }
    }

    // 알림 제목과 내용 구성 (민감한 정보 보호)
    let notificationTitle = 'KEEPING 알림'
    let notificationBody = '새로운 알림이 있습니다'

    switch (notificationType) {
      case 'PAYMENT_APPROVED':
        notificationTitle = '💳 결제 승인됨'
        notificationBody = storeName 
          ? `${maskStoreName(storeName)}에서 ${amount ? formatAmount(amount) : '결제'} 승인`
          : '결제가 승인되었습니다'
        break
      case 'PAYMENT_REQUEST':
        notificationTitle = '💰 결제 요청'
        notificationBody = storeName 
          ? `${maskStoreName(storeName)}에서 ${amount ? formatAmount(amount) : '결제'} 요청`
          : '결제 요청이 있습니다'
        break
      case 'POINT_CHARGE':
        notificationTitle = '💎 포인트 충전'
        notificationBody = amount 
          ? `${formatAmount(amount)}이 충전되었습니다`
          : '포인트가 충전되었습니다'
        break
      case 'GROUP_PAYMENT_APPROVED':
        notificationTitle = '👥 그룹 결제 승인'
        notificationBody = groupName && storeName
          ? `[${groupName}] ${maskStoreName(storeName)}에서 ${amount ? formatAmount(amount) : '결제'} 승인`
          : '그룹 결제가 승인되었습니다'
        break
      case 'GROUP_INVITATION':
        notificationTitle = '👥 그룹 초대'
        notificationBody = groupName 
          ? `[${groupName}] 그룹에 초대되었습니다`
          : '새로운 그룹에 초대되었습니다'
        break
      default:
        notificationTitle = payload.notification?.title || payload.data?.title || 'KEEPING 알림'
        notificationBody = payload.notification?.body || payload.data?.body || '새로운 알림이 있습니다'
    }

    // 알림 타입별 아이콘, 배지, 색상 설정
    let icon = '/icons/bell.svg'
    let badge = '/icons/badge-personal.svg'
    let category = 'default'
    let color = '#000000'
    
    // 결제 관련 알림
    if (['PAYMENT_APPROVED', 'PAYMENT_REQUEST', 'PAYMENT_CANCELED', 'SETTLEMENT_COMPLETED'].includes(notificationType)) {
      icon = '/icons/qr.png'
      badge = '/icons/badge-personal.svg'
      category = 'payment'
      color = '#22c55e' // 초록색 - 결제 승인
      if (notificationType === 'PAYMENT_REQUEST') {
        color = '#f59e0b' // 주황색 - 결제 요청
      } else if (notificationType === 'PAYMENT_CANCELED') {
        color = '#ef4444' // 빨간색 - 결제 취소
      }
    }
    // 포인트 관련 알림
    else if (['POINT_CHARGE', 'PERSONAL_POINT_USE', 'POINT_CANCELED'].includes(notificationType)) {
      icon = '/icons/qr.png'
      badge = '/icons/badge-personal.svg'
      category = 'point'
      color = '#8b5cf6' // 보라색 - 포인트
    }
    // 그룹 관련 알림
    else if (notificationType?.includes('GROUP_')) {
      icon = '/icons/qr.png'
      badge = '/icons/badge-group.svg'
      category = 'group'
      color = '#06b6d4' // 청록색 - 그룹
    }
    // 주문 관련 알림
    else if (notificationType?.includes('ORDER_')) {
      icon = '/icons/qr.png'
      badge = '/icons/badge-personal.svg'
      category = 'order'
      color = '#3b82f6' // 파란색 - 주문
    }
    // 기타 알림
    else {
      icon = '/icons/bell.svg'
      badge = '/icons/badge-personal.svg'
      category = 'default'
      color = '#6b7280' // 회색 - 기본
    }

    // 사용자 타입에 따른 이동 경로 설정
    let clickAction = '/notifications'
    if (payload.data?.userType === 'owner' || payload.data?.receiverType === 'OWNER') {
      clickAction = '/owner/notification'
    } else if (payload.data?.userType === 'customer' || payload.data?.receiverType === 'CUSTOMER') {
      clickAction = '/customer/notification'
    }

    // 알림 타입별 진동 패턴 설정
    let vibratePattern = [200, 100, 200] // 기본 진동
    if (category === 'payment') {
      vibratePattern = [300, 100, 300, 100, 300] // 결제 알림 - 긴 진동
    } else if (category === 'group') {
      vibratePattern = [200, 100, 200, 100, 200] // 그룹 알림 - 중간 진동
    } else if (category === 'point') {
      vibratePattern = [150, 50, 150] // 포인트 알림 - 짧은 진동
    }

    const notificationOptions = {
      body: notificationBody,
      icon: icon,
      badge: badge,
      tag: `notification-${payload.data?.notificationId || Date.now()}`,
      data: {
        // 민감한 정보는 마스킹하여 저장
        type: notificationType,
        category: category,
        color: color,
        clickAction: clickAction,
        timestamp: Date.now(),
        storeName: maskStoreName(storeName),
        amount: formatAmount(amount),
        customerName: maskCustomerName(customerName),
        groupName: groupName, // 그룹명은 상대적으로 덜 민감
        // 원본 데이터는 제거하여 보안 강화
      },
      actions: getNotificationActions(notificationType, category),
      requireInteraction: ['PAYMENT_REQUEST', 'GROUP_INVITATION'].includes(notificationType), // 중요한 알림만 상호작용 요구
      silent: false,
      vibrate: vibratePattern,
      timestamp: Date.now(),
      renotify: true,
    }

    // 알림 타입별 액션 버튼 설정
    function getNotificationActions(type, category) {
      const baseActions = [
        {
          action: 'view',
          title: '확인하기',
        },
        {
          action: 'dismiss',
          title: '닫기',
        },
      ]

      // 결제 요청의 경우 특별한 액션 추가
      if (type === 'PAYMENT_REQUEST') {
        return [
          {
            action: 'approve',
            title: '승인하기',
          },
          {
            action: 'view',
            title: '자세히 보기',
          },
          {
            action: 'dismiss',
            title: '닫기',
          },
        ]
      }

      // 그룹 초대의 경우 특별한 액션 추가
      if (type === 'GROUP_INVITATION') {
        return [
          {
            action: 'accept',
            title: '수락하기',
          },
          {
            action: 'view',
            title: '자세히 보기',
          },
          {
            action: 'dismiss',
            title: '닫기',
          },
        ]
      }

      return baseActions
    }

    console.log('백그라운드 알림 표시:', { notificationTitle, notificationBody, notificationOptions })
    self.registration.showNotification(notificationTitle, notificationOptions)
  })
} else {
  console.log(
    'Firebase Messaging이 초기화되지 않아 백그라운드 메시지 리스너를 등록하지 않습니다.'
  )
}

// 알림 클릭 이벤트 처리 (모바일 최적화)
self.addEventListener('notificationclick', event => {
  console.log('알림 클릭됨:', event)
  console.log('알림 데이터:', event.notification.data)

  event.notification.close()

  if (event.action === 'dismiss') {
    // 닫기 버튼 클릭 시 아무것도 하지 않음
    return
  }

  // 특별한 액션 처리 (승인, 수락 등)
  if (event.action === 'approve' || event.action === 'accept') {
    console.log(`특별 액션 실행: ${event.action}`)
    // 서버에 액션 결과 전송
    event.waitUntil(
      fetch('/api/notifications/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: event.action,
          notificationId: notificationData.notificationId,
          timestamp: Date.now(),
        }),
      }).catch(error => {
        console.error('액션 처리 실패:', error)
      })
    )
  }

  if (event.action === 'view' || event.action === 'approve' || event.action === 'accept' || !event.action) {
    // 확인하기 버튼 또는 알림 본체 클릭
    const notificationData = event.notification.data || {}
    const targetUrl = notificationData.clickAction || '/owner/notification'
    const storeName = notificationData.storeName
    const amount = notificationData.amount
    const notificationType = notificationData.type

    console.log('알림 클릭 - 이동할 URL:', targetUrl)
    console.log('알림 정보:', { storeName, amount, notificationType })

    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then(clientList => {
          // PWA가 이미 열려있는 경우
          for (const client of clientList) {
            if (client.url.includes(self.location.origin)) {
              // 알림 데이터를 전달하며 해당 페이지로 이동
              const messageData = {
                type: 'NOTIFICATION_CLICK',
                notificationData: notificationData,
                targetUrl: targetUrl,
                storeName: storeName,
                amount: amount,
                notificationType: notificationType,
              }
              
              client.postMessage(messageData)
              return client.focus().then(() => {
                // URL 이동
                if ('navigate' in client) {
                  return client.navigate(targetUrl)
                }
              })
            }
          }

          // 새 창 열기 (모바일 PWA 최적화)
          if (clients.openWindow) {
            const fullUrl = new URL(targetUrl, self.location.origin).href
            return clients.openWindow(fullUrl)
          }
        })
        .catch(error => {
          console.error('알림 클릭 처리 오류:', error)
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
