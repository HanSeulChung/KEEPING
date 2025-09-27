'use client'

import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
import { getNotificationIcon } from '@/types/notification'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  IoCheckmarkCircle,
  IoNotifications
} from 'react-icons/io5'

type NotificationSetting = {
  id: string
  name: string
  enabled: boolean
}

const NotificationPage = () => {
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    fcmToken,
    isConnected,
  } = useNotificationSystem()

  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'PAYMENT_CATEGORY', name: '결제/정산 알림', enabled: true },
    { id: 'GROUP_CATEGORY', name: '모임 관련 알림', enabled: true },
  ])
  const [loading, setLoading] = useState(true)
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(3) // 한 페이지당 3개 알림

  // URL 파라미터에서 가게 정보 가져오기
  const storeId = searchParams.get('storeId')
  const accountName = searchParams.get('accountName')

  useEffect(() => {
    // 브라우저 알림 권한 상태 확인
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    // 개발 환경에서 FCM 에러 처리 안내
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '개발 환경: Firebase/FCM 에러는 무시됩니다. 실제 푸시 알림 기능은 운영 환경에서 작동합니다.'
      )
    }

    setLoading(false)
  }, [])

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않습니다.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === 'granted') {
        // 권한 허용 시 테스트 알림 보내기
        new Notification('알림 설정 완료', {
          body: '이제 실시간 알림을 받을 수 있습니다!',
          icon: '/icons/qr.png',
          badge: '/icons/qr.png',
        })
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
    }
  }

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    )
  }

  // 테스트 알림 전송 로직 제거

  // 알림 타입별 아이콘 (이모지 기반)
  const getNotificationIconComponent = (type: string) => {
    const iconEmoji = getNotificationIcon(type as any)
    return (
      <div className="text-2xl flex items-center justify-center w-8 h-8">
        {iconEmoji}
      </div>
    )
  }

  // 시간 포맷팅
  const formatTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now.getTime() - time.getTime()) / (1000 * 60)) // 분 단위

    if (diff < 1) return '방금 전'
    if (diff < 60) return `${diff}분 전`
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`
    return `${Math.floor(diff / 1440)}일 전`
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(notifications.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize
  const currentNotifications = notifications.slice(startIndex, endIndex)

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex h-64 items-center justify-center">
          <div className="font-['nanumsquare'] text-lg">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 네이티브 헤더 */}
      <div className="safe-area-top sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 py-3">
          <div className="flex h-11 items-center justify-center">
            <h1 className="font-['nanumsquare'] text-lg font-bold text-black">
              알림 설정
            </h1>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="pb-safe">
        {/* 알림 권한 상태 */}
        <div className="mb-8">
          {notificationPermission !== 'granted' && (
            <div className="rounded-lg border border-orange-300 bg-orange-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1"></div>
                <div className="ml-4">
                  {notificationPermission === 'default' ? (
                    <button
                      onClick={requestNotificationPermission}
                      className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-['nanumsquare'] text-sm font-bold text-white transition-colors hover:bg-orange-700"
                    >
                      <IoCheckmarkCircle />
                      알림 허용하기
                    </button>
                  ) : notificationPermission === 'denied' ? (
                    <button
                      onClick={() => {
                        alert(
                          '브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 알림을 허용해주세요.'
                        )
                      }}
                      className="rounded-lg bg-gray-600 px-4 py-2 font-['nanumsquare'] text-sm font-bold text-white transition-colors hover:bg-gray-700"
                    >
                      설정 방법 보기
                    </button>
                  ) : (
                    <button
                      onClick={requestNotificationPermission}
                      className="rounded-lg bg-blue-600 px-4 py-2 font-['nanumsquare'] text-sm font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      다시 시도
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 알림 통계 */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-keeping-beige rounded-lg border border-black p-4 text-center">
            <div className="font-['Tenada'] text-2xl font-extrabold text-black">
              {unreadCount}
            </div>
            <div className="font-['nanumsquare'] text-sm text-gray-600">
              읽지 않은 알림
            </div>
          </div>
          <div className="rounded-lg border border-black bg-white p-4 text-center">
            <div className="font-['Tenada'] text-2xl font-extrabold text-black">
              {notifications.length}
            </div>
            <div className="font-['nanumsquare'] text-sm text-gray-600">
              전체 알림
            </div>
          </div>
          <div className="rounded-lg border border-black bg-white p-4 text-center">
            <div className="font-['Tenada'] text-2xl font-extrabold text-black">
              {
                notifications.filter(n => {
                  const today = new Date()
                  const notificationDate = new Date(n.timestamp)
                  return (
                    notificationDate.toDateString() === today.toDateString()
                  )
                }).length
              }
            </div>
            <div className="font-['nanumsquare'] text-sm text-gray-600">
              오늘 알림
            </div>
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="mb-8 rounded-lg border border-black bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-['Tenada'] text-xl font-extrabold text-black">
                알림 목록
              </h3>
              {notifications.length > 0 && (
                <span className="font-['nanumsquare'] text-sm text-gray-500">
                  총 {notifications.length}개 ({currentPage + 1}/{totalPages}{' '}
                  페이지)
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-200"
              >
                모두 읽음
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">
                <IoNotifications className="mx-auto text-gray-300" />
              </div>
              <div className="font-['nanumsquare'] text-gray-500">
                알림이 없습니다
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {currentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      notification.isRead
                        ? 'border-gray-200 bg-white'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                    onClick={() => {
                      if (notification.id && !isNaN(Number(notification.id))) {
                        markAsRead(Number(notification.id))
                      } else {
                        console.error('유효하지 않은 notification.id:', notification.id)
                      }
                    }}
                  >
                    <div className="mt-1">
                      {getNotificationIconComponent(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-['nanumsquare'] text-sm font-bold ${
                          notification.isRead ? 'text-gray-700' : 'text-black'
                        }`}
                      >
                        {notification.title}
                      </div>
                      <div className="mt-1 font-['nanumsquare'] text-xs break-words text-gray-600">
                        {notification.message}
                      </div>
                      <div className="mt-2 font-['nanumsquare'] text-xs text-gray-400">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="h-3 w-3 flex-shrink-0 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`rounded-lg border px-3 py-2 font-['nanumsquare'] text-sm font-bold transition-colors ${
                      currentPage === 0
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    이전
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`h-10 w-10 rounded-lg font-['nanumsquare'] text-sm font-bold transition-colors ${
                          currentPage === i
                            ? 'bg-black text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={`rounded-lg border px-3 py-2 font-['nanumsquare'] text-sm font-bold transition-colors ${
                      currentPage === totalPages - 1
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 알림 설정 */}
        <div className="rounded-lg border border-black bg-white p-6">
          <h3 className="mb-2 font-['Tenada'] text-xl font-extrabold text-black">
            알림 설정
          </h3>
          <p className="mb-4 font-['nanumsquare'] text-sm text-gray-600">
            비활성화하면 브라우저 팝업 알림만 안 뜹니다. 목록에는 계속
            표시됩니다.
          </p>

          <div className="space-y-3">
            {settings.map(setting => (
              <div
                key={setting.id}
                className="flex items-center justify-between rounded-lg border border-gray-300 p-3"
              >
                <div className="flex-1">
                  <span className="font-['nanumsquare'] text-sm font-bold text-black">
                    {setting.name}
                  </span>
                  <div className="mt-1 font-['nanumsquare'] text-xs text-gray-500">
                    {setting.enabled
                      ? '팝업 알림 + 목록 표시'
                      : '목록에만 표시 (팝업 없음)'}
                  </div>
                </div>
                <div className="flex h-8 items-center">
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className="flex h-8 overflow-hidden rounded-lg border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {/* OFF 버튼 */}
                    <div
                      className={`flex h-full w-12 items-center justify-center transition-all duration-200 ${
                        !setting.enabled
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-['nanumsquare'] text-xs font-bold">
                        OFF
                      </span>
                    </div>

                    {/* ON 버튼 */}
                    <div
                      className={`flex h-full w-12 items-center justify-center transition-all duration-200 ${
                        setting.enabled
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-['nanumsquare'] text-xs font-bold">
                        ON
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPage
