'use client'

import { NotificationType } from '@/types/notification'
import React, { useEffect, useState } from 'react'

interface ToastNotificationProps {
  id: number
  type: NotificationType
  title: string
  message: string
  duration?: number
  onClose: (id: number) => void
  onClick?: () => void
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // 컴포넌트 마운트 후 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 10)

    // 자동 닫기 타이머
    const autoCloseTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(autoCloseTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // 애니메이션 시간
  }

  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case 'PAYMENT_REQUEST':
        return {
          iconColor: '#FFB800', // 주황색
          icon: '💰',
        }
      case 'PAYMENT_COMPLETED':
        return {
          iconColor: '#22C55E', // 초록색
          icon: '✅',
        }
      case 'PAYMENT_CANCELED':
        return {
          iconColor: '#EF4444', // 빨간색
          icon: '❌',
        }
      case 'STORE_INFO_UPDATED':
        return {
          iconColor: '#76D4FF', // 파란색
          icon: '🏪',
        }
      default:
        return {
          iconColor: '#76D4FF',
          icon: '🔔',
        }
    }
  }

  const config = getTypeConfig(type)

  return (
    <div
      className={`relative w-80 max-w-sm transform cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg transition-all duration-300 ease-in-out ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} `}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ backgroundColor: config.iconColor }}
          >
            {config.icon}
          </div>
        </div>

        {/* 내용 */}
        <div className="min-w-0 flex-1">
          <div className="text-base leading-tight font-bold text-gray-800">
            {title}
          </div>
          <div className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
            {message}
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={e => {
            e.stopPropagation()
            handleClose()
          }}
          className="flex-shrink-0 p-1 text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ToastNotification
