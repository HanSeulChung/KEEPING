'use client'

import PaymentApprovalModal from '@/components/common/PaymentApprovalModal'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
import { getNotificationIcon } from '@/types/notification'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IoNotifications } from 'react-icons/io5'

type NotificationSetting = {
  id: string
  name: string
  enabled: boolean
}

const NotificationPage = () => {
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { notifications, markAsRead, markAllAsRead, unreadCount, isConnected } =
    useNotificationSystem()

  // 결제 승인 모달 상태
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    data?: {
      intentPublicId?: string
      customerName?: string
      amount?: number
      storeName?: string
      items?: Array<{
        name: string
        quantity: number
        price: number
      }>
    }
  }>({ isOpen: false })

  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'PAYMENT_CATEGORY', name: '결제/정산 알림', enabled: true },
    { id: 'GROUP_CATEGORY', name: '모임 관련 알림', enabled: true },
  ])
  const [loading, setLoading] = useState(true)
  const [notificationsLoaded, setNotificationsLoaded] = useState(false)
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(3) // 한 페이지당 3개 알림
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  // URL 파라미터에서 가게 정보 가져오기
  const storeId = searchParams.get('storeId')
  const accountName = searchParams.get('accountName')

  useEffect(() => {
    // 브라우저 알림 권한 상태 확인
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      // 권한이 기본 상태이면 모달 표시
      if (Notification.permission === 'default') {
        setShowPermissionModal(true)
      }
    }

    // 개발 환경에서 FCM 에러 처리 안내
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '개발 환경: Firebase/FCM 에러는 무시됩니다. 실제 푸시 알림 기능은 운영 환경에서 작동합니다.'
      )
    }

    setLoading(false)
  }, [])

  // 알림 데이터 로딩 감지
  useEffect(() => {
    if (notifications.length > 0 || !loading) {
      setNotificationsLoaded(true)
    }
  }, [notifications, loading])

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않습니다.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      setShowPermissionModal(false)

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
      setShowPermissionModal(false)
    }
  }

  // 브라우저 설정 안내
  const showBrowserSettingsGuide = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    let message = ''

    if (userAgent.includes('chrome')) {
      message =
        '1. 주소창 왼쪽의 자물쇠 아이콘 클릭\n2. "알림" 설정을 "허용"으로 변경\n3. 페이지 새로고침'
    } else if (userAgent.includes('firefox')) {
      message =
        '1. 주소창 왼쪽의 방패 아이콘 클릭\n2. "알림" 권한을 허용으로 변경\n3. 페이지 새로고침'
    } else if (userAgent.includes('safari')) {
      message =
        '1. Safari 메뉴 > 환경설정 > 웹사이트\n2. 알림 탭에서 이 사이트 허용\n3. 페이지 새로고침'
    } else {
      message = '브라우저 설정에서 이 사이트의 알림을 허용해주세요.'
    }

    alert(message)
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
      <div className="flex h-8 w-8 items-center justify-center text-2xl">
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

  // 결제 알림이 10분 이내인지 확인
  const isPaymentValid = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now.getTime() - time.getTime()) / (1000 * 60)) // 분 단위
    return diff <= 10 // 10분 이내
  }

  // 알림 클릭 처리
  const handleNotificationClick = (notification: any) => {
    if (notification.id && !isNaN(Number(notification.id))) {
      markAsRead(Number(notification.id))
    }

    // PAYMENT_REQUEST 타입이고 10분 이내인 경우 결제 모달 열기
    if (
      notification.type === 'PAYMENT_REQUEST' &&
      isPaymentValid(notification.timestamp)
    ) {
      setPaymentModal({
        isOpen: true,
        data: {
          intentPublicId:
            notification.data?.intentId || notification.data?.intentPublicId,
          customerName: notification.data?.customerName || '고객',
          amount: notification.data?.amount || 0,
          storeName: notification.data?.storeName || '매장',
          items: notification.data?.items || [],
        },
      })
    }
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
    <div className="min-h-screen bg-[#F6FCFF]">
      {/* Owner 테마 헤더 */}
      <div className="safe-area-top bg-[#76d4ff] shadow-sm">
        <div className="flex w-full items-center px-4 py-3">
          <h1 className="font-jalnan text-lg leading-[140%] text-white">
            알림 설정
          </h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="pb-safe pt-6">
        {/* 알림 권한이 거부된 경우에만 작은 안내 표시 */}
        {notificationPermission === 'denied' && (
          <div className="mb-8 rounded-lg border border-orange-300 bg-orange-50 p-4">
            <div className="flex items-center justify-between">
              <div className="font-['nanumsquare'] text-sm text-orange-800">
                브라우저에서 알림이 차단되어 있습니다
              </div>
              <button
                onClick={showBrowserSettingsGuide}
                className="rounded-lg bg-orange-600 px-3 py-1 font-['nanumsquare'] text-xs font-bold text-white transition-colors hover:bg-orange-700"
              >
                설정 방법
              </button>
            </div>
          </div>
        )}

        {/* 알림 통계 */}
        <div className="mb-8 grid grid-cols-1 gap-4 px-4 sm:grid-cols-3">
          <div className="rounded-[20px] border border-[#76d4ff] bg-white p-4 text-center shadow-sm">
            <div className="font-jalnan text-2xl font-extrabold text-[#76d4ff]">
              {unreadCount}
            </div>
            <div className="font-nanum-square-round-eb text-sm text-gray-600">
              읽지 않은 알림
            </div>
          </div>
          <div className="rounded-[20px] border border-[#76d4ff] bg-white p-4 text-center shadow-sm">
            <div className="font-jalnan text-2xl font-extrabold text-[#76d4ff]">
              {notifications.length}
            </div>
            <div className="font-nanum-square-round-eb text-sm text-gray-600">
              전체 알림
            </div>
          </div>
          <div className="rounded-[20px] border border-[#76d4ff] bg-white p-4 text-center shadow-sm">
            <div className="font-jalnan text-2xl font-extrabold text-[#76d4ff]">
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
            <div className="font-nanum-square-round-eb text-sm text-gray-600">
              오늘 알림
            </div>
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="mx-4 mb-8 rounded-[20px] border border-[#76d4ff] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-jalnan text-xl font-extrabold text-[#76d4ff]">
                알림 목록
              </h3>
              {notifications.length > 0 && (
                <span className="font-nanum-square-round-eb text-sm text-gray-500">
                  총 {notifications.length}개 ({currentPage + 1}/{totalPages}{' '}
                  페이지)
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="font-nanum-square-round-eb rounded-[10px] border border-[#76d4ff] bg-[#76d4ff] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#5bb3e6]"
              >
                모두 읽음
              </button>
            )}
          </div>

          {!notificationsLoaded ? (
            // 스켈레톤 로딩
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="animate-pulse rounded-[15px] border border-gray-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                      <div className="mb-2 h-3 w-full rounded bg-gray-200"></div>
                      <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">
                <IoNotifications className="mx-auto text-gray-300" />
              </div>
              <div className="font-nanum-square-round-eb text-gray-500">
                알림이 없습니다
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {currentNotifications.map(notification => {
                  const isPaymentExpired =
                    notification.type === 'PAYMENT_REQUEST' &&
                    !isPaymentValid(notification.timestamp)

                  return (
                    <div
                      key={notification.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-[15px] border p-4 transition-colors ${
                        notification.isRead
                          ? 'border-gray-200 bg-white'
                          : 'border-[#76d4ff] bg-blue-50'
                      } ${isPaymentExpired ? 'opacity-50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mt-1">
                        {getNotificationIconComponent(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-nanum-square-round-eb text-sm font-bold ${
                            notification.isRead ? 'text-gray-700' : 'text-black'
                          }`}
                        >
                          {notification.title}
                        </div>
                        <div className="font-nanum-square-round-eb mt-1 text-xs break-words text-gray-600">
                          {notification.message}
                          {isPaymentExpired && (
                            <span className="ml-2 font-bold text-red-500">
                              (만료됨)
                            </span>
                          )}
                        </div>
                        <div className="font-nanum-square-round-eb mt-2 text-xs text-gray-400">
                          {formatTime(notification.timestamp)}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="h-3 w-3 flex-shrink-0 rounded-full bg-[#76d4ff]"></div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className={`font-nanum-square-round-eb rounded-[10px] border px-3 py-2 text-sm font-bold transition-colors ${
                      currentPage === 0
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : 'border-[#76d4ff] bg-white text-[#76d4ff] hover:bg-blue-50'
                    }`}
                  >
                    이전
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`font-nanum-square-round-eb h-10 w-10 rounded-[10px] text-sm font-bold transition-colors ${
                          currentPage === i
                            ? 'bg-[#76d4ff] text-white'
                            : 'border border-[#76d4ff] bg-white text-[#76d4ff] hover:bg-blue-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={`font-nanum-square-round-eb rounded-[10px] border px-3 py-2 text-sm font-bold transition-colors ${
                      currentPage === totalPages - 1
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : 'border-[#76d4ff] bg-white text-[#76d4ff] hover:bg-blue-50'
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
        <div className="mx-4 rounded-[20px] border border-[#76d4ff] bg-white p-6 shadow-sm">
          <h3 className="font-jalnan mb-2 text-xl font-extrabold text-[#76d4ff]">
            알림 설정
          </h3>
          <p className="font-nanum-square-round-eb mb-4 text-sm text-gray-600">
            비활성화하면 브라우저 팝업 알림만 안 뜹니다. 목록에는 계속
            표시됩니다.
          </p>

          <div className="space-y-3">
            {settings.map(setting => (
              <div
                key={setting.id}
                className="flex items-center justify-between rounded-[15px] border border-[#76d4ff] p-3"
              >
                <div className="flex-1">
                  <span className="font-nanum-square-round-eb text-sm font-bold text-black">
                    {setting.name}
                  </span>
                  <div className="font-nanum-square-round-eb mt-1 text-xs text-gray-500">
                    {setting.enabled
                      ? '팝업 알림 + 목록 표시'
                      : '목록에만 표시 (팝업 없음)'}
                  </div>
                </div>
                <div className="flex h-8 items-center">
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className="flex h-8 overflow-hidden rounded-[10px] border-2 border-[#76d4ff] bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {/* OFF 버튼 */}
                    <div
                      className={`flex h-full w-12 items-center justify-center transition-all duration-200 ${
                        !setting.enabled
                          ? 'bg-[#76d4ff] text-white'
                          : 'bg-white text-[#76d4ff] hover:bg-blue-50'
                      }`}
                    >
                      <span className="font-nanum-square-round-eb text-xs font-bold">
                        OFF
                      </span>
                    </div>

                    {/* ON 버튼 */}
                    <div
                      className={`flex h-full w-12 items-center justify-center transition-all duration-200 ${
                        setting.enabled
                          ? 'bg-[#76d4ff] text-white'
                          : 'bg-white text-[#76d4ff] hover:bg-blue-50'
                      }`}
                    >
                      <span className="font-nanum-square-round-eb text-xs font-bold">
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

      {/* 알림 권한 요청 모달 */}
      {showPermissionModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-[30px] bg-[#F6FCFF] p-6 shadow-xl">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <IoNotifications className="h-8 w-8 text-[#76d4ff]" />
              </div>
              <h3 className="font-jalnan mb-2 text-xl font-extrabold text-[#76d4ff]">
                실시간 알림 받기
              </h3>
              <p className="font-nanum-square-round-eb text-sm text-gray-600">
                주문, 결제 등 중요한 알림을 즉시 받아보세요.
                <br />
                언제든지 설정에서 변경할 수 있습니다.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={requestNotificationPermission}
                className="font-jalnan w-full rounded-[15px] bg-[#76d4ff] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#5bb3e6]"
              >
                알림 허용하기
              </button>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="font-nanum-square-round-eb w-full rounded-[15px] border border-[#76d4ff] bg-white px-4 py-3 text-sm font-bold text-[#76d4ff] transition-colors hover:bg-blue-50"
              >
                나중에
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="font-nanum-square-round-eb text-xs text-gray-500">
                브라우저에서 알림을 허용해야 실시간 알림을 받을 수 있습니다
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 결제 승인 모달 */}
      {paymentModal.isOpen && paymentModal.data && (
        <PaymentApprovalModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false })}
          intentId={paymentModal.data.intentPublicId}
          storeName={paymentModal.data.storeName}
          amount={paymentModal.data.amount}
          items={paymentModal.data.items}
        />
      )}
    </div>
  )
}

export default NotificationPage
