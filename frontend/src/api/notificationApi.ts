import { NotificationAPI } from '@/types/api'
import apiClient from './axios'

// 알림 관련 API 함수들
export const notificationApi = {
  // 고객용 API
  customer: {
    // 읽지 않은 알림 개수 조회
    getUnreadCount: async (customerId: number): Promise<number> => {
      try {
        console.log(
          '고객 읽지 않은 알림 개수 조회 시작 - customerId:',
          customerId
        )

        if (!customerId || isNaN(customerId) || customerId <= 0) {
          console.warn('유효하지 않은 customerId:', customerId)
          return 0
        }

        const response = await apiClient.get<{
          success: boolean
          message: string
          status: number
          data: number
        }>(`/notifications/customer/${customerId}/unread-count`)

        console.log('고객 읽지 않은 알림 개수 조회 성공:', response.data)
        return response.data.data || 0
      } catch (error: any) {
        console.error('고객 읽지 않은 알림 개수 조회 실패:', {
          customerId,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        })
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
        console.log(
          '고객 알림 목록 조회 시작 - customerId:',
          customerId,
          'page:',
          page,
          'size:',
          size
        )

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
        }>(`/notifications/customer/${customerId}?page=${page}&size=${size}`)

        console.log('고객 알림 목록 조회 성공:', response.data)
        return response.data.data?.content || []
      } catch (error: any) {
        console.error('고객 알림 목록 조회 실패:', {
          customerId,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        })
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
          `/notifications/customer/${customerId}/unread?page=${page}&size=${size}`
        )

        return response.data.data?.content || []
      } catch (error) {
        console.error('고객 읽지 않은 알림 조회 실패:', error)
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
          `/notifications/customer/${customerId}/${notificationId}/read`
        )
        return true
      } catch (error) {
        console.error('고객 알림 읽음 처리 실패:', error)
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
  },

  // 점주용 API
  owner: {
    // 읽지 않은 알림 개수 조회
    getUnreadCount: async (ownerId: number): Promise<number> => {
      try {
        console.log('점주 읽지 않은 알림 개수 조회 시작 - ownerId:', ownerId)

        if (!ownerId || isNaN(ownerId) || ownerId <= 0) {
          console.warn('유효하지 않은 ownerId:', ownerId)
          return 0
        }

        const response = await apiClient.get<{
          success: boolean
          message: string
          status: number
          data: number
        }>(`/notifications/owner/${ownerId}/unread-count`)

        console.log('점주 읽지 않은 알림 개수 조회 성공:', response.data)
        return response.data.data || 0
      } catch (error: any) {
        console.error('점주 읽지 않은 알림 개수 조회 실패:', {
          ownerId,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        })
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
        console.log(
          '점주 알림 목록 조회 시작 - ownerId:',
          ownerId,
          'page:',
          page,
          'size:',
          size
        )

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
        }>(`/notifications/owner/${ownerId}?page=${page}&size=${size}`)

        console.log('점주 알림 목록 조회 성공:', response.data)
        return response.data.data?.content || []
      } catch (error: any) {
        console.error('점주 알림 목록 조회 실패:', {
          ownerId,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        })

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
        }>(`/notifications/owner/${ownerId}/unread?page=${page}&size=${size}`)

        return response.data.data?.content || []
      } catch (error) {
        console.error('점주 읽지 않은 알림 조회 실패:', error)
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
          `/notifications/owner/${ownerId}/${notificationId}/read`
        )
        return true
      } catch (error) {
        console.error('점주 알림 읽음 처리 실패:', error)
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
