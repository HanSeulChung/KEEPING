'use client'

import { registerFCMToken, unregisterFCMToken } from '@/api/fcmApi'
import { notificationApi } from '@/api/notificationApi'
import {
  getFcmToken,
  requestNotificationPermission,
  setupForegroundMessageListener,
} from '@/lib/firebase'
import { useAuthStore } from '@/store/useAuthStore'
import { useCallback, useEffect, useRef, useState } from 'react'

interface NotificationData {
  id: number
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
  fcmToken: string | null
  requestPermission: () => Promise<boolean>
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  addNotification: (
    notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>
  ) => void
  registerFCM: () => Promise<boolean>
  unregisterFCM: () => Promise<void>
}

export const useNotificationSystem = (): UseNotificationSystemReturn => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const isVisibleRef = useRef(true)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // 백엔드 응답을 프론트엔드 형식으로 변환
  const convertNotificationData = (backendData: any): NotificationData => {
    return {
      id: backendData.id,
      type: backendData.type,
      title: backendData.title,
      message: backendData.message,
      timestamp: backendData.createdAt,
      isRead: backendData.isRead,
      data: backendData.data,
    }
  }

  // 네트워크 상태 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

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
    if (typeof window === 'undefined') return

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
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isOnline])

  // SSE 연결 (개발 환경에서는 폴링으로 대체)
  const connectSSE = useCallback(() => {
    if (!user?.id || eventSourceRef.current || !isOnline) {
      console.log('SSE 연결 조건 불만족:', {
        hasUser: !!user?.id,
        hasEventSource: !!eventSourceRef.current,
        isOnline,
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
      const eventSource = new EventSource(
        `/api/notifications/sse?userId=${user.id}`
      )
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

      eventSource.onmessage = event => {
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
          if (
            isVisibleRef.current &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            showBrowserNotification(notification)
          }
        } catch (error) {
          console.error(
            '알림 데이터 파싱 오류:',
            error,
            'Raw data:',
            event.data
          )
        }
      }

      eventSource.onerror = error => {
        console.error('SSE 연결 오류:', error)
        console.error('EventSource readyState:', eventSource.readyState)
        setIsConnected(false)

        // 기존 재연결 타이머 정리
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }

        // 재연결 시도 (지수 백오프)
        if (
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          isVisibleRef.current &&
          isOnline
        ) {
          reconnectAttemptsRef.current++
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          ) // 최대 30초

          console.log(
            `${delay}ms 후 재연결 시도 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          )
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
        tag: String(notification.id),
        requireInteraction: true,
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
    const granted = await requestNotificationPermission()
    setIsPermissionGranted(granted)
    return granted
  }

  // FCM 토큰 등록
  const registerFCM = async (): Promise<boolean> => {
    try {
      if (!user?.id) {
        console.log('사용자 정보가 없습니다.')
        return false
      }

      // 알림 권한 확인
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        console.log('알림 권한이 필요합니다.')
        return false
      }

      // FCM 토큰 발급
      const token = await getFcmToken()
      if (!token) {
        console.log('FCM 토큰을 가져올 수 없습니다.')
        return false
      }

      setFcmToken(token)

      // 서버에 토큰 등록
      await registerFCMToken({
        userId: String(user.id),
        token: token,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      })

      console.log('FCM 토큰 등록 완료')
      return true
    } catch (error) {
      console.error('FCM 등록 실패:', error)
      return false
    }
  }

  // FCM 토큰 해제
  const unregisterFCM = async (): Promise<void> => {
    try {
      if (user?.id && fcmToken) {
        await unregisterFCMToken(String(user.id), fcmToken)
        setFcmToken(null)
        console.log('FCM 토큰 해제 완료')
      }
    } catch (error) {
      console.error('FCM 해제 실패:', error)
    }
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
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      // 서버에 구독 정보 전송
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          subscription: subscription,
        }),
      })

      console.log('Web Push 구독 완료')
    } catch (error) {
      console.error('서비스 워커 등록 오류:', error)
    }
  }

  // 알림 읽음 처리
  const markAsRead = useCallback(
    async (id: number) => {
      if (!user?.id) {
        console.error('사용자 정보가 없습니다.')
        return
      }

      try {
        // 서버에 읽음 상태 전송
        await notificationApi.markAsRead(parseInt(String(user.id)), id)

        // 로컬 상태 업데이트
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        )
      } catch (error) {
        console.error('읽음 상태 업데이트 오류:', error)
      }
    },
    [user?.id]
  )

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
      body: JSON.stringify({ userId: user?.id }),
    }).catch(error => {
      console.error('모든 알림 읽음 상태 업데이트 오류:', error)
    })
  }, [user?.id])

  // 알림 추가 함수
  const addNotification = useCallback(
    (
      notificationData: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>
    ) => {
      const newNotification: NotificationData = {
        ...notificationData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      setNotifications(prev => [newNotification, ...prev])

      // 브라우저 알림 표시
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/icons/qr.png',
          badge: '/icons/qr.png',
          tag: String(newNotification.id),
        })
      }
    },
    []
  )

  // 초기화
  useEffect(() => {
    const initializeNotificationSystem = async () => {
      if (typeof window !== 'undefined' && user?.id && isOnline) {
        // 권한 상태 확인
        if ('Notification' in window) {
          setIsPermissionGranted(Notification.permission === 'granted')
        }

        // 기존 알림 로드
        fetchNotifications()

        // SSE 연결 (포그라운드용)
        connectSSE()

        // FCM 설정 (백그라운드용)
        registerFCM()

        // 포그라운드 메시지 리스너 설정
        await setupForegroundMessageListener()
      }
    }

    initializeNotificationSystem()

    return () => {
      disconnectSSE()
      unregisterFCM()
    }
  }, [user?.id, isOnline, connectSSE, disconnectSSE])

  // 기존 알림 로드
  const fetchNotifications = async () => {
    if (!user) {
      console.log('사용자 정보가 없습니다.')
      return
    }

    try {
      // 사용자 ID 추출 및 검증
      let ownerId: number | null = null

      if (user.ownerId) {
        ownerId = Number(user.ownerId)
      } else if (user.userId) {
        ownerId = Number(user.userId)
      } else if (user.id) {
        ownerId = Number(user.id)
      }

      if (!ownerId || isNaN(ownerId) || ownerId <= 0) {
        console.error('유효하지 않은 사용자 ID:', user)
        return
      }

      console.log('알림 목록 조회 - 사용자 ID:', ownerId, '사용자 정보:', user)

      const notifications = await notificationApi.getNotificationList(ownerId)
      const convertedNotifications = notifications.map(convertNotificationData)
      setNotifications(convertedNotifications)
    } catch (error) {
      console.error('알림 로드 오류:', error)
      // 에러 발생 시 빈 배열로 설정
      setNotifications([])
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return {
    notifications,
    unreadCount,
    isConnected: isConnected && isOnline,
    isPermissionGranted,
    fcmToken,
    requestPermission,
    markAsRead,
    markAllAsRead,
    addNotification,
    registerFCM,
    unregisterFCM,
  }
}
