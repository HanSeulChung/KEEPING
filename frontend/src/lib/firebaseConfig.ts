// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCHbM7Fm03JD_EqLI3xrvNiY3WoFJw1PhM',
  authDomain: 'keeping-6130e.firebaseapp.com',
  projectId: 'keeping-6130e',
  storageBucket: 'keeping-6130e.firebasestorage.app',
  messagingSenderId: '381411579605',
  appId: '1:381411579605:web:bcc34d8ab7481e732cf45c',
  measurementId: 'G-CLZVC2TEN8',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Firebase services initialized only in browser environment
let analytics: any = null
let messaging: any = null

// Initialize Firebase services in browser only
const initializeFirebaseServices = async () => {
  if (typeof window === 'undefined') return

  try {
    if (!analytics) {
      const { getAnalytics, isSupported } = await import('firebase/analytics')
      if (await isSupported()) {
        analytics = getAnalytics(app)
      }
    }

    if (!messaging) {
      const { getMessaging } = await import('firebase/messaging')
      messaging = getMessaging(app)
    }
  } catch (error) {
    console.error('Firebase services initialization failed:', error)
  }
}

// VAPID 키 (88자로 수정)
const VAPID_KEY =
  'BFqS2cYcLd7EkOb_vgyhAnkSKyTkWEs4XwDrphIaYwGPoPpS5Fh3JGDbrpSqGFNM3nvME0XOs8aKw0xLStpJgpU='

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    await initializeFirebaseServices()
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

// FCM 토큰 발급
export async function getFcmToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  try {
    await initializeFirebaseServices()
    if (!messaging) {
      console.warn('Messaging service not initialized')
      return null
    }

    const { getToken } = await import('firebase/messaging')
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token) {
      console.log('FCM 토큰 발급 성공:', token)
      return token
    } else {
      console.warn('토큰을 가져올 수 없음 ❌')
      return null
    }
  } catch (error) {
    console.error('토큰 가져오기 실패:', error)
    return null
  }
}

// 포그라운드 메시지 리스너 설정
export async function setupForegroundMessageListener() {
  if (typeof window === 'undefined') return

  try {
    await initializeFirebaseServices()
    if (!messaging) {
      console.warn('Messaging service not initialized')
      return
    }

    const { onMessage } = await import('firebase/messaging')
    onMessage(messaging, payload => {
      console.log('포그라운드 메시지 수신:', payload)

      // 브라우저 알림 표시
      if (payload.notification) {
        new Notification(payload.notification.title || '알림', {
          body: payload.notification.body,
          icon: '/icons/logo_owner+cust.png',
          badge: '/icons/logo_owner+cust.png',
          tag: payload.data?.notificationId || 'default',
          data: payload.data,
        })
      }
    })
  } catch (error) {
    console.error('Foreground message listener setup failed:', error)
  }
}

// Service Worker 등록
export async function registerServiceWorker(): Promise<boolean> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        {
          scope: '/',
        }
      )

      console.log('Service Worker 등록 성공:', registration)

      // Service Worker가 활성화될 때까지 대기
      await navigator.serviceWorker.ready

      return true
    } catch (error) {
      console.error('Service Worker 등록 실패:', error)
      return false
    }
  }
  return false
}

// Export getters for Firebase services
export const getAnalytics = async () => {
  await initializeFirebaseServices()
  return analytics
}

export const getMessaging = async () => {
  await initializeFirebaseServices()
  return messaging
}

export { app, VAPID_KEY }
