// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Firebase 앱 인스턴스 (지연 초기화)
let app: any = null
let messaging: any = null
let analytics: any = null

// Firebase 초기화 함수 (브라우저에서만 실행)
const initializeFirebase = async () => {
  if (typeof window === 'undefined') {
    return { app: null, messaging: null, analytics: null }
  }

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app')
    const { getMessaging } = await import('firebase/messaging')
    const { getAnalytics } = await import('firebase/analytics')

    if (!app) {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig)
      } else {
        app = getApp()
      }
    }

    if (!messaging) {
      messaging = getMessaging(app)
    }

    if (!analytics) {
      analytics = getAnalytics(app)
    }

    return { app, messaging, analytics }
  } catch (error) {
    console.error('Firebase 초기화 실패:', error)
    return { app: null, messaging: null, analytics: null }
  }
}

// 지연 초기화된 Firebase 서비스들
export const getFirebaseApp = async () => {
  const { app } = await initializeFirebase()
  return app
}

export const getFirebaseMessaging = async () => {
  const { messaging } = await initializeFirebase()
  return messaging
}

export const getFirebaseAnalytics = async () => {
  const { analytics } = await initializeFirebase()
  return analytics
}

// VAPID Key for FCM (두 환경변수 모두 지원)
const VAPID_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_KEY

// FCM 토큰 발급 함수 (개발 환경에서 에러 처리 개선)
export const getFcmToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    console.warn('브라우저 환경이 아님')
    return null
  }

  // 기본 환경 체크
  if (!('serviceWorker' in navigator)) {
    console.warn('이 브라우저는 Service Worker를 지원하지 않습니다')
    return null
  }

  if (!VAPID_KEY) {
    console.error('VAPID 키가 설정되지 않았습니다')
    return null
  }

  try {
    const messaging = await getFirebaseMessaging()
    if (!messaging) {
      if (process.env.NODE_ENV === 'development') {
        console.log('개발 환경: Firebase messaging 초기화 실패 (무시됨)')
      } else {
        console.warn('messaging이 초기화되지 않음')
      }
      return null
    }

    const { getToken } = await import('firebase/messaging')

    // 서비스워커 등록을 더 안정적으로 처리
    let registration: ServiceWorkerRegistration | undefined
    try {
      // 1. firebase-messaging-sw.js 전용 등록 확인
      registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')

      // 2. 없으면 firebase-messaging-sw.js 등록 시도
      if (!registration) {
        try {
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
          await registration.update() // 즉시 업데이트
        } catch (registerError) {
          console.warn('firebase-messaging-sw.js 등록 실패:', registerError)
          // 3. 기본 서비스워커 사용
          registration = await navigator.serviceWorker.ready
        }
      }
    } catch (swError) {
      console.warn('Service Worker 처리 실패:', swError)
      return null
    }

    // FCM 토큰 가져오기 (재시도 로직 포함)
    let token: string | null = null
    let attempts = 0
    const maxAttempts = 3

    while (!token && attempts < maxAttempts) {
      attempts++
      try {
        token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        })

        if (token) {
          console.log(`FCM 토큰 획득 성공 (${attempts}번째 시도):`, token.substring(0, 20) + '...')
          return token
        } else {
          console.warn(`FCM 토큰 가져오기 실패 (${attempts}번째 시도)`)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)) // 지수 백오프
          }
        }
      } catch (tokenError) {
        console.warn(`FCM 토큰 요청 에러 (${attempts}번째 시도):`, tokenError)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경: FCM 토큰 없음 (무시됨)')
    } else {
      console.error('FCM 토큰을 가져올 수 없습니다. VAPID 키와 Service Worker를 확인하세요.')
    }
    return null

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경: FCM 토큰 가져오기 실패 (무시됨):', message)
    } else {
      console.error('FCM 토큰 가져오기 실패:', err)
    }
    return null
  }
}

// 알림 권한 요청 함수
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('브라우저가 알림을 지원하지 않음')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      console.log('알림 권한 허용됨 ✅')
      return true
    } else {
      console.warn('알림 권한 거부됨 ❌')
      return false
    }
  } catch (error) {
    console.error('알림 권한 요청 실패:', error)
    return false
  }
}

// 포그라운드 메시지 수신 처리 (SSE와 함께 사용)
export const setupForegroundMessageListener = async () => {
  if (typeof window === 'undefined') {
    console.warn('브라우저 환경이 아님')
    return
  }

  try {
    const messaging = await getFirebaseMessaging()
    if (!messaging) {
      console.warn('messaging이 초기화되지 않음')
      return
    }

    const { onMessage } = await import('firebase/messaging')
    onMessage(messaging, payload => {
      console.log('포그라운드 FCM 메시지 수신 (SSE와 중복이므로 무시):', payload)

      // 포그라운드에서는 SSE로 처리하므로 FCM 메시지는 무시
      // SSE가 더 빠르고 실시간성이 좋기 때문
    })
  } catch (error) {
    console.error('포그라운드 메시지 리스너 설정 실패:', error)
  }
}

export default app
