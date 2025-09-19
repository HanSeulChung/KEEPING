'use client'

import React from 'react'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'

const NotificationTestButton = () => {
  const { addNotification } = useNotificationSystem()

  const sendTestNotification = async () => {
    try {
      // 개발 환경에서는 직접 알림 생성
      if (process.env.NODE_ENV === 'development') {
        addNotification({
          type: 'payment',
          title: '테스트 알림',
          message: `새로운 주문이 들어왔습니다! (${new Date().toLocaleTimeString()})`,
          data: { storeId: '1', orderId: `order_${Date.now()}` }
        })
        
        console.log('테스트 알림 생성 완료')
        return
      }
      
      // 프로덕션 환경에서는 API 호출
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        console.log('테스트 알림 전송 성공')
      } else {
        console.error('테스트 알림 전송 실패')
      }
    } catch (error) {
      console.error('테스트 알림 전송 오류:', error)
    }
  }

  return (
    <button
      onClick={sendTestNotification}
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
    >
      테스트 알림 전송
    </button>
  )
}

export default NotificationTestButton
