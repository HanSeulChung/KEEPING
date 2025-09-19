'use client'
import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    // next-pwa가 자동으로 등록하므로 개발 환경에서만 수동 등록
    if (
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'development'
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
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
  }, [])

  return null
}
