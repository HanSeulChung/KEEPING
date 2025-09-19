'use client'
import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    // 개발 모드에서는 등록하지 않음
    if (process.env.NODE_ENV === 'development') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('Service Worker registered:', registration)
      })
      .catch(err => console.error('SW registration failed', err))
  }, [])

  return null
}
