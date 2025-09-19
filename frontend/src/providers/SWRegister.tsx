'use client'
import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
<<<<<<< HEAD
    // next-pwa가 자동으로 등록하므로 개발 환경에서만 수동 등록
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration)
          
          // 개발 환경에서 알림 권한 요청
          if ('Notification' in window) {
            if (Notification.permission === 'default') {
              console.log('알림 권한 요청 가능')
            }
          }
        })
        .catch(err => console.error('SW registration failed', err))
    }
=======
    // 개발 모드에서는 등록하지 않음
    if (process.env.NODE_ENV === 'development') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('Service Worker registered:', registration)
      })
      .catch(err => console.error('SW registration failed', err))
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
  }, [])

  return null
}
