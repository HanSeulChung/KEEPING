'use client'

import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { getNotificationIcon } from '@/types/notification'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const CustomerNotificationPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationSystem()
  
  // markAsRead 함수를 number 타입으로 사용
  const handleMarkAsRead = (id: number) => {
    markAsRead(id)
  }
  
  const [loading, setLoading] = useState(true)
  const [filteredNotifications, setFilteredNotifications] = useState(notifications)

  // URL 파라미터에서 가게 정보 가져오기
  const storeId = searchParams.get('storeId')
  const accountName = searchParams.get('accountName')

  // 가게별 알림 필터링
  useEffect(() => {
    if (storeId) {
      // 가게 ID에 해당하는 알림만 필터링
      const filtered = notifications.filter(notification => 
        notification.data?.storeId === parseInt(storeId) || 
        notification.message.includes(accountName || '') ||
        !notification.data?.storeId // 가게별 필터링이 없는 알림은 모두 표시
      )
      setFilteredNotifications(filtered)
    } else {
      setFilteredNotifications(notifications)
    }
    setLoading(false)
  }, [notifications, storeId, accountName])

  // 알림 타입별 UI 아이콘 컴포넌트 (이모지 대신 UI 아이콘 사용)
  const getNotificationIconComponent = (type: string) => {
    const iconEmoji = getNotificationIcon(type as any)

    // 타입별 배경색 설정
    let bgColor = 'bg-gray-100'
    if (['PAYMENT_APPROVED', 'PAYMENT_REQUEST', 'PAYMENT_CANCELED', 'SETTLEMENT_COMPLETED'].includes(type)) {
      bgColor = 'bg-green-100'
    } else if (['POINT_CHARGE', 'PERSONAL_POINT_USE', 'POINT_CANCELED'].includes(type)) {
      bgColor = 'bg-blue-100'
    } else if (type.includes('GROUP_')) {
      bgColor = 'bg-yellow-100'
    }

    return (
      <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
        <span className="text-sm">{iconEmoji}</span>
      </div>
    )
  }

  // 시간 포맷팅 함수
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '방금 전'
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg font-['nanumsquare']">알림을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 네이티브 헤더 */}
      <div className="sticky top-0 z-10 bg-white shadow-sm safe-area-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between h-11">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors"
            >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-lg font-['nanumsquare'] font-bold text-black">
              알림
            </h1>
            <div className="w-10"></div> {/* 공간 맞추기 */}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="pb-safe">
        {/* 가게 정보 표시 */}
        {accountName && (
          <div className="mx-4 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h2 className="text-base font-['nanumsquare'] font-bold text-black mb-1">
              {accountName} 알림
            </h2>
            <p className="text-sm text-gray-600 font-['nanumsquare']">
              이 가게와 관련된 알림만 표시됩니다
            </p>
          </div>
        )}

        {/* 알림 헤더 */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-['nanumsquare'] font-bold text-black">
              전체 알림 {filteredNotifications.length > 0 && `(${filteredNotifications.length})`}
            </h2>
            {filteredNotifications.some(n => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-sm text-blue-600 font-['nanumsquare'] font-medium active:bg-blue-50 rounded-lg transition-colors"
              >
                모두 읽음
              </button>
            )}
          </div>
        </div>
          
        {filteredNotifications.length === 0 ? (
          <div className="bg-white">
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#9CA3AF"/>
                </svg>
              </div>
              <p className="text-gray-500 font-['nanumsquare'] text-base font-medium">알림이 없습니다</p>
              <p className="text-gray-400 font-['nanumsquare'] text-sm mt-2">
                새로운 알림이 오면 여기에 표시됩니다
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : 'bg-white'
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="px-4 py-4 flex items-start gap-3">
                  {/* 알림 아이콘 */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIconComponent(notification.type)}
                  </div>

                  {/* 알림 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-['nanumsquare'] font-bold text-black line-clamp-1">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 font-['nanumsquare'] leading-relaxed mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 font-['nanumsquare']">
                        {formatTime(notification.timestamp)}
                      </p>
                      {notification.data?.amount && (
                        <span className="text-xs font-['nanumsquare'] font-bold text-green-600">
                          {notification.data.amount.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerNotificationPage
