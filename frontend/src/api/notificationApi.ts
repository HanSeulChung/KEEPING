import { NotificationAPI } from '@/types/api'
import { generateIdempotencyKey } from '@/utils/idempotency'
import apiClient from './axios'

// 알림 관련 API 함수들
export const notificationApi = {
  // 고객용 API
  customer: {
    // 읽지 않은 알림 개수 조회
    getUnreadCount: async (customerId: number): Promise<number> => {
      try {
        if (!customerId || isNaN(customerId) || customerId <= 0) {
          console.warn('유효하지 않은 customerId:', customerId)
          return 0
        }

        const response = await apiClient.get<{
          success: boolean
          message: string
          status: number
          data: number
        }>(`/api/notifications/customer/${customerId}/unread-count`)

        return response.data.data || 0
      } catch (error: any) {
        return 0
      }
    },

    // 알림 목록 조회 (페이징)
    getNotificationList: async (
      customerId: number,
      page: number = 0,
      size: number = 20
    ): Promise<NotificationAPI.NotificationResponseDto[]> => {
      try {
        if (!customerId || isNaN(customerId) || customerId <= 0) {
          console.warn('유효하지 않은 customerId:', customerId)
          return []
        }

        const response = await apiClient.get<{
          success: boolean
          message: string
          status: number
          data: {
            content: NotificationAPI.NotificationResponseDto[]
            totalElements: number
            totalPages: number
            number: number
            size: number
          }
        }>(
          `/api/notifications/customer/${customerId}?page=${page}&size=${size}`
        )

        return response.data.data?.content || []
      } catch (error: any) {
        return []
      }
    },

    // 읽지 않은 알림 목록 조회
    getUnreadNotifications: async (
      customerId: number,
      page: number = 0,
      size: number = 20
    ): Promise<NotificationAPI.NotificationResponseDto[]> => {
      try {
        const response = await apiClient.get<{
          success: boolean
          message: string
          status: number
          data: {
            content: NotificationAPI.NotificationResponseDto[]
            totalElements: number
            totalPages: number
            number: number
            size: number
          }
        }>(
          `/api/notifications/customer/${customerId}/unread?page=${page}&size=${size}`
        )

        return response.data.data?.content || []
      } catch (error) {
        return []
      }
    },

    // 알림 읽음 처리
    markAsRead: async (
      customerId: number,
      notificationId: number
    ): Promise<boolean> => {
      try {
        await apiClient.put(
          `/api/notifications/customer/${customerId}/${notificationId}/read`
        )
        return true
      } catch (error) {
        return false
      }
    },

    // SSE 구독
    subscribeNotifications: (customerId: number): EventSource => {
      const eventSource = new EventSource(
        `/api/notifications/subscribe/customer/${customerId}`
      )
      return eventSource
    },

    // 결제 요청 승인
    approvePayment: async (
      intentId: number | string,
      pin: string
    ): Promise<boolean> => {
      try {
        const headers = {
          'Idempotency-Key': generateIdempotencyKey({
            action: 'payment_approve',
          }),
        } as any
        const res = await apiClient.post(
          `/payments/${intentId}/approve`,
          { pin },
          { headers }
        )
        return res.status >= 200 && res.status < 300
      } catch (error) {
        return false
      }
    },
  },

  // 점주용 API
  owner: {
    // 읽지 않은 알림 개수 조회
    getUnreadCount: async (ownerId: number): Promise<number> => {
      try {
        if (!ownerId || isNaN(ownerId) || ownerId <= 0) {
          console.warn('유효하지 않은 ownerId:', ownerId)
          return 0
        }

        const response = await apiClient.get<{
          success: boolean
          message: string
          status: number
          data: number
        }>(`/api/notifications/owner/${ownerId}/unread-count`)

        return response.data.data || 0
      } catch (error: any) {
        return 0
      }
    },

    // 알림 목록 조회 (페이징)
    getNotificationList: async (
      ownerId: number,
      page: number = 0,
      size: number = 20
    ): Promise<NotificationAPI.NotificationResponseDto[]> => {
      try {
        if (!ownerId || isNaN(ownerId) || ownerId <= 0) {
          console.warn('유효하지 않은 ownerId:', ownerId)
          return []
        }

        // 개발 환경 더미 데이터 사용 제거 (항상 서버 응답 사용)

        const response = await apiClient.get<{
          success: boolean
          message: string
          status: number
          data: {
            content: NotificationAPI.NotificationResponseDto[]
            totalElements: number
            totalPages: number
            number: number
            size: number
          }
        }>(`/api/notifications/owner/${ownerId}?page=${page}&size=${size}`)

        return response.data.data?.content || []
      } catch (error: any) {
        // 에러 발생 시 더미 데이터 사용하지 않음
        return []
      }
    },

    // 읽지 않은 알림 목록 조회
    getUnreadNotifications: async (
      ownerId: number,
      page: number = 0,
      size: number = 20
    ): Promise<NotificationAPI.NotificationResponseDto[]> => {
      try {
        const response = await apiClient.get<{
          success: boolean
          message: string
          status: number
          data: {
            content: NotificationAPI.NotificationResponseDto[]
            totalElements: number
            totalPages: number
            number: number
            size: number
          }
        }>(
          `/api/notifications/owner/${ownerId}/unread?page=${page}&size=${size}`
        )

        return response.data.data?.content || []
      } catch (error) {
        return []
      }
    },

    // 알림 읽음 처리
    markAsRead: async (
      ownerId: number,
      notificationId: number
    ): Promise<boolean> => {
      try {
        await apiClient.put(
          `/api/notifications/owner/${ownerId}/${notificationId}/read`
        )
        return true
      } catch (error) {
        return false
      }
    },

    // SSE 구독
    subscribeNotifications: (ownerId: number): EventSource => {
      const eventSource = new EventSource(
        `/api/notifications/subscribe/owner/${ownerId}`
      )
      return eventSource
    },
  },

  // 호환성을 위한 기존 API (점주용으로 리다이렉트)
  getUnreadCount: async (ownerId: number): Promise<number> => {
    return notificationApi.owner.getUnreadCount(ownerId)
  },

  getNotificationList: async (
    ownerId: number
  ): Promise<NotificationAPI.NotificationResponseDto[]> => {
    return notificationApi.owner.getNotificationList(ownerId)
  },

  getUnreadNotifications: async (
    ownerId: number
  ): Promise<NotificationAPI.NotificationResponseDto[]> => {
    return notificationApi.owner.getUnreadNotifications(ownerId)
  },

  markAsRead: async (
    ownerId: number,
    notificationId: number
  ): Promise<boolean> => {
    return notificationApi.owner.markAsRead(ownerId, notificationId)
  },

  subscribeNotifications: (ownerId: number): EventSource => {
    return notificationApi.owner.subscribeNotifications(ownerId)
  },
}

// 편의 함수들
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}
