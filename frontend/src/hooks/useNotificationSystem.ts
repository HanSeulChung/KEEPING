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
  const isVisibleRef = useRef(true)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

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

  // SSE 연결
  const connectSSE = useCallback(async () => {
    if (!user?.id || sseAbortControllerRef.current || !isOnline) return

    const userId = user.ownerId || user.userId || user.id
    if (!userId) return

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
        }
      }
    } catch {
      return
    }

    const rawBase = apiConfig.baseURL.replace(/\/$/, '')
    const userRole = user.role || 'OWNER'
    const ssePath =
      userRole === 'CUSTOMER'
        ? `/api/notifications/subscribe/customer/${userId}`
        : `/api/notifications/subscribe/owner/${userId}`

    const sseUrl = `${rawBase}${ssePath}`

    let accessToken: string | null =
      useAuthStore.getState().getAccessToken() ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null)

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
          reconnectAttemptsRef.current = 0
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        } else {
          throw new Error('SSE open failed')
        }
      },
      onmessage: event => {
        try {
          if (!isConnected) setIsConnected(true)
          if (typeof event.data === 'string' && !event.data.startsWith('{'))
            return
          const data = JSON.parse(event.data)
          if (data.type === 'connection') return
          const notification: NotificationData = convertNotificationData(data)
          setNotifications(prev => [notification, ...prev])
          if (
            isVisibleRef.current &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            showBrowserNotification(notification)
          }
        } catch (error) {
          console.error('알림 데이터 파싱 오류:', error)
        }
      },
      onerror: error => {
        setIsConnected(false)
      },
    }).catch(() => {
      if (controller.signal.aborted) return
      setIsConnected(false)
    })
  }, [user?.id, isOnline])

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

  const showBrowserNotification = (notification: NotificationData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: String(notification.id),
        requireInteraction: true,
      })
      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
        markAsRead(notification.id)
      }
      setTimeout(() => {
        browserNotification.close()
      }, 5000)
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
      if (!token) return false
      setFcmToken(token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('fcmToken', token)
      }
      const isOwner = (user.role || 'OWNER') === 'OWNER'
      const ownerId = user.ownerId || user.id
      const customerId = user.userId || user.id
      if (isOwner && ownerId) {
        await registerOwnerFCMToken(Number(ownerId), token)
      } else if (!isOwner && customerId) {
        await registerCustomerFCMToken(Number(customerId), token)
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

  const markAsRead = useCallback(
    async (id: number) => {
      if (!user?.id) return
      const userId = user.ownerId || user.userId || user.id
      const userRole = user.role || 'OWNER'
      const isOwner = userRole === 'OWNER'
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
    [user?.id, user?.ownerId, user?.userId, user?.role]
  )

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return
    const userId = user.ownerId || user.userId || user.id
    const userRole = user.role || 'OWNER'
    const isOwner = userRole === 'OWNER'
    const unreadNotifications = notifications.filter(n => !n.isRead)
    if (unreadNotifications.length === 0) return
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
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
  }, [user?.id, user?.ownerId, user?.userId, user?.role, notifications])

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
          icon: '/icons/qr.png',
          badge: '/icons/qr.png',
          tag: String(newNotification.id),
        })
      }
    },
    []
  )

  const fetchNotifications = async () => {
    if (!user) return
    let userId: number | null = null
    if (user.ownerId) userId = Number(user.ownerId)
    else if (user.userId) userId = Number(user.userId)
    else if (user.id) userId = Number(user.id)
    if (!userId || isNaN(userId) || userId <= 0) return
    const userRole = user.role || 'OWNER'
    const isOwner = userRole === 'OWNER'
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
        fetchNotifications()
        connectSSE().catch(console.error)
        registerFCM()
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
