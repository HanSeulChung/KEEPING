import { NotificationAPI } from '@/types/api'
import apiClient from './axios'

// 알림 관련 API 함수들
export const notificationApi = {
  // 읽지 않은 알림 개수 조회
  getUnreadCount: async (ownerId: number): Promise<number> => {
    try {
      console.log('읽지 않은 알림 개수 조회 시작 - ownerId:', ownerId)

      if (!ownerId || isNaN(ownerId) || ownerId <= 0) {
        console.warn('유효하지 않은 ownerId:', ownerId)
        return 0
      }

      // 임시로 API 호출 비활성화 - 백엔드 수정 필요
      console.warn('알림 개수 API 임시 비활성화 - 백엔드 수정 필요')
      return 0

      // const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      //   `/notifications/owner/${ownerId}/unread-count`
      // )

      // console.log('읽지 않은 알림 개수 조회 성공:', response.data)
      // return response.data.data?.unreadCount || 0
    } catch (error: any) {
      console.error('읽지 않은 알림 개수 조회 실패:', {
        ownerId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      return 0 // 에러 시 0 반환
    }
  },

  // 알림 목록 조회
  getNotificationList: async (
    ownerId: number
  ): Promise<NotificationAPI.NotificationResponseDto[]> => {
    try {
      console.log('알림 목록 조회 시작 - ownerId:', ownerId)

      if (!ownerId || isNaN(ownerId) || ownerId <= 0) {
        console.warn('유효하지 않은 ownerId:', ownerId)
        return []
      }

      // 임시로 API 호출 비활성화 - 백엔드 수정 필요
      console.warn('알림 API 임시 비활성화 - 백엔드 수정 필요')
      return []

      // const response = await apiClient.get<NotificationAPI.OwnerNotificationListResponse>(
      //   `/notifications/owner/${ownerId}`
      // )

      // console.log('알림 목록 조회 성공:', response.data)
      // return response.data.data?.content || response.data.data || []
    } catch (error: any) {
      console.error('알림 목록 조회 실패:', {
        ownerId,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      return []
    }
  },

  // 읽지 않은 알림 조회
  getUnreadNotifications: async (
    ownerId: number
  ): Promise<NotificationAPI.NotificationResponseDto[]> => {
    try {
      const response =
        await apiClient.get<NotificationAPI.OwnerNotificationListResponse>(
          `/notifications/owner/${ownerId}/unread`
        )

      return response.data.data.content || response.data.data || []
    } catch (error) {
      console.error('읽지 않은 알림 조회 실패:', error)
      return []
    }
  },

  // 알림 구독 (SSE)
  subscribeNotifications: (ownerId: number): EventSource => {
    const eventSource = new EventSource(
      `/notifications/subscribe/owner/${ownerId}`
    )
    return eventSource
  },

  // 알림 설정 조회
  getSettings: async (
    ownerId: number
  ): Promise<NotificationAPI.UserNotificationSettings | null> => {
    try {
      const response = await apiClient.get<NotificationAPI.GetSettingsResponse>(
        `/notifications/owner/${ownerId}/settings`
      )

      return response.data.data
    } catch (error) {
      console.error('알림 설정 조회 실패:', error)
      return null
    }
  },

  // 알림 설정 업데이트
  updateSettings: async (
    ownerId: number,
    settings: NotificationAPI.UpdateSettingsRequest['settings']
  ): Promise<boolean> => {
    try {
      await apiClient.put(`/notifications/owner/${ownerId}/settings`, {
        settings,
      })
      return true
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error)
      return false
    }
  },

  // 알림 읽음 처리
  markAsRead: async (
    ownerId: number,
    notificationId: number
  ): Promise<boolean> => {
    try {
      await apiClient.patch(
        `/notifications/owner/${ownerId}/${notificationId}/read`
      )
      return true
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      return false
    }
  },
}

// 편의 함수들
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}
