'use client'

import { NotificationType, getNotificationIcon } from '@/types/notification'
import React, { useEffect, useState } from 'react'

interface ToastNotificationProps {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
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
          icon: '💰'
        }
      case 'PAYMENT_COMPLETED':
        return {
          iconColor: '#22C55E', // 초록색
          icon: '✅'
        }
      case 'PAYMENT_CANCELED':
        return {
          iconColor: '#EF4444', // 빨간색
          icon: '❌'
        }
      case 'STORE_INFO_UPDATED':
        return {
          iconColor: '#76D4FF', // 파란색
          icon: '🏪'
        }
      default:
        return {
          iconColor: '#76D4FF',
          icon: '🔔'
        }
    }
  }

  const config = getTypeConfig(type)

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        bg-[#F6FCFF]
        rounded-[30px] shadow-lg p-6 cursor-pointer
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        border border-[#76D4FF]
      `}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {/* 아이콘 */}
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center" style={{borderColor: config.iconColor}}>
            <span className="text-lg">{config.icon}</span>
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="font-jalnan text-[#76D4FF] text-sm font-bold leading-[140%]">
            {title}
          </div>
          <div className="font-jalnan text-[#76D4FF] text-xs mt-1 opacity-80 line-clamp-2 leading-[140%]">
            {message}
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="flex-shrink-0 text-[#76D4FF] hover:opacity-70 transition-opacity"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ToastNotification