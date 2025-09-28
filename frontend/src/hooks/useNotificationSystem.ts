'use client'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useCallback, useEffect, useRef, useState } from 'react'

import apiClient from '@/api/axios'
import { apiConfig, buildURL } from '@/api/config'
// FCM API 비활성화 - SSE만 사용
// import {
//   deleteFCMToken,
//   registerCustomerFCMToken,
//   registerOwnerFCMToken,
// } from '@/api/fcmApi'
import { notificationApi } from '@/api/notificationApi'
// FCM 기능 활성화
import { usePaymentState } from '@/hooks/usePaymentState'
import {
  getFcmToken,
  registerServiceWorker,
  requestNotificationPermission,
  setupForegroundMessageListener,
} from '@/lib/firebaseConfig'
import { useAuthStore } from '@/store/useAuthStore'
import {
  NotificationCategory,
  NotificationData,
  NotificationType,
  getNotificationCategory,
  getNotificationIcon,
  getNotificationTitle,
} from '@/types/notification'

interface ModalNotificationState {
  isOpen: boolean
  type?: NotificationType
  title?: string
  message?: string
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  autoCloseTime?: number
}

interface UseNotificationSystemReturn {
  notifications: NotificationData[]
  unreadCount: number
  isConnected: boolean
  isPermissionGranted: boolean
  modalNotification: ModalNotificationState
  requestPermission: () => Promise<boolean>
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  addNotification: (
    notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>
  ) => void
  showModalNotification: (
    notification: Omit<ModalNotificationState, 'isOpen'>
  ) => void
  hideModalNotification: () => void
  notifyOwnerPaymentResult: (result: {
    intentPublicId: string
    storeName: string
    customerName: string
    amount: number
    isApproved: boolean
  }) => Promise<void>
  toasts: NotificationData[]
  addToast: (notification: NotificationData) => void
  removeToast: (id: number) => void
  handleToastClick: (notification: NotificationData) => void
  getNotificationCategory: (type: NotificationType) => NotificationCategory
  getNotificationIcon: (type: NotificationType) => string
  fcmToken: string | null
  isFcmInitialized: boolean
  initializeFCM: () => Promise<boolean>
  registerFCMToken: () => Promise<boolean>
  unregisterFCMToken: () => Promise<boolean>
}

