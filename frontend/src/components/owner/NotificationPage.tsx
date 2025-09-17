'use client'

import React, { useState } from 'react'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'

type NotificationSetting = {
  id: string
  name: string
  enabled: boolean
}

const OwnerNotificationPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationSystem()
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'payment', name: '결제 알림', enabled: true },
    { id: 'like', name: '가게 찜 알림', enabled: true },
    { id: 'charge', name: '충전 알림', enabled: true },
    { id: 'prepaid', name: '선결제 구매 알림', enabled: false }
  ])

  const toggleSetting = (id: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    )
  }

  return (
    <div>
      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 페이지 제목 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-['Tenada'] font-extrabold text-black">
            알림
          </h1>
        </div>

        {/* 알림 목록 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-['nanumsquare'] font-bold text-black">
              전체 알림 ({notifications.length}개)
            </h2>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-['nanumsquare']"
              >
                모두 읽음 처리
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-['nanumsquare']">알림이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border border-black bg-white rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'ring-2 ring-blue-200' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-['nanumsquare'] font-bold text-black">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-['nanumsquare'] leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 font-['nanumsquare']">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
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
