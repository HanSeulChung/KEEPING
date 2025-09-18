'use client'

import React, { useState, useEffect } from 'react'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useSearchParams, useRouter } from 'next/navigation'

type NotificationSetting = {
  id: string
  name: string
  enabled: boolean
}

const OwnerNotificationPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationSystem()
  
  // markAsRead 함수를 number 타입으로 사용
  const handleMarkAsRead = (id: number) => {
    markAsRead(id)
  }
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'payment', name: '결제 알림', enabled: true },
    { id: 'like', name: '가게 찜 알림', enabled: true },
    { id: 'charge', name: '충전 알림', enabled: true },
    { id: 'prepaid', name: '선결제 구매 알림', enabled: false }
  ])
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

  const toggleSetting = (id: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    )
  }

  // 알림 타입별 아이콘 반환
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10B981"/>
            </svg>
          </div>
        )
      case 'order':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" fill="#3B82F6"/>
            </svg>
          </div>
        )
      case 'review':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#F59E0B"/>
            </svg>
          </div>
        )
      case 'system':
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#6B7280"/>
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#6B7280"/>
            </svg>
          </div>
        )
    }
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
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="w-full bg-white border-b border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-['Tenada'] font-extrabold text-black">
              알림
            </h1>
            <div className="w-20"></div> {/* 공간 맞추기 */}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 가게 정보 표시 */}
        {accountName && (
          <div className="mb-6 p-4 bg-keeping-beige border border-black rounded-lg text-center">
            <h2 className="text-lg font-['nanumsquare'] font-bold text-black mb-1">
              {accountName} 알림
            </h2>
            <p className="text-sm text-gray-600 font-['nanumsquare']">
              이 가게와 관련된 알림만 표시됩니다
            </p>
          </div>
        )}

        {/* 알림 목록 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-['nanumsquare'] font-bold text-black">
              전체 알림 ({filteredNotifications.length}개)
            </h2>
            {filteredNotifications.some(n => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-['nanumsquare'] underline"
              >
                모두 읽음 처리
              </button>
            )}
          </div>
          
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#9CA3AF"/>
                </svg>
              </div>
              <p className="text-gray-500 font-['nanumsquare'] text-lg">알림이 없습니다</p>
              <p className="text-gray-400 font-['nanumsquare'] text-sm mt-2">
                새로운 알림이 오면 여기에 표시됩니다
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border border-black bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* 알림 아이콘 */}
                    {getNotificationIcon(notification.type)}
                    
                    {/* 알림 내용 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-['nanumsquare'] font-bold text-black">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 font-['nanumsquare'] leading-relaxed mb-2">
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

        {/* 알림 설정 */}
        <div className="bg-white">
          <h2 className="text-lg font-['Inter'] font-bold text-black mb-4">
            알림 설정
          </h2>
          
          <div className="space-y-3">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-3 border border-gray-300 rounded-lg"
              >
                <span className="text-sm font-['nanumsquare'] text-black">
                  {setting.name}
                </span>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    setting.enabled ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
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

export default OwnerNotificationPage
