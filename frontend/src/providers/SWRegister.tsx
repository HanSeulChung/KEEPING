'use client'
import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    // 개발 환경에서는 SW 등록 비활성화 (production에서만 활성화)
    if (
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('Service Worker registered:', registration)

          // 알림 권한 요청
          if ('Notification' in window) {
            if (Notification.permission === 'default') {
              console.log('알림 권한 요청 가능')
            }
          }
        })
        .catch(err => console.error('SW registration failed', err))
    } else if (process.env.NODE_ENV === 'development') {
      console.log('개발 모드: Service Worker 등록 비활성화')
    }
  }, [])

  return null
}
