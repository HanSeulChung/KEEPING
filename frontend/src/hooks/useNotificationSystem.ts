'use client'

import apiClient from '@/api/axios'
import { apiConfig, buildURL } from '@/api/config'
import {
    deleteFCMToken,
    registerCustomerFCMToken,
    registerOwnerFCMToken,
} from '@/api/fcmApi'
import { notificationApi } from '@/api/notificationApi'
import {
    getFcmToken,
    requestNotificationPermission,
    setupForegroundMessageListener,
} from '@/lib/firebase'
import { useAuthStore } from '@/store/useAuthStore'
import {
    NotificationCategory,
    NotificationData,
    NotificationType,
    getNotificationCategory,
    getNotificationIcon,
    getNotificationTitle,
} from '@/types/notification'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useCallback, useEffect, useRef, useState } from 'react'

// Base에 /api 존재 여부에 따라 경로에 /api를 한 번만 붙여주는 유틸
const apiPath = (path: string) => {
  const base = apiConfig.baseURL.replace(/\/$/, '')
  const hasApi = /\/api$/.test(base)
  return `${hasApi ? '' : '/api'}${path}`
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
  getNotificationCategory: (type: NotificationType) => NotificationCategory
  getNotificationIcon: (type: NotificationType) => string
}

export const useNotificationSystem = (): UseNotificationSystemReturn => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [fcmToken, setFcmToken] = useState<string | null>(() => {
    // 초기값을 localStorage에서 가져오기
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fcmToken')
    }
    return null
  })
  const sseAbortControllerRef = useRef<AbortController | null>(null)
  const isVisibleRef = useRef(true)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // 백엔드 응답을 프론트엔드 형식으로 변환
  const convertNotificationData = (backendData: any): NotificationData => {
    return {
      id: backendData.notificationId,
      type: backendData.notificationType,
      title: getNotificationTitle(backendData.notificationType),
      message: backendData.content,
      timestamp: backendData.createdAt,
      isRead: backendData.isRead,
      data: {
        receiverType: backendData.receiverType,
        receiverId: backendData.receiverId,
        receiverName: backendData.receiverName,
      },
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
        connectSSE().catch(console.error)
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
        connectSSE().catch(console.error)
      } else {
        // 백그라운드로 갈 때 SSE 연결 해제
        disconnectSSE()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isOnline])

  // SSE 연결
  const connectSSE = useCallback(async () => {
    console.log('=== SSE 연결 시도 시작 ===')
    console.log('사용자 정보:', user)
    console.log('현재 연결 상태:', {
      hasUser: !!user,
      hasUserId: !!user?.id,
      hasOwnerId: !!user?.ownerId,
      hasStream: !!sseAbortControllerRef.current,
      isOnline,
      userRole: user?.role,
    })

    if (!user?.id || sseAbortControllerRef.current || !isOnline) {
      console.log('❌ SSE 연결 조건 불만족:', {
        hasUser: !!user?.id,
        hasStream: !!sseAbortControllerRef.current,
        isOnline,
        reason: !user?.id
          ? '사용자 정보 없음'
          : sseAbortControllerRef.current
            ? '이미 연결됨'
            : !isOnline
              ? '오프라인'
              : '알 수 없음',
      })
      return
    }

    // 사용자 ID 추출 (ownerId 우선, 없으면 userId, 없으면 id)
    const userId = user.ownerId || user.userId || user.id
    if (!userId) {
      console.log('유효한 사용자 ID가 없습니다:', user)
      return
    }

    console.log('SSE 연결 시도 중...', {
      userId: user.id,
      ownerId: user.ownerId,
      actualUserId: userId,
    })

    // 실제 백엔드 SSE 연결
    try {
      // SSE 연결 전에 토큰 갱신 시도
      try {
        const refreshResponse = await fetch(buildURL('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          const newAccessToken = refreshData.data?.accessToken
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken)
            useAuthStore.getState().setAccessToken(newAccessToken)
            console.log('SSE 연결 전 토큰 갱신 성공')
          }
        }
      } catch (refreshError) {
        console.warn('SSE 연결 전 토큰 갱신 실패:', refreshError)
        // 토큰 갱신 실패 시 SSE 연결 중단
        return
      }

      // BASE URL: 어떤 형태든 마지막 /와 /api를 제거한 뒤, 항상 /api 경로를 붙인다
      const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const base = rawBase.replace(/\/$/, '')
      const baseWithoutApi = base.replace(/\/api\/?$/, '')

      // 백엔드 NotificationController SSE 엔드포인트 사용
      // user 역할에 따라 적절한 엔드포인트 선택
      const userRole = user.role || 'OWNER' // 기본값은 OWNER
      const ssePath =
        userRole === 'CUSTOMER'
          ? `/api/notifications/subscribe/customer/${userId}`
          : `/api/notifications/subscribe/owner/${userId}`

      const sseUrl = `${baseWithoutApi}${ssePath}`

      // Authorization 헤더에 accessToken을 포함
      let accessToken: string | null = null
      try {
        accessToken = useAuthStore.getState().getAccessToken()
      } catch {}
      if (!accessToken && typeof window !== 'undefined') {
        try {
          accessToken = localStorage.getItem('accessToken')
        } catch {}
      }

      console.log('SSE 연결 URL:', sseUrl, '사용자 역할:', userRole)

      const controller = new AbortController()
      sseAbortControllerRef.current = controller

      fetchEventSource(sseUrl, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          Accept: 'text/event-stream',
        },
        onopen: async response => {
          if (response.ok) {
            console.log('SSE HTTP 응답 성공 - 실제 연결 확인 대기 중...')
            // 실제 메시지를 받을 때까지 연결 상태를 true로 설정하지 않음
            reconnectAttemptsRef.current = 0
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current)
              reconnectTimeoutRef.current = null
            }
          } else {
            console.error(
              'SSE 오픈 실패:',
              response.status,
              response.statusText
            )
            throw new Error('SSE open failed')
          }
        },
        onmessage: event => {
          try {
            // 첫 번째 메시지가 오면 실제로 연결된 것으로 간주
            if (!isConnected) {
              console.log('SSE 실제 연결 성공 - 첫 메시지 수신')
              setIsConnected(true)
            }

            // 단순 텍스트 메시지는 무시 (연결 성공 메시지 등)
            if (typeof event.data === 'string' && !event.data.startsWith('{')) {
              console.log('SSE 텍스트 메시지:', event.data)
              return
            }

            const data = JSON.parse(event.data)
            // 연결 확인 메시지는 무시
            if (data.type === 'connection') return

            // SSE 메시지 구조에 맞게 NotificationData로 변환
            const notification: NotificationData = {
              id: data.notificationId,
              type: data.notificationType,
              title: getNotificationTitle(data.notificationType),
              message: data.content,
              timestamp: data.createdAt,
              isRead: data.isRead,
              data: {
                receiverType: data.receiverType,
                receiverId: data.receiverId,
                receiverName: data.receiverName,
              },
            }
            setNotifications(prev => [notification, ...prev])
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
        },
        onerror: error => {
          // 라이브러리가 자동 재시도하므로 상태만 업데이트
          console.error('SSE 오류:', error)
          setIsConnected(false)
          // 재시도는 라이브러리 기본 동작(지수 백오프)
        },
      }).catch(error => {
        if (controller.signal.aborted) {
          console.log('SSE 연결이 중단되었습니다(수동 해제).')
          return
        }
        console.error('SSE 스트림 종료:', error)
        setIsConnected(false)
        // 수동 재시도 로직 (보조)
        if (
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          isVisibleRef.current &&
          isOnline
        ) {
          reconnectAttemptsRef.current++
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          )
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isVisibleRef.current && isOnline) {
              disconnectSSE()
              connectSSE().catch(console.error)
            }
          }, delay)
        }
      })
    } catch (error) {
      console.error('SSE 초기화 오류:', error)
      setIsConnected(false)
    }
  }, [user?.id, isOnline])

  // SSE 연결 해제
  const disconnectSSE = useCallback(() => {
    if (sseAbortControllerRef.current) {
      sseAbortControllerRef.current.abort()
      sseAbortControllerRef.current = null
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

  // FCM 토큰 등록 (선택적)
  const registerFCM = async (): Promise<boolean> => {
    try {
      if (!user?.id) {
        console.log('사용자 정보가 없습니다.')
        return false
      }

      // 개발 환경에서는 FCM 등록을 선택적으로 처리
      if (process.env.NODE_ENV === 'development') {
        console.log('개발 환경: FCM 등록을 시도하지만 실패해도 무시합니다.')
      }

      // 알림 권한 확인
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        console.log('알림 권한이 필요합니다.')
        if (process.env.NODE_ENV === 'development') {
          console.log('개발 환경: 알림 권한 없어도 계속 진행')
          return true // 개발 환경에서는 권한 없어도 true 반환
        }
        return false
      }

      // FCM 토큰 발급
      const token = await getFcmToken()
      if (!token) {
        console.log('FCM 토큰을 가져올 수 없습니다.')
        if (process.env.NODE_ENV === 'development') {
          console.log('개발 환경: FCM 토큰 없어도 계속 진행')
          return true // 개발 환경에서는 토큰 없어도 true 반환
        }
        return false
      }

      // FCM 토큰을 state와 localStorage에 저장
      setFcmToken(token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('fcmToken', token)
      }

      // 서버에 토큰 등록 (역할별 엔드포인트)
      const isOwner = (user.role || 'OWNER') === 'OWNER'
      const ownerId = user.ownerId || user.id
      const customerId = user.userId || user.id
      if (isOwner && ownerId) {
        await registerOwnerFCMToken(Number(ownerId), token)
      } else if (!isOwner && customerId) {
        await registerCustomerFCMToken(Number(customerId), token)
      }

      console.log('FCM 토큰 등록 완료')
      return true
    } catch (error) {
      console.error('FCM 등록 실패:', error)

      // 개발 환경에서는 FCM 에러를 무시하고 계속 진행
      if (process.env.NODE_ENV === 'development') {
        console.log('개발 환경: FCM 에러 무시하고 계속 진행')
        return true
      }

      return false
    }
  }

  // FCM 토큰 해제
  const unregisterFCM = async (): Promise<void> => {
    try {
      if (user?.id && fcmToken) {
        await deleteFCMToken(fcmToken)
        setFcmToken(null)
        // localStorage에서도 FCM 토큰 제거
        if (typeof window !== 'undefined') {
          localStorage.removeItem('fcmToken')
        }
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

      // notificationId 유효성 검사
      if (!id || isNaN(id) || id <= 0) {
        console.error('유효하지 않은 notificationId:', id)
        return
      }

      try {
        // 사용자 ID 추출 (ownerId 우선, 없으면 userId, 없으면 id)
        const userId = user.ownerId || user.userId || user.id
        if (!userId) {
          console.error('유효한 사용자 ID가 없습니다:', user)
          return
        }

        // 사용자 역할 확인 (OWNER 또는 CUSTOMER)
        const userRole = user.role || 'OWNER'
        const isOwner = userRole === 'OWNER'

        console.log('알림 읽음 처리 - userId:', userId, 'notificationId:', id, 'role:', userRole)

        // 서버에 읽음 상태 전송 (역할에 따라 다른 API 엔드포인트 사용)
        if (isOwner) {
          await apiClient.put(apiPath(`/notifications/owner/${userId}/${id}/read`))
        } else {
          await apiClient.put(apiPath(`/notifications/customer/${userId}/${id}/read`))
        }

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
    [user?.id, user?.ownerId, user?.userId, user?.role]
  )

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) {
      console.error('사용자 정보가 없습니다.')
      return
    }

    // 사용자 ID 추출 (ownerId 우선, 없으면 userId, 없으면 id)
    const userId = user.ownerId || user.userId || user.id
    if (!userId) {
      console.error('유효한 사용자 ID가 없습니다:', user)
      return
    }

    // 사용자 역할 확인 (OWNER 또는 CUSTOMER)
    const userRole = user.role || 'OWNER'
    const isOwner = userRole === 'OWNER'

    try {
      // 읽지 않은 알림들만 필터링
      const unreadNotifications = notifications.filter(n => !n.isRead)
      
      if (unreadNotifications.length === 0) {
        console.log('읽지 않은 알림이 없습니다.')
        return
      }

      console.log(`${unreadNotifications.length}개의 읽지 않은 알림을 읽음 처리합니다.`)

      // 로컬 상태 먼저 업데이트
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      )

      // 각 알림을 개별적으로 읽음 처리
      const promises = unreadNotifications.map(async (notification) => {
        try {
          if (isOwner) {
            await apiClient.put(apiPath(`/notifications/owner/${userId}/${notification.id}/read`))
          } else {
            await apiClient.put(apiPath(`/notifications/customer/${userId}/${notification.id}/read`))
          }
          console.log(`알림 ${notification.id} 읽음 처리 완료`)
        } catch (error) {
          console.error(`알림 ${notification.id} 읽음 처리 실패:`, error)
          throw error
        }
      })

      // 모든 알림 읽음 처리 완료 대기
      await Promise.all(promises)
      console.log('모든 알림 읽음 처리 완료')
    } catch (error) {
      console.error('모든 알림 읽음 상태 업데이트 오류:', error)
      // 서버 요청 실패 시 로컬 상태도 롤백
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: false }))
      )
    }
  }, [user?.id, user?.ownerId, user?.userId, user?.role, notifications])

  // 알림 추가 함수 (브라우저 알림 자동 표시)
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

  // 설정 기반 알림 추가 함수 (브라우저 알림 제어 가능)
  const addNotificationWithSettings = useCallback(
    (
      notificationData: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>,
      showBrowserNotification: boolean = true
    ) => {
      const newNotification: NotificationData = {
        ...notificationData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      setNotifications(prev => [newNotification, ...prev])

      // 설정에 따라 브라우저 알림 표시
      if (
        showBrowserNotification &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
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
        connectSSE().catch(console.error)

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
    getNotificationCategory,
    getNotificationIcon,
  }
}
