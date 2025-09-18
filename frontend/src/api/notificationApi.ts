import { NotificationAPI, ApiResponse } from '@/types/api'
import apiClient from './axios'

// 알림 관련 API 함수들
export const notificationApi = {
  // 읽지 않은 알림 개수 조회
  getUnreadCount: async (ownerId: number): Promise<number> => {
    try {
      const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
        `/notifications/owner/${ownerId}/unread-count`
      )
      
      return response.data.data.unreadCount
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error)
      return 0 // 에러 시 0 반환
    }
  },

  // 알림 목록 조회 (페이징)
  getNotificationList: async (
    ownerId: number, 
    page: number = 0, 
    size: number = 20
  ): Promise<NotificationAPI.NotificationResponseDto[]> => {
    try {
      const response = await apiClient.get<NotificationAPI.OwnerNotificationListResponse>(
        `/notifications/owner/${ownerId}?page=${page}&size=${size}`
      )
      
      return response.data.data.content
    } catch (error) {
      console.error('알림 목록 조회 실패:', error)
      return []
    }
  },

  // 알림 읽음 처리
  markAsRead: async (ownerId: number, notificationId: number): Promise<boolean> => {
    try {
      await apiClient.post(`/notifications/owner/${ownerId}/mark-read/${notificationId}`)
      return true
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
      return false
    }
  },

  // 알림 설정 조회
  getSettings: async (ownerId: number): Promise<NotificationAPI.UserNotificationSettings | null> => {
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
      await apiClient.put(`/notifications/owner/${ownerId}/settings`, { settings })
      return true
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error)
      return false
    }
  }
}

// 편의 함수들
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}