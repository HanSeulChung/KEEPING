'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

interface NotificationData {
  id: string
  type: 'payment' | 'order' | 'review' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  data?: any
}

interface UseNotificationSystemReturn {
  notifications: NotificationData[]
  unreadCount: number
  isConnected: boolean
  isPermissionGranted: boolean
  requestPermission: () => Promise<boolean>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>) => void
}

export const useNotificationSystem = (): UseNotificationSystemReturn => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const eventSourceRef = useRef<EventSource | null>(null)
  const isVisibleRef = useRef(true)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // 네트워크 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      console.log('네트워크 연결됨')
      setIsOnline(true)
      reconnectAttemptsRef.current = 0
      
      // 포그라운드에 있을 때만 즉시 재연결
      if (isVisibleRef.current) {
        connectSSE()
      }
    }

    const handleOffline = () => {
      console.log('네트워크 연결 끊김')
      setIsOnline(false)
      setIsConnected(false)
      
      // 기존 재연결 타이머 정리
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

    // 초기 네트워크 상태 설정
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 앱 가시성 상태 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      
      if (isVisibleRef.current && isOnline) {
        // 포그라운드로 돌아왔을 때 SSE 재연결
        connectSSE()
      } else {
        // 백그라운드로 갈 때 SSE 연결 해제
        disconnectSSE()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isOnline])

  // SSE 연결 (개발 환경에서는 폴링으로 대체)
  const connectSSE = useCallback(() => {
    if (!user?.id || eventSourceRef.current || !isOnline) {
      console.log('SSE 연결 조건 불만족:', { 
        hasUser: !!user?.id, 
        hasEventSource: !!eventSourceRef.current, 
        isOnline 
      })
      return
    }

    console.log('SSE 연결 시도 중...', { userId: user.id })
    
    // 개발 환경에서는 연결만 설정 (자동 알림 없음)
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경: 알림 시스템 준비 완료 (수동 테스트만)')
      setIsConnected(true)
      
      // 더미 연결 객체 생성 (실제 폴링은 하지 않음)
      eventSourceRef.current = { close: () => {} } as any
      
      return
    }
    
    // 프로덕션 환경에서는 실제 SSE 사용
    try {
      const eventSource = new EventSource(`/api/notifications/sse?userId=${user.id}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('SSE 연결 성공')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        
        // 기존 재연결 타이머 정리
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE 메시지 수신:', data)
          
          // 연결 확인 메시지는 무시
          if (data.type === 'connection') {
            return
          }
          
          const notification: NotificationData = data
          setNotifications(prev => [notification, ...prev])
          
          // 포그라운드에서 브라우저 알림 표시
          if (isVisibleRef.current && 'Notification' in window && Notification.permission === 'granted') {
            showBrowserNotification(notification)
          }
        } catch (error) {
          console.error('알림 데이터 파싱 오류:', error, 'Raw data:', event.data)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error)
        console.error('EventSource readyState:', eventSource.readyState)
        setIsConnected(false)
        
        // 기존 재연결 타이머 정리
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        
        // 재연결 시도 (지수 백오프)
        if (reconnectAttemptsRef.current < maxReconnectAttempts && isVisibleRef.current && isOnline) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000) // 최대 30초
          
          console.log(`${delay}ms 후 재연결 시도 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isVisibleRef.current && isOnline) {
              disconnectSSE()
              connectSSE()
            }
          }, delay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('최대 재연결 시도 횟수 초과')
        }
      }
    } catch (error) {
      console.error('EventSource 생성 오류:', error)
      setIsConnected(false)
    }
  }, [user?.id, isOnline])

  // SSE 연결 해제
  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
    
    // 재연결 타이머 정리
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // 브라우저 알림 표시
  const showBrowserNotification = (notification: NotificationData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: notification.id,
        requireInteraction: true
        // actions는 Service Worker를 통해서만 사용 가능하므로 제거
      })

      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
        // 알림 클릭 시 읽음 처리
        markAsRead(notification.id)
      }

      // 5초 후 자동 닫기
      setTimeout(() => {
        browserNotification.close()
      }, 5000)
    }
  }

  // Web Push 권한 요청
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.')
      return false
    }

    if (Notification.permission === 'granted') {
      setIsPermissionGranted(true)
      return true
    }

    if (Notification.permission === 'denied') {
      console.log('알림 권한이 거부되었습니다.')
      return false
    }

    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'
    setIsPermissionGranted(granted)

    if (granted) {
      // 서비스 워커 등록 및 구독
      await registerServiceWorker()
    }

    return granted
  }

  // 서비스 워커 등록 및 Web Push 구독
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('이 브라우저는 서비스 워커를 지원하지 않습니다.')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('서비스 워커 등록됨:', registration)

      // Push 구독
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // 서버에 구독 정보 전송
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          subscription: subscription
        })
      })

      console.log('Web Push 구독 완료')
    } catch (error) {
      console.error('서비스 워커 등록 오류:', error)
    }
  }

  // 알림 읽음 처리
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    )

    // 서버에 읽음 상태 전송
    fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user?.id })
    }).catch(error => {
      console.error('읽음 상태 업데이트 오류:', error)
    })
  }, [user?.id])

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )

    // 서버에 모든 알림 읽음 상태 전송
    fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user?.id })
    }).catch(error => {
      console.error('모든 알림 읽음 상태 업데이트 오류:', error)
    })
  }, [user?.id])

  // 알림 추가 함수
  const addNotification = useCallback((notificationData: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: NotificationData = {
      ...notificationData,
      id: `manual_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // 브라우저 알림 표시
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/icons/qr.png',
        badge: '/icons/qr.png',
        tag: newNotification.id
      })
    }
  }, [])

  // 초기화
  useEffect(() => {
    if (user?.id && isOnline) {
      // 권한 상태 확인
      if ('Notification' in window) {
        setIsPermissionGranted(Notification.permission === 'granted')
      }

      // 기존 알림 로드
      fetchNotifications()
      
      // SSE 연결
      connectSSE()
    }

    return () => {
      disconnectSSE()
    }
  }, [user?.id, isOnline, connectSSE, disconnectSSE])

  // 기존 알림 로드
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('알림 로드 오류:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return {
    notifications,
    unreadCount,
    isConnected: isConnected && isOnline,
    isPermissionGranted,
    requestPermission,
    markAsRead,
    markAllAsRead,
    addNotification
  }
}
