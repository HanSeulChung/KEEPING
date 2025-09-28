'use client'
import { ReactNode } from 'react'

interface AlertProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  type?: 'info' | 'success' | 'warning' | 'error'
  variant?: 'customer' | 'owner'
}

export const Alert = ({
  isOpen,
  onClose,
  title,
  message,
  children,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  type = 'info',
  variant = 'customer',
}: AlertProps) => {
  if (!isOpen) return null

  const isOwner = variant === 'owner'

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return isOwner ? 'text-[#76d4ff]' : 'text-[#ffc800]'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return isOwner ? 'text-[#76d4ff]' : 'text-[#ffc800]'
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`relative h-[180px] w-[350px] rounded-[30px] ${isOwner ? 'bg-[#F6FCFF]' : 'bg-[#fbf9f5]'}`}
      >
        {/* 닫기 버튼 */}
        <div className="absolute top-4 right-4">
          <button onClick={onClose}>
            <svg
              width={36}
              height={36}
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z"
                stroke={isOwner ? '#76d4ff' : '#FFC800'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 알림 내용 */}
        <div className="flex h-full flex-col justify-start px-4 pt-12 pb-4">
          <div className="flex flex-1 items-center justify-center">
            {message && (
              <div
                className={`font-jalnan text-center text-base ${getTypeColor()}`}
              >
                {message}
              </div>
            )}
            {children && <div className="mt-4">{children}</div>}
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                onClick={handleCancel}
                className={`font-jalnan flex-1 rounded-[10px] border-2 bg-white px-4 py-2 transition-colors ${
                  isOwner
                    ? 'border-[#76d4ff] text-[#76d4ff] hover:bg-blue-50'
                    : 'border-[#fdda60] text-[#fdda60] hover:bg-yellow-50'
                }`}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`font-jalnan flex-1 rounded-[10px] px-4 py-2 text-white transition-colors ${
                onCancel
                  ? isOwner
                    ? 'bg-[#76d4ff] hover:bg-[#5bb3e6]'
                    : 'bg-[#fdda60] hover:bg-[#f4d03f]'
                  : isOwner
                    ? 'w-full bg-[#76d4ff] hover:bg-[#5bb3e6]'
                    : 'w-full bg-[#fdda60] hover:bg-[#f4d03f]'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