export const useNotificationSystem = (): UseNotificationSystemReturn => {
  const { user } = useAuthStore()
  const { setPaymentIntent } = usePaymentState()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [modalNotification, setModalNotification] =
    useState<ModalNotificationState>({
      isOpen: false,
    })
  const [isOnline, setIsOnline] = useState(true)
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [isFcmInitialized, setIsFcmInitialized] = useState(false)
  const sseAbortControllerRef = useRef<AbortController | null>(null)
  const sseConnectingRef = useRef(false)
  const isVisibleRef = useRef(true)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const _maxReconnectAttempts = 5
  const seenEventKeysRef = useRef<Set<string>>(new Set())

  // SSE만 사용 - FCM 제거
  const [notificationStrategy, setNotificationStrategy] = useState<
    'SSE' | 'FCM'
  >('SSE')
  const sseFailureCountRef = useRef(0)
  const _maxSSEFailures = 3

  // 디바이스 타입 감지
  const _getDeviceType = useCallback((): 'mobile' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop'
    return window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent)
      ? 'mobile'
      : 'desktop'
  }, [])

  // SSE만 사용 - 전략 결정 로직 단순화
  const determineNotificationStrategy = useCallback((): 'SSE' | 'FCM' => {
    // FCM이 초기화되었으면 FCM 사용, 아니면 SSE 사용
    return isFcmInitialized ? 'FCM' : 'SSE'
  }, [isFcmInitialized])

  // FCM 초기화
  const initializeFCM = useCallback(async (): Promise<boolean> => {
    try {
      // Service Worker 등록
      const swRegistered = await registerServiceWorker()
      if (!swRegistered) {
        console.warn('Service Worker 등록 실패, FCM 비활성화')
        return false
      }

      // 알림 권한 요청
      const permissionGranted = await requestNotificationPermission()
      if (!permissionGranted) {
        console.warn('알림 권한 거부, FCM 비활성화')
        return false
      }

      // FCM 토큰 발급
      const token = await getFcmToken()
      if (!token) {
        console.warn('FCM 토큰 발급 실패')
        return false
      }

      setFcmToken(token)
      setIsFcmInitialized(true)
      setIsPermissionGranted(true)

      // 포그라운드 메시지 리스너 설정
      setupForegroundMessageListener()

      console.log('FCM 초기화 성공 ✅')
      return true
    } catch (error) {
      console.error('FCM 초기화 실패:', error)
      return false
    }
  }, [])

  // 역할/식별자 보조 함수들 (숫자 id 강제)
  const getUserRole = useCallback((): 'OWNER' | 'CUSTOMER' => {
    return (user?.role === 'CUSTOMER' ? 'CUSTOMER' : 'OWNER') as
      | 'OWNER'
      | 'CUSTOMER'
  }, [user?.role])

  const getUserNumericId = useCallback((): number | null => {
    const raw =
      (user as { ownerId?: number; userId?: number; id?: number })?.ownerId ??
      (user as { ownerId?: number; userId?: number; id?: number })?.userId ??
      (user as { ownerId?: number; userId?: number; id?: number })?.id
    const num = Number(raw)
    if (!Number.isFinite(num) || num <= 0) return null
    return num
  }, [user?.ownerId, user?.userId, user?.id])

  // FCM 토큰 등록
  const registerFCMToken = useCallback(async (): Promise<boolean> => {
    if (!fcmToken || !user?.id) return false

    try {
      const userId = getUserNumericId()
      if (!userId) return false

      const isOwner = getUserRole() === 'OWNER'
      const success = isOwner
        ? await notificationApi.fcm.registerOwnerToken(userId, fcmToken)
        : await notificationApi.fcm.registerCustomerToken(userId, fcmToken)

      if (success) {
        console.log('FCM 토큰 등록 성공 ✅')
      } else {
        console.warn('FCM 토큰 등록 실패 ❌')
      }

      return success
    } catch (error) {
      console.error('FCM 토큰 등록 오류:', error)
      return false
    }
  }, [fcmToken, user?.id, getUserNumericId, getUserRole])

  // FCM 토큰 해제
  const unregisterFCMToken = useCallback(async (): Promise<boolean> => {
    if (!fcmToken) return true

    try {
      const success = await notificationApi.fcm.unregisterToken(fcmToken)
      if (success) {
        console.log('FCM 토큰 해제 성공 ✅')
        setFcmToken(null)
        setIsFcmInitialized(false)
      } else {
        console.warn('FCM 토큰 해제 실패 ❌')
      }

      return success
    } catch (error) {
      console.error('FCM 토큰 해제 오류:', error)
      return false
    }
  }, [fcmToken])

  const convertNotificationData = (backendData: any): NotificationData => {
    return {
      id: backendData.notificationId as number,
      type: backendData.notificationType as NotificationType,
      title: getNotificationTitle(
        backendData.notificationType as NotificationType
      ),
      message: backendData.content as string,
      timestamp: backendData.createdAt as string,
      isRead: backendData.isRead as boolean,
      data: {
        // 결제 의도 식별자(public_id)
        intentId:
          backendData.publicId ||
          backendData.intentId ||
          backendData.paymentIntentId ||
          null,
        intentPublicId:
          backendData.publicId || backendData.intentPublicId || null,
        customerName: backendData.customerName,
        amount: backendData.amount,
        storeName: backendData.storeName,
        storeId: backendData.storeId,
        items: backendData.items || [],
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

  // 토큰 유효성 검사 (7일 토큰용 - 6일로 제한)
  const isTokenValid = useCallback((token: string | null): boolean => {
    if (!token) return false

    const now = Date.now()
    const tokenAge = now - tokenCache.current.timestamp
    const maxAge = 6 * 24 * 60 * 60 * 1000 // 6일 (1일 여유)

    // 토큰이 6일 이내이고 아직 만료되지 않았으면 유효
    return tokenAge < maxAge && now < tokenCache.current.expiresAt
  }, [])

  // SSE 토큰 갱신 중복 방지 플래그
  const sseRefreshingRef = useRef(false)

  // 최적화된 토큰 갱신 함수
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      // 캐시된 토큰이 유효하면 재사용
      if (tokenCache.current.token && isTokenValid(tokenCache.current.token)) {
        console.log('[SSE] 캐시된 토큰 사용 (갱신 생략)')
        return tokenCache.current.token
      }

      // 이미 갱신 중이면 대기
      if (sseRefreshingRef.current) {
        console.log('[SSE] 토큰 갱신 대기 중...')
        return new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (
              tokenCache.current.token &&
              isTokenValid(tokenCache.current.token)
            ) {
              clearInterval(checkInterval)
              resolve(tokenCache.current.token)
            }
          }, 100)

          // 5초 후 타임아웃
          setTimeout(() => {
            clearInterval(checkInterval)
            resolve(null)
          }, 5000)
        })
      }

      sseRefreshingRef.current = true
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
          const expiresAt = now + 6 * 24 * 60 * 60 * 1000 // 6일 후 만료 (1일 여유)

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
    } finally {
      sseRefreshingRef.current = false
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

  // 알림 전략 업데이트 함수
  const updateNotificationStrategy = useCallback(() => {
    const newStrategy = determineNotificationStrategy()
    if (newStrategy !== notificationStrategy) {
      console.log(
        `[NOTIFICATION] 전략 변경: ${notificationStrategy} -> ${newStrategy}`
      )
      setNotificationStrategy(newStrategy)

      // SSE만 사용 - 전략 변경 없음
      if (newStrategy === 'SSE') {
        // SSE 연결 유지
        if (!isConnected) {
          connectSSE().catch(console.error)
        }
      }
    }
  }, [determineNotificationStrategy, notificationStrategy])

  // 앱 가시성 상태 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      const wasVisible = isVisibleRef.current
      isVisibleRef.current = !document.hidden

      // 백그라운드에서 포그라운드로 돌아올 때
      if (!wasVisible && isVisibleRef.current) {
        // localStorage에서 백그라운드에서 업데이트된 읽지 않은 개수 동기화
        try {
          const storedCount = localStorage.getItem('unreadCount')
          if (storedCount !== null) {
            const count = parseInt(storedCount)
            if (!isNaN(count) && count >= 0) {
              setUnreadCount(count)
              console.log(`[VISIBILITY] 읽지 않은 알림 개수 동기화: ${count}`)
            }
          }
        } catch (error) {
          console.warn('[VISIBILITY] 읽지 않은 알림 개수 동기화 실패:', error)
        }
      }

      // 가시성 변경 시 전략 재평가
      if (wasVisible !== isVisibleRef.current) {
        updateNotificationStrategy()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [updateNotificationStrategy])

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

    // SSE만 사용 - 항상 연결 시도

    const userId = getUserNumericId()
    if (!userId) return

    // 최적화된 토큰 가져오기 (필요시에만 갱신)
    const accessToken = await refreshAccessToken()
    if (!accessToken) {
      console.warn('[SSE] 유효한 토큰을 가져올 수 없어 연결 중단')
      sseFailureCountRef.current++
      updateNotificationStrategy()
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
        ;(window as { __KEEPING_SSE_DEBUG__?: unknown }).__KEEPING_SSE_DEBUG__ =
          debug
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
                } catch (_e) {
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

          // 중복 체크
          if (seenEventKeysRef.current.has(dedupeKey)) {
            console.log('[SSE] 중복 알림 무시:', dedupeKey)
            return
          }

          // 추가 중복 체크: 같은 타입의 알림이 최근 5초 내에 왔는지 확인
          const now = Date.now()
          const recentKey = `recent-${data?.notificationType}-${data?.receiverId || 'unknown'}`
          const lastTime = localStorage.getItem(recentKey)

          if (lastTime && now - parseInt(lastTime) < 5000) {
            console.log('[SSE] 최근 중복 알림 무시:', recentKey)
            return
          }

          // 중복 방지 키 저장
          seenEventKeysRef.current.add(dedupeKey)
          localStorage.setItem(recentKey, now.toString())
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

          // 고객이고 결제 요청 알림인 경우 intentPublicId 저장
          if (
            getUserRole() === 'CUSTOMER' &&
            notification.type === 'PAYMENT_REQUEST'
          ) {
            const intentPublicId =
              data.publicId || data.intentPublicId || data.intentId

            if (intentPublicId) {
              // 결제 상태 관리 훅에 저장
              setPaymentIntent(
                intentPublicId,
                {
                  storeName:
                    data.storeName || notification.data?.storeName || '매장',
                  amount: data.amount || notification.data?.amount || 0,
                  customerName:
                    data.customerName ||
                    notification.data?.customerName ||
                    '고객',
                  items: data.items || [], // 주문 상세 정보가 있다면
                },
                data.intentId // 실제 intentId가 별도로 있다면
              )

              console.log('💳 결제 의도 저장됨:', {
                intentPublicId,
                storeName: data.storeName,
                amount: data.amount,
              })
            }
          }

          setNotifications(prev => {
            const next = [notification, ...prev]
            return next.length > 200 ? next.slice(0, 200) : next
          })
          // 새 알림이 오면 읽지 않은 개수 증가
          setUnreadCount(prev => prev + 1)

          // 결제 요청은 항상 모달로 표시 (백그라운드에서도)
          if (
            notification.type === 'PAYMENT_REQUEST' &&
            getUserRole() === 'CUSTOMER'
          ) {
            console.log('🚨 결제 요청 모달 강제 표시')
            showInPageModal(notification)
          } else if (isVisibleRef.current) {
            // 일반 알림은 포그라운드에서만 모달로 표시
            showInPageModal(notification)
          } else {
            console.log('📱 백그라운드 상태 - 일반 알림 모달 스킵')
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
    const _icon = getNotificationIcon(type)

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

    return ((specificConfigs as Record<string, unknown>)[type] ||
      (configs[category] as Record<string, unknown>) ||
      (configs.default as Record<string, unknown>)) as {
      emoji: string
      icon: string
      category: string
      requireInteraction: boolean
      priority: 'high' | 'normal' | 'low'
      color: string
      vibrate: number[]
      duration: number
    }
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
  const _showBrowserNotification = (notification: NotificationData) => {
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

      // 포그라운드 진동 보조 (일부 브라우저는 NotificationOptions.vibrate를 무시)
      try {
        if (
          navigator &&
          'vibrate' in navigator &&
          Array.isArray(config.vibrate)
        ) {
          // 진동은 사용자 제스처 이후 컨텍스트에서만 동작할 수 있음(브라우저별)
          // 실패해도 앱 흐름에 영향 없도록 try/catch 유지
          ;(
            navigator as { vibrate?: (pattern: number | number[]) => void }
          ).vibrate?.(config.vibrate)
        }
      } catch {}

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
    // 브라우저 알림 권한 요청 (FCM 없이)
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      setIsPermissionGranted(granted)
      return granted
    }
    return false
  }

  // FCM 함수들 제거 - SSE만 사용

  // PWA 서비스 워커는 firebase-messaging-sw.js로 통합됨
  // 중복 등록 방지를 위해 별도 등록 제거
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
      // 읽음 처리 후 로컬 상태에서 개수 감소
      setUnreadCount(prev => Math.max(0, prev - 1))
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

  // 모달 알림 관련 함수들
  const showModalNotification = useCallback(
    (notification: Omit<ModalNotificationState, 'isOpen'>) => {
      setModalNotification({
        ...notification,
        isOpen: true,
      })
    },
    []
  )

  const hideModalNotification = useCallback(() => {
    setModalNotification({
      isOpen: false,
    })
  }, [])

  const [toasts, setToasts] = useState<NotificationData[]>([])

  // 점주에게 결제 결과 알림 전송
  const notifyOwnerPaymentResult = useCallback(
    async (result: {
      intentPublicId: string
      storeName: string
      customerName: string
      amount: number
      isApproved: boolean
    }) => {
      try {
        // 점주에게 결제 결과 알림 전송 API 호출
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://j13a509.p.ssafy.io/api'}/notifications/owner/payment-result`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({
              intentPublicId: result.intentPublicId,
              storeName: result.storeName,
              customerName: result.customerName,
              amount: result.amount,
              isApproved: result.isApproved,
              timestamp: new Date().toISOString(),
            }),
          }
        )

        if (response.ok) {
          console.log('점주에게 결제 결과 알림 전송 성공')
        } else {
          console.error('점주에게 결제 결과 알림 전송 실패:', response.status)
        }
      } catch (error) {
        console.error('점주에게 결제 결과 알림 전송 오류:', error)
      }
    },
    []
  )

  // 토스트 알림 제거
  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // 토스트 알림 추가
  const addToast = useCallback(
    (notification: NotificationData) => {
      setToasts(prev => [...prev, notification])

      // 자동 제거 (PAYMENT_REQUEST는 8초, 나머지는 5초)
      const duration = notification.type === 'PAYMENT_REQUEST' ? 8000 : 5000
      setTimeout(() => {
        removeToast(notification.id)
      }, duration)
    },
    [removeToast]
  )

  // 토스트 클릭 처리 - URL 라우팅 방식
  const handleToastClick = useCallback(
    (notification: NotificationData) => {
      console.log('🍞 토스트 클릭됨:', notification.type, notification)

      // 알림 읽음 처리
      markAsRead(notification.id)

      // 알림 페이지로 이동 (모달은 URL 파라미터로 처리)
      const _userRole = getUserRole()
      const basePath =
        _userRole === 'OWNER' ? '/owner/notification' : '/customer/notification'

      if (typeof window !== 'undefined') {
        if (notification.type === 'PAYMENT_REQUEST') {
          // 결제 승인 모달을 위한 URL 파라미터 추가
          const params = new URLSearchParams()
          params.set('modal', 'payment-request')
          if (notification.data?.intentPublicId) {
            params.set('intentId', notification.data.intentPublicId)
          }
          if (notification.data?.customerName) {
            params.set('customerName', notification.data.customerName)
          }
          if (notification.data?.amount) {
            params.set('amount', notification.data.amount.toString())
          }
          if (notification.data?.storeName) {
            params.set('storeName', notification.data.storeName)
          }
          // pointInfo 제거됨

          const url = `${basePath}?${params.toString()}`
          console.log('💰 결제 승인 모달 URL로 이동:', url)
          window.location.href = url
        } else {
          // 일반 알림은 알림 페이지로 이동
          console.log('📋 알림 페이지로 이동:', basePath)
          window.location.href = basePath
        }
      }
    },
    [markAsRead, getUserRole]
  )

  // 인페이지 모달 알림 표시 함수 (브라우저 알림 대신)
  const showInPageModal = useCallback(
    (notification: NotificationData) => {
      const _userRole = getUserRole()

      // PAYMENT_REQUEST인 경우 PaymentApprovalModal만 표시 (토스트 없음)
      if (notification.type === 'PAYMENT_REQUEST') {
        // 결제 승인 모달을 위한 데이터 추출
        const paymentData = {
          intentPublicId:
            notification.data?.intentPublicId || notification.data?.intentId,
          customerName: notification.data?.customerName || '고객',
          amount: notification.data?.amount || 0,
          storeName: notification.data?.storeName || '매장',
          items: notification.data?.items || [],
        }

        // 결제 요청 알림을 토스트로 표시
        addToast(notification)
      } else {
        // 일반 알림은 토스트만 표시
        addToast(notification)
      }
    },
    [getUserRole, addToast]
  )

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
        const n = new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/icons/logo_owner+cust.png',
          badge: '/icons/logo_owner+cust.png',
          tag: String(newNotification.id),
          data: newNotification,
        })
        n.onclick = () => {
          try {
            const role = (useAuthStore.getState().user?.role || 'OWNER') as
              | 'OWNER'
              | 'CUSTOMER'
            const target =
              role === 'OWNER'
                ? '/owner/notification'
                : '/customer/notification'
            window.location.href = target
          } catch {}
        }
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

  const fetchUnreadCount = async () => {
    const userId = getUserNumericId()
    if (!userId) return
    const isOwner = getUserRole() === 'OWNER'
    try {
      const count = isOwner
        ? await notificationApi.owner.getUnreadCount(userId)
        : await notificationApi.customer.getUnreadCount(userId)
      setUnreadCount(count)
    } catch (error) {
      console.warn('읽지 않은 알림 개수 조회 실패:', error)
      // 백업으로 로컬 state에서 계산
      setUnreadCount(notifications.filter(n => !n.isRead).length)
    }
  }

  // 거절 알림 이벤트 리스너 추가
  useEffect(() => {
    const handleOwnerPaymentResult = (event: CustomEvent) => {
      const { storeName, amount, customerName, success } = event.detail

      // notifyOwnerPaymentResult 함수 호출 (객체 형태로 전달)
      notifyOwnerPaymentResult({
        intentPublicId: '', // 거절 시에는 intentPublicId가 없을 수 있음
        storeName,
        customerName,
        amount,
        isApproved: success,
      })
    }

    window.addEventListener(
      'notifyOwnerPaymentResult',
      handleOwnerPaymentResult as EventListener
    )

    return () => {
      window.removeEventListener(
        'notifyOwnerPaymentResult',
        handleOwnerPaymentResult as EventListener
      )
    }
  }, [])

  useEffect(() => {
    const initializeNotificationSystem = async () => {
      if (typeof window !== 'undefined' && user?.id && isOnline) {
        // FCM 초기화 시도
        const fcmInitialized = await initializeFCM()

        if (fcmInitialized) {
          // FCM 토큰 등록
          await registerFCMToken()
        }

        // 알림 목록 로드
        await fetchNotifications()

        // 읽지 않은 알림 개수 초기 조회 (한 번만)
        await fetchUnreadCount()

        // 알림 전략에 따라 연결
        const strategy = determineNotificationStrategy()
        if (strategy === 'SSE') {
          try {
            await connectSSE()
            console.log('[NOTIFICATION] SSE 연결 성공')
          } catch (error) {
            console.warn('[NOTIFICATION] SSE 연결 실패:', error)
          }
        } else {
          console.log('[NOTIFICATION] FCM 모드 활성화')
        }
      }
    }
    initializeNotificationSystem()
    return () => {
      disconnectSSE()
      unregisterFCMToken()
    }
  }, [
    user?.id,
    isOnline,
    connectSSE,
    disconnectSSE,
    initializeFCM,
    registerFCMToken,
    unregisterFCMToken,
    determineNotificationStrategy,
  ])

  return {
    notifications,
    unreadCount,
    isConnected: isConnected && isOnline,
    isPermissionGranted,
    modalNotification,
    toasts,
    fcmToken,
    isFcmInitialized,
    requestPermission,
    markAsRead,
    markAllAsRead,
    addNotification,
    showModalNotification,
    hideModalNotification,
    notifyOwnerPaymentResult,
    addToast,
    removeToast,
    handleToastClick,
    getNotificationCategory,
    getNotificationIcon,
    initializeFCM,
    registerFCMToken,
    unregisterFCMToken,
  }
}
