'use client'

import { NotificationType } from '@/types/notification'
import { useState, useEffect } from 'react'

interface OwnerNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type?: NotificationType
  title?: string
  message?: string
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  autoCloseTime?: number // 자동 닫기 시간 (밀리초)
}

export default function OwnerNotificationModal({
  isOpen,
  onClose,
  type = 'GENERAL',
  title,
  message,
  showConfirmButton = true,
  showCancelButton = false,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  autoCloseTime = 5000,
}: OwnerNotificationModalProps) {
  const [timeLeft, setTimeLeft] = useState(autoCloseTime / 1000)

  // 알림 타입별 스타일 설정 (점주용)
  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case 'PAYMENT_REQUEST':
        return {
          icon: '💰',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-[#fddb5f] hover:bg-[#fcd34d]',
          confirmTextColor: 'text-black',
          borderColor: 'border-yellow-200',
          titleColor: 'text-blue-600',
        }
      case 'PAYMENT_COMPLETED':
        return {
          icon: '✅',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmBg: 'bg-[#fddb5f] hover:bg-[#fcd34d]',
          confirmTextColor: 'text-black',
          borderColor: 'border-green-200',
          titleColor: 'text-blue-600',
        }
      case 'ORDER_RECEIVED':
        return {
          icon: '📦',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-[#fddb5f] hover:bg-[#fcd34d]',
          confirmTextColor: 'text-black',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-600',
        }
      case 'CUSTOMER_ARRIVED':
        return {
          icon: '👋',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          confirmBg: 'bg-[#fddb5f] hover:bg-[#fcd34d]',
          confirmTextColor: 'text-black',
          borderColor: 'border-purple-200',
          titleColor: 'text-blue-600',
        }
      case 'STORE_INFO_UPDATED':
        return {
          icon: '🏪',
          iconBg: 'bg-cyan-100',
          iconColor: 'text-cyan-600',
          confirmBg: 'bg-[#fddb5f] hover:bg-[#fcd34d]',
          confirmTextColor: 'text-black',
          borderColor: 'border-cyan-200',
          titleColor: 'text-blue-600',
        }
      default:
        return {
          icon: '🔔',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          confirmBg: 'bg-[#fddb5f] hover:bg-[#fcd34d]',
          confirmTextColor: 'text-black',
          borderColor: 'border-gray-200',
          titleColor: 'text-blue-600',
        }
    }
  }

  const style = getNotificationStyle(type)

  // 자동 닫기 타이머
  useEffect(() => {
    if (!isOpen || !autoCloseTime) return

    setTimeLeft(autoCloseTime / 1000)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, autoCloseTime, onClose])

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ${style.borderColor} border-2`}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-400 bg-white text-yellow-600 transition-colors hover:bg-yellow-50"
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6L18 18M6 18L18 6"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${style.iconBg}`}>
            <span className="text-2xl">{style.icon}</span>
          </div>
        </div>

        {/* 제목 */}
        {title && (
          <h2 className={`mb-3 text-center text-lg font-bold ${style.titleColor}`}>
            {title}
          </h2>
        )}

        {/* 메시지 */}
        {message && (
          <p className="mb-6 text-center text-gray-600 leading-relaxed">
            {message}
          </p>
        )}

        {/* 자동 닫기 표시 */}
        {autoCloseTime > 0 && (
          <div className="mb-4 text-center text-xs text-gray-400">
            {timeLeft}초 후 자동으로 닫힙니다
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex gap-3">
          {showCancelButton && (
            <button
              onClick={handleCancel}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              {cancelText}
            </button>
          )}
          {showConfirmButton && (
            <button
              onClick={handleConfirm}
              className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${style.confirmBg} ${style.confirmTextColor}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}