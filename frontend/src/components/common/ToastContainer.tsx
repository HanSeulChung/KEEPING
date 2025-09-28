'use client'

import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import React from 'react'
import ToastNotification from './ToastNotification'

const ToastContainer: React.FC = () => {
  const { toasts, removeToast, handleToastClick } = useNotificationSystem()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.type === 'PAYMENT_REQUEST' ? 8000 : 5000}
          onClose={removeToast}
          onClick={() => handleToastClick(toast)}
        />
      ))}
    </div>
  )
}

export default ToastContainer
