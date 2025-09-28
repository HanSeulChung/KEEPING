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
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fcmToken')
    }
    return null
  })
  const sseAbortControllerRef = useRef<AbortController | null>(null)
  const sseConnectingRef = useRef(false)
  const isVisibleRef = useRef(true)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const seenEventKeysRef = useRef<Set<string>>(new Set())

  // 역할/식별자 보조 함수들 (숫자 id 강제)
  const getUserRole = useCallback((): 'OWNER' | 'CUSTOMER' => {
    return (user?.role === 'CUSTOMER' ? 'CUSTOMER' : 'OWNER') as
      | 'OWNER'
      | 'CUSTOMER'
  }, [user?.role])

  const getUserNumericId = useCallback((): number | null => {
    const raw =
      (user as any)?.ownerId ?? (user as any)?.userId ?? (user as any)?.id
    const num = Number(raw)
    if (!Number.isFinite(num) || num <= 0) return null
    return num
  }, [user?.ownerId, user?.userId, user?.id])

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

  // 토큰 캐시 관리 (7일 생존 기간 고려)
  const tokenCache = useRef<{
    token: string | null
    timestamp: number
    expiresAt: number
  }>({
    token: null,
    timestamp: 0,
    expiresAt: 0,
  })

  // 토큰 유효성 검사 (7일 생존 기간 기준)
  const isTokenValid = useCallback((token: string | null): boolean => {
    if (!token) return false

    const now = Date.now()
    const tokenAge = now - tokenCache.current.timestamp
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7일 (밀리초)

    // 토큰이 7일 이내이고 아직 만료되지 않았으면 유효
    return tokenAge < maxAge && now < tokenCache.current.expiresAt
  }, [])

  // 최적화된 토큰 갱신 함수
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      // 캐시된 토큰이 유효하면 재사용
      if (tokenCache.current.token && isTokenValid(tokenCache.current.token)) {
        console.log('[SSE] 캐시된 토큰 사용 (갱신 생략)')
        return tokenCache.current.token
      }

      console.log('[SSE] accessToken 갱신 시도')
      const refreshResponse = await fetch(buildURL('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        const newAccessToken = refreshData.data?.accessToken
        if (newAccessToken) {
          const now = Date.now()
          const expiresAt = now + 7 * 24 * 60 * 60 * 1000 // 7일 후 만료

          // 토큰 캐시 업데이트
          tokenCache.current = {
            token: newAccessToken,
            timestamp: now,
            expiresAt: expiresAt,
          }

          localStorage.setItem('accessToken', newAccessToken)
          localStorage.setItem('tokenTimestamp', now.toString())
          localStorage.setItem('tokenExpiresAt', expiresAt.toString())

          useAuthStore.getState().setAccessToken(newAccessToken)
          console.log('[SSE] accessToken 갱신 성공')
          return newAccessToken
        }
      }
      console.warn('[SSE] accessToken 갱신 실패: 응답에 토큰 없음')
      return null
    } catch (error) {
      console.error('[SSE] accessToken 갱신 실패:', error)
      return null
    }
  }, [isTokenValid])

  // 네트워크 상태 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      reconnectAttemptsRef.current = 0
      if (isVisibleRef.current) {
        connectSSE().catch(console.error)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsConnected(false)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }

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
        connectSSE().catch(console.error)
      } else {
        disconnectSSE()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isOnline])

  // 토큰 캐시 초기화 (컴포넌트 마운트 시)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedToken = localStorage.getItem('accessToken')
      const cachedTimestamp = localStorage.getItem('tokenTimestamp')
      const cachedExpiresAt = localStorage.getItem('tokenExpiresAt')

      if (cachedToken && cachedTimestamp && cachedExpiresAt) {
        tokenCache.current = {
          token: cachedToken,
          timestamp: parseInt(cachedTimestamp),
          expiresAt: parseInt(cachedExpiresAt),
        }
        console.log('[SSE] 토큰 캐시 복원됨')
      }
    }
  }, [])

  // SSE 연결 (최적화된 토큰 관리)
  const connectSSE = useCallback(async () => {
    if (sseAbortControllerRef.current || sseConnectingRef.current || !isOnline)
      return

    const userId = getUserNumericId()
    if (!userId) return

    // 최적화된 토큰 가져오기 (필요시에만 갱신)
    const accessToken = await refreshAccessToken()
    if (!accessToken) {
      console.warn('[SSE] 유효한 토큰을 가져올 수 없어 연결 중단')
      return
    }

    // API 주소는 절대 변경하지 않음 - 기존 config 사용
    const rawBase = apiConfig.baseURL.replace(/\/$/, '')
    const userRole = getUserRole()
    const ssePath =
      userRole === 'CUSTOMER'
        ? `/api/notifications/subscribe/customer/${userId}`
        : `/api/notifications/subscribe/owner/${userId}`

    const sseUrl = `${rawBase}${ssePath}`
    console.log('[SSE] connecting...', {
      url: sseUrl,
      userId,
      userRole,
      hasToken: !!accessToken,
    })

    const controller = new AbortController()
    sseAbortControllerRef.current = controller
    sseConnectingRef.current = true

    // 최적화된 헤더 설정
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    }

    // 토큰이 있으면 Authorization 헤더에 추가
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    // 개발 모드: 콘솔 외에도 디버그 정보 저장 (헤더 포함 여부 확인용)
    if (process.env.NODE_ENV === 'development') {
      try {
        const authHeader = headers['Authorization'] || ''
        const debug = {
          url: sseUrl,
          hasAuthorization: Boolean(authHeader),
          authorizationPreview: authHeader
            ? `${authHeader.slice(0, 24)}...`
            : null,
          timestamp: new Date().toISOString(),
        }
        ;(window as any).__KEEPING_SSE_DEBUG__ = debug
        localStorage.setItem('sse:url', sseUrl)
        localStorage.setItem('sse:hasAuth', String(debug.hasAuthorization))
        if (debug.authorizationPreview) {
          localStorage.setItem('sse:authPreview', debug.authorizationPreview)
        } else {
          localStorage.removeItem('sse:authPreview')
        }
        localStorage.setItem('sse:time', debug.timestamp)
      } catch {}
    }

    fetchEventSource(sseUrl, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
      headers,
      onopen: async response => {
        if (response.ok) {
          console.log('[SSE] connected')
          // 연결 즉시 상태 반영
          setIsConnected(true)
          reconnectAttemptsRef.current = 0
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        } else if (response.status === 401) {
          console.log('[SSE] 401 error - token refresh required')

          // 토큰 캐시 무효화
          tokenCache.current = { token: null, timestamp: 0, expiresAt: 0 }

          const newToken = await refreshAccessToken()
          if (newToken) {
            console.log('[SSE] 토큰 갱신 성공, 재연결 시도')
            if (sseAbortControllerRef.current) {
              sseAbortControllerRef.current.abort()
              sseAbortControllerRef.current = null
            }
            setTimeout(() => {
              if (isVisibleRef.current && isOnline) {
                connectSSE().catch(console.error)
              }
            }, 1000)
          } else {
            console.error('[SSE] 토큰 갱신 실패, 연결 중단')
          }
          throw new Error('Token refresh required')
        } else {
          console.error(
            '[SSE] open failed:',
            response.status,
            response.statusText
          )
          throw new Error('SSE open failed')
        }
      },
      onmessage: event => {
        try {
          if (!isConnected) {
            console.log('[SSE] connected')
            setIsConnected(true)
          }

          // 문자열 데이터에 공백/프리픽스가 포함된 경우를 대비해 견고한 파싱
          let rawText =
            typeof event.data === 'string' ? event.data.trim() : event.data

          if (typeof rawText === 'string' && rawText.startsWith('data:')) {
            rawText = rawText.slice(5).trim()
          }

          let data: any = null
          if (typeof rawText === 'string') {
            try {
              data = JSON.parse(rawText)
            } catch {
              const firstBrace = rawText.indexOf('{')
              if (firstBrace >= 0) {
                const maybeJson = rawText.slice(firstBrace)
                try {
                  data = JSON.parse(maybeJson)
                } catch (e) {
                  console.warn('[SSE] JSON parse failed:', rawText)
                  return
                }
              } else {
                console.log('[SSE] non-JSON text message:', rawText)
                return
              }
            }
          } else {
            data = rawText
          }

          if (data.type === 'connection') return

          // 중복 방지 키 계산 (notificationId 우선, 그 다음 transactionUniqueNo)
          const dedupeKey = String(
            data?.notificationId ??
              data?.transactionUniqueNo ??
              `${data?.notificationType || ''}-${data?.createdAt || ''}`
          )
          if (seenEventKeysRef.current.has(dedupeKey)) {
            return
          }
          seenEventKeysRef.current.add(dedupeKey)
          // 메모리 관리: 너무 커지지 않도록 앞부분 정리
          if (seenEventKeysRef.current.size > 500) {
            const it = seenEventKeysRef.current.values()
            for (let i = 0; i < 200; i++) {
              const v = it.next()
              if (v.done) break
              seenEventKeysRef.current.delete(v.value)
            }
          }

          const notification: NotificationData = convertNotificationData(data)
          setNotifications(prev => {
            const next = [notification, ...prev]
            return next.length > 200 ? next.slice(0, 200) : next
          })

          // 백그라운드에서는 브라우저 알림 표시하지 않음 (FCM이 처리)
          if (
            isVisibleRef.current &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            showBrowserNotification(notification)
          }
        } catch (error) {
          console.warn('[SSE] message parsing error', error)
        }
      },
      onerror: error => {
        console.warn('[SSE] error', error)
        setIsConnected(false)
      },
    })
      .catch(error => {
        if (controller.signal.aborted) {
          console.log('[SSE] disconnected')
          return
        }
        console.error('[SSE] connection failed', error)
        setIsConnected(false)
      })
      .finally(() => {
        sseConnectingRef.current = false
      })
  }, [getUserNumericId, getUserRole, isOnline])

  const disconnectSSE = useCallback(() => {
    if (sseAbortControllerRef.current) {
      sseAbortControllerRef.current.abort()
      sseAbortControllerRef.current = null
      setIsConnected(false)
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // 알림 타입별 아이콘 및 설정 가져오기 (강화된 분류)
  const getNotificationConfig = (type: NotificationType) => {
    const category = getNotificationCategory(type)
    const icon = getNotificationIcon(type)

    // 상세한 카테고리별 설정
    const configs = {
      payment: {
        icon: '/icons/qr.png',
        requireInteraction: ['PAYMENT_REQUEST'].includes(type),
        duration: 8000, // 결제는 중요하니 8초
        emoji: '💳',
        color: '#22c55e', // 초록색
        vibrate: [300, 100, 300, 100, 300],
        priority: 'high',
      },
      point: {
        icon: '/icons/qr.png',
        requireInteraction: false,
        duration: 5000,
        emoji: '💎',
        color: '#8b5cf6', // 보라색
        vibrate: [150, 50, 150],
        priority: 'normal',
      },
      group: {
        icon: '/icons/qr.png',
        requireInteraction: ['GROUP_INVITATION'].includes(type),
        duration: 6000,
        emoji: '👥',
        color: '#06b6d4', // 청록색
        vibrate: [200, 100, 200, 100, 200],
        priority: 'high',
      },
      order: {
        icon: '/icons/qr.png',
        requireInteraction: false,
        duration: 5000,
        emoji: '📦',
        color: '#3b82f6', // 파란색
        vibrate: [200, 100, 200],
        priority: 'normal',
      },
      default: {
        icon: '/icons/bell.svg',
        requireInteraction: false,
        duration: 5000,
        emoji: '🔔',
        color: '#6b7280', // 회색
        vibrate: [200, 100, 200],
        priority: 'low',
      },
    }

    // 특정 타입별 추가 설정
    const specificConfigs = {
      PAYMENT_REQUEST: {
        ...configs.payment,
        emoji: '💰',
        color: '#f59e0b', // 주황색 - 요청
        requireInteraction: true,
        duration: 10000, // 결제 요청은 더 오래
      },
      PAYMENT_CANCELED: {
        ...configs.payment,
        emoji: '❌',
        color: '#ef4444', // 빨간색 - 취소
      },
      GROUP_INVITATION: {
        ...configs.group,
        requireInteraction: true,
        duration: 8000,
      },
    }

    return (
      (specificConfigs as any)[type] || configs[category] || configs.default
    )
  }

  // 민감한 정보 마스킹 함수
  const maskSensitiveInfo = (
    text: string,
    type: 'store' | 'customer' | 'amount' = 'store'
  ): string => {
    if (!text) return ''

    switch (type) {
      case 'store':
        if (text.length <= 2) return text
        return text.substring(0, 2) + '*'.repeat(Math.max(1, text.length - 2))
      case 'customer':
        if (text.length <= 1) return text
        return text.substring(0, 1) + '*'.repeat(text.length - 1)
      case 'amount':
        const num = parseInt(text)
        if (num >= 100000) return `${Math.floor(num / 10000)}만원`
        if (num >= 10000) return `${Math.floor(num / 1000)}천원`
        return `${num.toLocaleString()}원`
      default:
        return text
    }
  }

  // 브라우저 알림 표시 (민감한 정보 보호)
  const showBrowserNotification = (notification: NotificationData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const config = getNotificationConfig(notification.type)

      // 알림 메시지에서 민감한 정보 마스킹
      let safeMessage = notification.message
      if (notification.message) {
        // 가게명 마스킹 (예: "스타벅스" -> "스타**")
        safeMessage = safeMessage.replace(
          /([가-힣]{2,})에서/g,
          (match, storeName) => {
            return `${maskSensitiveInfo(storeName, 'store')}에서`
          }
        )

        // 금액 정보 마스킹 (예: "15,000원" -> "1만원")
        safeMessage = safeMessage.replace(
          /(\d{1,3}(?:,\d{3})*)원/g,
          (match, amount) => {
            const num = parseInt(amount.replace(/,/g, ''))
            return maskSensitiveInfo(num.toString(), 'amount')
          }
        )
      }

      const browserNotification = new Notification(
        `${config.emoji} ${notification.title}`,
        {
          body: safeMessage,
          icon: config.icon,
          badge:
            config.category === 'group'
              ? '/icons/badge-group.svg'
              : '/icons/badge-personal.svg',
          tag: `${notification.type}-${notification.id}`,
          requireInteraction: config.requireInteraction,
          silent: false,
          data: {
            type: notification.type,
            category: config.category || 'default',
            priority: config.priority || 'normal',
            color: config.color || '#000000',
            timestamp: Date.now(),
          },
        }
      )

      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
        markAsRead(notification.id)
        try {
          const role = (useAuthStore.getState().user?.role || 'OWNER') as
            | 'OWNER'
            | 'CUSTOMER'
          const target =
            role === 'OWNER' ? '/owner/notification' : '/customer/notification'
          window.location.href = target
        } catch {}
      }

      // 타입별 다른 시간 후 자동 닫기
      setTimeout(() => {
        browserNotification.close()
      }, config.duration)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission()
    setIsPermissionGranted(granted)
    return granted
  }

  const registerFCM = async (): Promise<boolean> => {
    try {
      if (!user?.id) return false
      const hasPermission = await requestPermission()
      if (!hasPermission) return false
      const token = await getFcmToken()
      if (!token) {
        console.log('[FCM] 토큰을 가져올 수 없습니다.')
        if (process.env.NODE_ENV === 'development') {
          console.log('[FCM] 개발 환경: 토큰 없어도 계속 진행')
          return true // 개발 환경에서는 토큰 없어도 true 반환
        }
        return false
      }

      // 이미 등록된 토큰인지 확인 (성능 최적화)
      const storedToken = localStorage.getItem('fcmToken')
      const isTokenRegistered = localStorage.getItem(`fcmRegistered_${user.id}`)

      if (storedToken === token && isTokenRegistered === 'true') {
        console.log('[FCM] 이미 등록된 토큰 - 건너뜀')
        setFcmToken(token)
        return true
      }

      // FCM 토큰을 state와 localStorage에 저장
      setFcmToken(token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('fcmToken', token)
      }
      const isOwner = (user.role || 'OWNER') === 'OWNER'
      const ownerId = user.ownerId || user.id
      const customerId = user.userId || user.id

      try {
        if (isOwner && ownerId) {
          await registerOwnerFCMToken(Number(ownerId), token)
        } else if (!isOwner && customerId) {
          await registerCustomerFCMToken(Number(customerId), token)
        }

        // 등록 성공 시 플래그 저장
        localStorage.setItem(`fcmRegistered_${user.id}`, 'true')
      } catch (registrationError: any) {
        // 409 에러는 이미 등록된 상태이므로 성공으로 처리
        if (registrationError?.response?.status === 409) {
          console.log('이미 등록된 토큰 - 정상 처리')
          localStorage.setItem(`fcmRegistered_${user.id}`, 'true')
        } else {
          throw registrationError
        }
      }
      return true
    } catch {
      return false
    }
  }

  const unregisterFCM = async (): Promise<void> => {
    try {
      if (user?.id && fcmToken) {
        await deleteFCMToken(fcmToken)
        setFcmToken(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('fcmToken')
        }
      }
    } catch {}
  }

  // PWA 서비스 워커 등록 (모바일 친화적)
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log('이 브라우저는 서비스 워커를 지원하지 않습니다.')
      return
    }

    // 개발 모드에서는 서비스 워커 등록 비활성화
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 모드: Service Worker 등록 건너뜀')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('서비스 워커 등록됨:', registration)

      // iOS/Android PWA 지원을 위한 Push 구독
      if ('PushManager' in window) {
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          })

          // 서버에 구독 정보 전송 (모바일 최적화)
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

          console.log('Web Push 구독 완료 (모바일 지원)')
        } catch (pushError) {
          console.log(
            'Push 구독 실패 (일부 모바일 브라우저에서 정상):',
            pushError
          )
        }
      }
    } catch (error) {
      console.error('서비스 워커 등록 오류:', error)
    }
  }
  const markAsRead = useCallback(
    async (id: number) => {
      const userId = getUserNumericId()
      if (!userId) return
      const isOwner = getUserRole() === 'OWNER'
      if (isOwner) {
        await apiClient.put(`/api/notifications/owner/${userId}/${id}/read`)
      } else {
        await apiClient.put(`/api/notifications/customer/${userId}/${id}/read`)
      }
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      )
    },
    [getUserNumericId, getUserRole]
  )

  const markAllAsRead = useCallback(async () => {
    const userId = getUserNumericId()
    if (!userId) return
    const isOwner = getUserRole() === 'OWNER'
    const unreadNotifications = notifications.filter(n => !n.isRead)
    if (unreadNotifications.length === 0) return
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
    // 배지 동기화 이벤트 (선택)
    try {
      if (typeof window !== 'undefined') {
        const ev = new CustomEvent('notifications:update', {
          detail: { unreadCount: 0 },
        })
        window.dispatchEvent(ev)
      }
    } catch {}
    await Promise.all(
      unreadNotifications.map(async notification => {
        if (isOwner) {
          await apiClient.put(
            `/api/notifications/owner/${userId}/${notification.id}/read`
          )
        } else {
          await apiClient.put(
            `/api/notifications/customer/${userId}/${notification.id}/read`
          )
        }
      })
    )
  }, [getUserNumericId, getUserRole, notifications])

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
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/icons/logo_owner+cust.png',
          badge: '/icons/logo_owner+cust.png',
          tag: String(newNotification.id),
        })
      }
    },
    []
  )

  const fetchNotifications = async () => {
    const userId = getUserNumericId()
    if (!userId) return
    const isOwner = getUserRole() === 'OWNER'
    const notifications = isOwner
      ? await notificationApi.owner.getNotificationList(userId)
      : await notificationApi.customer.getNotificationList(userId)
    const convertedNotifications = notifications.map(convertNotificationData)
    setNotifications(convertedNotifications)
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    const initializeNotificationSystem = async () => {
      if (typeof window !== 'undefined' && user?.id && isOnline) {
        if ('Notification' in window) {
          setIsPermissionGranted(Notification.permission === 'granted')
        }

        // 권한 미부여 시 권한 요청 및 FCM 등록 (백그라운드 알림 보장)
        if ('Notification' in window && Notification.permission !== 'granted') {
          try {
            await registerFCM()
          } catch {}
        }

        // 알림 목록 로드
        fetchNotifications()

        // SSE 연결 우선 시도
        try {
          await connectSSE()
          console.log('[NOTIFICATION] SSE 연결 성공')
        } catch (error) {
          console.warn('[NOTIFICATION] SSE 연결 실패, FCM으로 백업')
          // SSE 연결 실패시에만 FCM 등록
          registerFCM()
        }

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
