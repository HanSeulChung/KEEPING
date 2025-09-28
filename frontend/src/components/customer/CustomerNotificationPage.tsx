'use client'

import PaymentApprovalModal from '@/components/common/PaymentApprovalModal'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { getNotificationIcon } from '@/types/notification'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const CustomerNotificationPage = () => {
  const searchParams = useSearchParams()
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    paymentApprovalModal,
    hidePaymentApprovalModal,
  } = useNotificationSystem()

  // SSE에서 자동으로 결제 승인 모달이 처리되므로 이 함수는 더 이상 필요하지 않음

  // 알림 클릭 처리 (읽음 처리만)
  const handleNotificationClick = (notification: any) => {
    // SSE에서 자동으로 모달이 처리되므로 읽음 처리만 수행
    markAsRead(notification.id)
  }


  const [loading, setLoading] = useState(true)
  const [filteredNotifications, setFilteredNotifications] =
    useState(notifications)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10) // 한 페이지당 10개 알림

  // URL 파라미터에서 가게 정보 가져오기
  const storeId = searchParams.get('storeId')
  const accountName = searchParams.get('accountName')

  // 가게별 알림 필터링
  useEffect(() => {
    if (storeId) {
      // 가게 ID에 해당하는 알림만 필터링
      const filtered = notifications.filter(
        notification =>
          notification.data?.storeId === parseInt(storeId) ||
          notification.message.includes(accountName || '') ||
          !notification.data?.storeId // 가게별 필터링이 없는 알림은 모두 표시
      )
      setFilteredNotifications(filtered)
    } else {
      setFilteredNotifications(notifications)
    }
    // 필터링 후 현재 페이지 초기화
    setCurrentPage(0)
    setLoading(false)
  }, [notifications, storeId, accountName])

  // 알림 타입별 UI 아이콘 컴포넌트 (이모지 대신 UI 아이콘 사용)
  const getNotificationIconComponent = (type: string) => {
    const iconEmoji = getNotificationIcon(type as any)

    // 타입별 배경색 설정
    let bgColor = 'bg-gray-100'
    if (
      [
        'PAYMENT_APPROVED',
        'PAYMENT_REQUEST',
        'PAYMENT_CANCELED',
        'SETTLEMENT_COMPLETED',
      ].includes(type)
    ) {
      bgColor = 'bg-green-100'
    } else if (
      ['POINT_CHARGE', 'PERSONAL_POINT_USE', 'POINT_CANCELED'].includes(type)
    ) {
      bgColor = 'bg-blue-100'
    } else if (type.includes('GROUP_')) {
      bgColor = 'bg-yellow-100'
    }

    return (
      <div
        className={`h-8 w-8 ${bgColor} flex items-center justify-center rounded-full`}
      >
        <span className="text-sm">{iconEmoji}</span>
      </div>
    )
  }

  // 시간 포맷팅 함수
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredNotifications.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex)

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  if (loading) {
    return (
      <div className="w-full">
        {/* 헤더 */}
        <div className="flex w-full items-center bg-[#fddb5f] px-4 py-3">
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 19V17H6V10C6 8.61667 6.41667 7.39167 7.25 6.325C8.08333 5.24167 9.16667 4.53333 10.5 4.2V3.5C10.5 3.08333 10.6417 2.73333 10.925 2.45C11.225 2.15 11.5833 2 12 2C12.4167 2 12.7667 2.15 13.05 2.45C13.35 2.73333 13.5 3.08333 13.5 3.5V4.2C14.8333 4.53333 15.9167 5.24167 16.75 6.325C17.5833 7.39167 18 8.61667 18 10V17H20V19H4ZM12 22C11.45 22 10.975 21.8083 10.575 21.425C10.1917 21.025 10 20.55 10 20H14C14 20.55 13.8 21.025 13.4 21.425C13.0167 21.8083 12.55 22 12 22ZM8 17H16V10C16 8.9 15.6083 7.95833 14.825 7.175C14.0417 6.39167 13.1 6 12 6C10.9 6 9.95833 6.39167 9.175 7.175C8.39167 7.95833 8 8.9 8 10V17Z"
              fill="white"
            />
          </svg>
          <div className="font-jalnan ml-2 text-lg leading-[140%] text-white">
            알림
          </div>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="font-nanum-square-round-eb text-lg">
            알림을 불러오는 중...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="flex w-full items-center bg-[#fddb5f] px-4 py-3">
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 19V17H6V10C6 8.61667 6.41667 7.39167 7.25 6.325C8.08333 5.24167 9.16667 4.53333 10.5 4.2V3.5C10.5 3.08333 10.6417 2.73333 10.925 2.45C11.225 2.15 11.5833 2 12 2C12.4167 2 12.7667 2.15 13.05 2.45C13.35 2.73333 13.5 3.08333 13.5 3.5V4.2C14.8333 4.53333 15.9167 5.24167 16.75 6.325C17.5833 7.39167 18 8.61667 18 10V17H20V19H4ZM12 22C11.45 22 10.975 21.8083 10.575 21.425C10.1917 21.025 10 20.55 10 20H14C14 20.55 13.8 21.025 13.4 21.425C13.0167 21.8083 12.55 22 12 22ZM8 17H16V10C16 8.9 15.6083 7.95833 14.825 7.175C14.0417 6.39167 13.1 6 12 6C10.9 6 9.95833 6.39167 9.175 7.175C8.39167 7.95833 8 8.9 8 10V17Z"
            fill="white"
          />
        </svg>
        <div className="font-jalnan ml-2 text-lg leading-[140%] text-white">
          알림
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="w-full space-y-4">
        {/* 가게 정보 표시 */}
        {accountName && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h2 className="font-nanum-square-round-eb mb-1 text-base font-bold text-black">
              {accountName} 알림
            </h2>
            <p className="font-nanum-square-round-eb text-sm text-gray-600">
              이 가게와 관련된 알림만 표시됩니다
            </p>
          </div>
        )}

        {/* 알림 헤더 */}
        <div className="border-b border-gray-100 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-nanum-square-round-eb text-base font-bold text-black">
                전체 알림{' '}
                {filteredNotifications.length > 0 &&
                  `(${filteredNotifications.length})`}
              </h2>
              {filteredNotifications.length > 0 && (
                <span className="font-nanum-square-round-eb text-sm text-gray-500">
                  {currentPage + 1}/{totalPages} 페이지
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {filteredNotifications.some(n => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="font-nanum-square-round-eb rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors active:bg-blue-50"
                >
                  모두 읽음
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  fill="#9CA3AF"
                />
              </svg>
            </div>
            <p className="font-nanum-square-round-eb text-base font-medium text-gray-500">
              알림이 없습니다
            </p>
            <p className="font-nanum-square-round-eb mt-2 text-sm text-gray-400">
              새로운 알림이 오면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {currentNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`rounded-lg border border-gray-200 p-4 transition-colors active:bg-gray-50 ${
                  !notification.isRead
                    ? 'border-blue-200 bg-blue-50'
                    : 'bg-white'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* 알림 아이콘 */}
                  <div className="mt-1 flex-shrink-0">
                    {getNotificationIconComponent(notification.type)}
                  </div>

                  {/* 알림 내용 */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="font-nanum-square-round-eb line-clamp-1 text-sm font-bold text-black">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <p className="font-nanum-square-round-eb mb-2 line-clamp-2 text-sm leading-relaxed text-gray-700">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-nanum-square-round-eb text-xs text-gray-400">
                        {formatTime(notification.timestamp)}
                      </p>
                      {notification.data?.amount && (
                        <span className="font-nanum-square-round-eb text-xs font-bold text-green-600">
                          {notification.data.amount.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`font-nanum-square-round-eb rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === 0
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                      : 'border-blue-200 bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  이전
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`font-nanum-square-round-eb h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === i
                          ? 'bg-blue-600 text-white'
                          : 'border border-blue-200 bg-white text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`font-nanum-square-round-eb rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === totalPages - 1
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                      : 'border-blue-200 bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 결제 승인 모달 - SSE 알림으로 자동 팝업 */}
      {paymentApprovalModal.isOpen && paymentApprovalModal.data && (
        <PaymentApprovalModal
          isOpen={paymentApprovalModal.isOpen}
          onClose={hidePaymentApprovalModal}
          intentPublicId={paymentApprovalModal.data.intentPublicId}
          storeName={paymentApprovalModal.data.storeName}
          amount={paymentApprovalModal.data.amount}
          customerName={paymentApprovalModal.data.customerName}
          pointInfo={
            paymentApprovalModal.data.pointInfo
              ? {
                  currentPoints: 0,
                  usedPoints: 0,
                  remainingPoints: 0,
                  ...(typeof paymentApprovalModal.data.pointInfo === 'object'
                    ? paymentApprovalModal.data.pointInfo
                    : {}),
                }
              : undefined
          }
          paymentType="PAYMENT"
          onSuccess={() => {
            console.log('결제 승인 완료')
            hidePaymentApprovalModal()
          }}
        />
      )}
    </div>
  )
}

export default CustomerNotificationPage
