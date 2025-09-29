'use client'
import { useEffect, useState } from 'react'

export default function SWRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')

  useEffect(() => {
    // 개발 환경에서는 SW 등록 비활성화 (production에서만 활성화)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('Service Worker registered:', registration)

          // 업데이트 감지
          registration.addEventListener('updatefound', () => {
            console.log('새로운 Service Worker 업데이트 발견')
          })

          // 알림 권한 요청
          if ('Notification' in window) {
            if (Notification.permission === 'default') {
              console.log('알림 권한 요청 가능')
            }
          }
        })
        .catch(err => console.error('SW registration failed', err))

      // Service Worker 메시지 수신
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'SW_UPDATED') {
          console.log('Service Worker 업데이트 알림:', event.data)
          setUpdateMessage(event.data.message)
          setUpdateAvailable(true)

          // 3초 후 자동으로 알림 숨기기
          setTimeout(() => {
            setUpdateAvailable(false)
          }, 5000)
        }
      })
    } else if (process.env.NODE_ENV === 'development') {
      console.log('개발 모드: Service Worker 등록 비활성화')
    }
  }, [])

  return (
    <>
      {/* PWA 업데이트 알림 */}
      {updateAvailable && (
        <div className="fixed top-4 right-4 z-50 max-w-sm rounded-lg bg-green-500 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">앱 업데이트 완료!</p>
              <p className="text-sm opacity-90">{updateMessage}</p>
            </div>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="ml-4 rounded-full p-1 hover:bg-green-600"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
