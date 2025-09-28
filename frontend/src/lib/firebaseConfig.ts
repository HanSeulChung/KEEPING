// Import the functions you need from the SDKs you need
import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

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
const analytics = getAnalytics(app)
const messaging = getMessaging(app)

// VAPID 키 (88자로 수정)
const VAPID_KEY =
  'BFqS2cYcLd7EkOb_vgyhAnkSKyTkWEs4XwDrphIaYwGPoPpS5Fh3JGDbrpSqGFNM3nvME0XOs8aKw0xLStpJgpU='

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
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

// FCM 토큰 발급
export async function getFcmToken(): Promise<string | null> {
  try {
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
export function setupForegroundMessageListener() {
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

export { analytics, app, messaging, VAPID_KEY }
