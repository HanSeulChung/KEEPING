'use client'

import { NotificationType } from '@/types/notification'
import React, { useCallback, useState } from 'react'
import ToastNotification from './ToastNotification'

export interface ToastData {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  onClick?: () => void
}

interface ToastContainerProps {
  maxToasts?: number
}

const ToastContainer: React.FC<ToastContainerProps> = ({ maxToasts = 5 }) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = {
      ...toast,
      id,
    }

    setToasts(prev => {
      const newToasts = [newToast, ...prev]
      // 최대 개수 제한
      return newToasts.slice(0, maxToasts)
    })
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // 전역에서 사용할 수 있도록 window 객체에 함수 등록
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showToast = addToast
    }
  }, [addToast])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index,
          }}
        >
          <ToastNotification
            {...toast}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer