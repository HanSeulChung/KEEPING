'use client'

import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  IoBatteryCharging,
  IoCard,
  IoCheckmarkCircle,
  IoMegaphone,
  IoNotifications,
  IoSettings,
  IoWallet,
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
    addNotification,
    addNotificationWithSettings,
    fcmToken,
    isConnected,
  } = useNotificationSystem()

  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'PAYMENT', name: '결제 알림', enabled: true },
    { id: 'CHARGE', name: '충전 알림', enabled: true },
    { id: 'STORE_PROMOTION', name: '매장 프로모션 알림', enabled: true },
    { id: 'PREPAYMENT_PURCHASE', name: '선결제 구매 알림', enabled: true },
    { id: 'SYSTEM', name: '시스템 알림', enabled: false },
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

  // 테스트 알림 전송 함수들
  const sendTestNotification = (
    type:
      | 'PAYMENT'
      | 'CHARGE'
      | 'STORE_PROMOTION'
      | 'PREPAYMENT_PURCHASE'
      | 'SYSTEM'
  ) => {
    // 해당 타입의 알림이 비활성화되어 있으면 알림 목록에만 추가하고 브라우저 알림은 표시하지 않음
    const setting = settings.find(s => s.id === type)
    const isEnabled = setting?.enabled ?? true

    const testMessages = {
      PAYMENT: {
        title: '새로운 결제가 완료되었습니다',
        message: '김철수님이 15,000원을 결제했습니다',
      },
      CHARGE: {
        title: '충전이 완료되었습니다',
        message: '50,000원이 충전되었습니다',
      },
      STORE_PROMOTION: {
        title: '매장 프로모션이 시작되었습니다',
        message: '20% 할인 이벤트가 시작되었습니다',
      },
      PREPAYMENT_PURCHASE: {
        title: '선결제 구매가 완료되었습니다',
        message: '이영희님이 선결제 상품을 구매했습니다',
      },
      SYSTEM: {
        title: '시스템 알림',
        message: '시스템 점검이 완료되었습니다',
      },
    }

    const message = testMessages[type]

    // 알림 목록에는 항상 추가하되, 설정에 따라 브라우저 알림 제어
    addNotificationWithSettings(
      {
        type,
        title: message.title,
        message: message.message,
        data: { storeId: accountName || 'test-store' },
      },
      isEnabled && notificationPermission === 'granted' // 설정 활성화 + 권한 허용 시에만 브라우저 알림
    )

    // 로그 출력
    if (isEnabled) {
      if (notificationPermission === 'granted') {
        console.log(`${type} 테스트 알림 전송 완료 (목록 + 브라우저 알림)`)
      } else if (notificationPermission === 'denied') {
        console.log(`${type} 알림 목록에 추가됨 (브라우저 알림 권한 거부됨)`)
      } else {
        console.log(`${type} 알림 목록에 추가됨 (브라우저 알림 권한 필요)`)
      }
    } else {
      console.log(
        `${type} 알림이 목록에 추가됨 (브라우저 알림은 설정에 의해 비활성화)`
      )
    }
  }

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: string) => {
    const iconClass = 'text-2xl'
    switch (type) {
      case 'PAYMENT':
        return <IoCard className={`${iconClass} text-green-600`} />
      case 'CHARGE':
        return <IoBatteryCharging className={`${iconClass} text-blue-600`} />
      case 'STORE_PROMOTION':
        return <IoMegaphone className={`${iconClass} text-purple-600`} />
      case 'PREPAYMENT_PURCHASE':
        return <IoWallet className={`${iconClass} text-orange-600`} />
      case 'SYSTEM':
        return <IoSettings className={`${iconClass} text-gray-600`} />
      default:
        return <IoNotifications className={`${iconClass} text-blue-600`} />
    }
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
    <div className="min-h-screen bg-white">
      {/* 메인 컨텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 가게 정보 표시 */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-full max-w-4xl rounded-lg border border-black bg-white p-8">
            <h1 className="mb-4 text-center font-['Tenada'] text-2xl font-extrabold text-black sm:text-3xl lg:text-4xl">
              {accountName ? `${accountName} 알림` : '정동수 부동산 알림'}
            </h1>
            <p className="text-center font-['nanumsquare'] text-base text-gray-600 sm:text-lg">
              이 가게와 관련된 알림만 표시됩니다
            </p>
          </div>
        </div>

        {/* 알림 권한 상태 */}
        <div className="mb-8">
          {/* 디버그 정보 */}
          <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4">
            <h4 className="mb-2 font-['nanumsquare'] text-sm font-bold text-gray-700">
              연동 상태 (디버그)
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <p className="font-['nanumsquare'] text-gray-600">
                알림 권한:{' '}
                <span className="font-bold">{notificationPermission}</span>
              </p>
              <p className="font-['nanumsquare'] text-gray-600">
                브라우저 지원:{' '}
                <span className="font-bold">
                  {typeof window !== 'undefined' && 'Notification' in window
                    ? '지원함'
                    : '지원안함'}
                </span>
              </p>
              <p className="font-['nanumsquare'] text-gray-600">
                백엔드 API:{' '}
                <span className="font-bold">
                  {process.env.NODE_ENV === 'development'
                    ? 'localhost:8080'
                    : 'j13a509.p.ssafy.io'}
                </span>
              </p>
              <p className="font-['nanumsquare'] text-gray-600">
                사용자 ID:{' '}
                <span className="font-bold">{user?.id || '없음'}</span>
              </p>
              <p className="font-['nanumsquare'] text-gray-600">
                SSE 연결:{' '}
                <span
                  className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}
                >
                  {isConnected ? '연결됨' : '연결안됨'}
                </span>
              </p>
              <p className="font-['nanumsquare'] text-gray-600">
                FCM 토큰:{' '}
                <span
                  className={`font-bold ${fcmToken ? 'text-green-600' : 'text-red-600'}`}
                >
                  {fcmToken ? '있음' : '없음'}
                </span>
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  try {
                    // 백엔드 서버 연결 테스트 (단순 연결 확인)
                    const apiUrl =
                      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

                    // 루트 경로로 직접 연결 테스트 (인증 포함)
                    const headers: Record<string, string> = {}
                    if (typeof window !== 'undefined') {
                      const accessToken = localStorage.getItem('accessToken')
                      if (accessToken)
                        headers.Authorization = `Bearer ${accessToken}`
                    }

                    const response = await fetch(`${apiUrl}`, {
                      method: 'GET',
                      mode: 'cors',
                      credentials: 'include',
                      headers,
                    })
                    console.log('백엔드 연결 테스트:', response.status)
                    alert(
                      `백엔드 연결: ${response.ok ? '성공' : '실패'} (${response.status})`
                    )
                  } catch (error) {
                    console.error('백엔드 연결 실패:', error)
                    alert(
                      '백엔드 연결 실패 - 백엔드 서버가 실행 중인지 확인하세요'
                    )
                  }
                }}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700"
              >
                백엔드 연결 테스트
              </button>
              <button
                onClick={() => {
                  console.log('현재 알림 목록:', notifications)
                  console.log('알림 설정:', settings)
                  console.log('SSE 연결 상태:', isConnected)
                  console.log('FCM 토큰:', fcmToken)
                  alert('콘솔을 확인하세요')
                }}
                className="rounded bg-gray-600 px-3 py-1 text-xs font-bold text-white hover:bg-gray-700"
              >
                상태 로그
              </button>
              <button
                onClick={() => {
                  if (fcmToken) {
                    navigator.clipboard.writeText(fcmToken).then(() => {
                      alert('FCM 토큰이 클립보드에 복사되었습니다!')
                    })
                  } else {
                    alert('FCM 토큰이 없습니다.')
                  }
                }}
                className="rounded bg-purple-600 px-3 py-1 text-xs font-bold text-white hover:bg-purple-700"
                disabled={!fcmToken}
              >
                FCM 토큰 복사
              </button>
            </div>
          </div>

          {notificationPermission !== 'granted' && (
            <div className="rounded-lg border border-orange-300 bg-orange-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 font-['Tenada'] text-lg font-extrabold text-orange-800">
                    <IoNotifications className="text-xl" />
                    브라우저 알림 권한 필요
                  </h3>
                  <p className="mt-1 font-['nanumsquare'] text-sm text-orange-700">
                    {notificationPermission === 'denied'
                      ? '알림 권한이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.'
                      : '실시간 알림을 받으려면 브라우저 알림 권한을 허용해주세요.'}
                  </p>
                </div>
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

        {/* 알림 테스트 버튼 */}
        <div className="bg-keeping-beige mb-8 rounded-lg border border-black p-6">
          <h3 className="mb-4 font-['Tenada'] text-xl font-extrabold text-black">
            알림 테스트
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => sendTestNotification('PAYMENT')}
              className="flex items-center gap-2 rounded-lg border border-black bg-white p-4 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-50"
            >
              <IoCard className="text-green-600" />
              결제 완료 알림
            </button>
            <button
              onClick={() => sendTestNotification('CHARGE')}
              className="flex items-center gap-2 rounded-lg border border-black bg-white p-4 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-50"
            >
              <IoBatteryCharging className="text-blue-600" />
              충전 완료 알림
            </button>
            <button
              onClick={() => sendTestNotification('STORE_PROMOTION')}
              className="flex items-center gap-2 rounded-lg border border-black bg-white p-4 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-50"
            >
              <IoMegaphone className="text-purple-600" />
              매장 프로모션 알림
            </button>
            <button
              onClick={() => sendTestNotification('PREPAYMENT_PURCHASE')}
              className="flex items-center gap-2 rounded-lg border border-black bg-white p-4 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-50"
            >
              <IoWallet className="text-orange-600" />
              선결제 구매 알림
            </button>
            <button
              onClick={() => sendTestNotification('SYSTEM')}
              className="flex items-center gap-2 rounded-lg border border-black bg-white p-4 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-50 sm:col-span-2"
            >
              <IoSettings className="text-gray-600" />
              시스템 알림
            </button>
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
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
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
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className={`relative h-6 w-12 rounded-full transition-colors ${
                    setting.enabled ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPage
