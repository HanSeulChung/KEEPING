'use client'

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { sendPushNotification } from '@/pwa/notification'

const Header = () => {
  const { isLoggedIn, logout } = useAuthStore()
    const router = useRouter()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // 알림 시스템 훅 사용
  const {
    notifications,
    unreadCount,
    isConnected,
    isPermissionGranted,
    requestPermission,
    markAsRead,
    markAllAsRead
  } = useNotificationSystem()

  // 클라이언트 사이드에서만 마운트 상태 설정
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 알림 권한 요청
  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      alert('알림 권한이 허용되었습니다!')
    } else {
      alert('알림 권한이 거부되었습니다. 브라우저 설정에서 수동으로 허용해주세요.')
    }
  }

  // 테스트 알림 발송
  const handleTestNotification = async () => {
    try {
      // HTTPS가 아닌 경우 기본 Notification API 사용
      if (!window.isSecureContext) {
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('KEEPING 테스트 알림', {
              body: 'HTTP 환경에서도 알림이 작동합니다!',
              icon: '/icons/qr.png'
            })
          } else if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
              new Notification('KEEPING 테스트 알림', {
                body: 'HTTP 환경에서도 알림이 작동합니다!',
                icon: '/icons/qr.png'
              })
            }
          } else {
            alert('알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.')
          }
        } else {
          alert('이 브라우저는 알림을 지원하지 않습니다.')
        }
        return
      }

      // HTTPS 환경에서는 PWA 알림 사용
      await sendPushNotification({
        title: 'KEEPING 테스트 알림',
        body: 'PWA 알림이 정상적으로 작동합니다!',
        icon: '/icons/qr.png',
        tag: 'test-notification'
      })
    } catch (error) {
      console.error('테스트 알림 발송 실패:', error)
      alert('알림 발송에 실패했습니다. 알림 권한을 확인해주세요.')
    }
  }

  return (
    <header className="w-full bg-white border-t border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 왼쪽: 뒤로가기 버튼 */}
                <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5" 
                viewBox="0 0 11 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M8.81665 14.75L0.81665 7.5L8.81665 0.25L10.6833 1.94167L4.54998 7.5L10.6833 13.0583L8.81665 14.75Z" 
                  fill="#1D1B20" 
                />
              </svg>
                    </button>
                </div>

          {/* 중앙: 로고 */}
          <div className="flex-1 flex justify-center">
            <button 
              onClick={() => router.push('/owner/dashboard')}
              className="text-lg sm:text-xl font-['Tenada'] font-extrabold text-black hover:text-gray-600 transition-colors"
            >
                        KEEPING
            </button>
                </div>

          {/* 오른쪽: 로그인/로그아웃 버튼과 알림 */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={isLoggedIn ? logout : () => router.push('/owner/login')}
              className="hidden sm:flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-['nanumsquare'] font-bold text-black border border-black bg-white hover:bg-gray-50 transition-colors"
            >
              {isLoggedIn ? '로그아웃' : '로그인'}
            </button>
            
            {/* 알림 아이콘 */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative flex items-center justify-center px-3 py-1.5 border border-black bg-white hover:bg-gray-50 transition-colors"
                title={isConnected ? '알림 연결됨' : '알림 연결 끊김'}
              >
                <svg 
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${isConnected ? 'text-green-600' : 'text-gray-400'}`}
                  viewBox="0 0 18 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M7.30615 17.335C7.45244 17.5883 7.66283 17.7987 7.91619 17.945C8.16955 18.0912 8.45694 18.1682 8.74949 18.1682C9.04203 18.1682 9.32943 18.0912 9.58278 17.945C9.83614 17.7987 10.0465 17.5883 10.1928 17.335" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M1.46772 12.607C1.35886 12.7263 1.28702 12.8747 1.26094 13.0341C1.23486 13.1934 1.25566 13.357 1.32081 13.5048C1.38597 13.6526 1.49267 13.7782 1.62794 13.8665C1.7632 13.9548 1.92121 14.0018 2.08272 14.002H15.4161C15.5776 14.002 15.7356 13.9551 15.8709 13.867C16.0063 13.7789 16.1131 13.6534 16.1785 13.5057C16.2438 13.358 16.2648 13.1945 16.2389 13.0351C16.2131 12.8757 16.1414 12.7272 16.0327 12.6078C14.9244 11.4653 13.7494 10.2511 13.7494 6.50195C13.7494 5.17587 13.2226 3.9041 12.2849 2.96642C11.3472 2.02874 10.0755 1.50195 8.74939 1.50195C7.42331 1.50195 6.15154 2.02874 5.21386 2.96642C4.27618 3.9041 3.74939 5.17587 3.74939 6.50195C3.74939 10.2511 2.57356 11.4653 1.46772 12.607Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                {/* 알림 배지 */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {unreadCount}
                  </span>
                )}
                {/* 연결 상태 표시 */}
                <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </button>

              {/* 알림 드롭다운 */}
              {isMounted && isNotificationOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-black shadow-lg z-50">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-['nanumsquare'] font-bold text-sm text-black">알림</h3>
                      <div className="flex items-center gap-2">
                        {!isPermissionGranted && (
                          <button
                            onClick={handleRequestPermission}
                            className="text-xs text-blue-600 hover:text-blue-800 font-['nanumsquare']"
                          >
                            권한 요청
                                </button>
                            )}
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <>
                        {/* 최근 4개 알림만 표시 */}
                        {notifications.slice(0, 4).map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-['nanumsquare'] font-bold text-sm text-black mb-1">
                                  {notification.title}
                                </h4>
                                <p className="font-['nanumsquare'] text-xs text-gray-600 mb-1">
                                  {notification.message}
                                </p>
                                <p className="font-['nanumsquare'] text-xs text-gray-400">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* 이전 내역 보기 버튼 */}
                        {notifications.length > 4 && (
                          <div className="p-3 border-t border-gray-200">
                                <button 
                              onClick={() => {
                                router.push('/owner/notification')
                                setIsNotificationOpen(false)
                              }}
                              className="w-full text-center font-['nanumsquare'] text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              이전 내역 보기 ({notifications.length - 4}개 더)
                                </button>
                          </div>
                            )}
                        </>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="font-['nanumsquare'] text-sm text-gray-500">새로운 알림이 없습니다</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200 space-y-2">
                    <button 
                      onClick={() => {
                        router.push('/owner/notification')
                        setIsNotificationOpen(false)
                      }}
                      className="w-full text-center font-['nanumsquare'] text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      모든 알림 보기
                    </button>
                    <button
                      onClick={handleTestNotification}
                      className="w-full text-center font-['nanumsquare'] text-xs text-green-600 hover:text-green-800 transition-colors"
                    >
                      테스트 알림 발송
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="w-full text-center font-['nanumsquare'] text-xs text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        모두 읽음 처리
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 모바일에서만 표시되는 로그인 버튼 */}
            <button className="sm:hidden flex items-center justify-center px-2 py-1 text-xs font-['nanumsquare'] font-bold text-black border border-black bg-white hover:bg-gray-50 transition-colors">
              {isLoggedIn ? '로그아웃' : '로그인'}
            </button>
          </div>
        </div>
      </div>
    </header>
    )
}

export default Header