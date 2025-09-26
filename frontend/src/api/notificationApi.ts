import { NotificationAPI } from '@/types/api'
import apiClient from './axios'

// 알림 관련 API 함수들
export const notificationApi = {
  // 고객용 API
  customer: {
    // 읽지 않은 알림 개수 조회
    getUnreadCount: async (customerId: number): Promise<number> => {
      try {
        console.log('고객 읽지 않은 알림 개수 조회 시작 - customerId:', customerId)

        if (!customerId || isNaN(customerId) || customerId <= 0) {
          console.warn('유효하지 않은 customerId:', customerId)
          return 0
        }

        const response = await apiClient.get<{ success: boolean; message: string; status: number; data: number }>(
          `/notifications/customer/${customerId}/unread-count`
        )

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
        console.log('고객 알림 목록 조회 시작 - customerId:', customerId, 'page:', page, 'size:', size)

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
          `/notifications/customer/${customerId}?page=${page}&size=${size}`
        )

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

        const response = await apiClient.get<{ success: boolean; message: string; status: number; data: number }>(
          `/notifications/owner/${ownerId}/unread-count`
        )

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
        console.log('점주 알림 목록 조회 시작 - ownerId:', ownerId, 'page:', page, 'size:', size)

        if (!ownerId || isNaN(ownerId) || ownerId <= 0) {
          console.warn('유효하지 않은 ownerId:', ownerId)
          return []
        }

        // 개발 환경에서는 더미 데이터 반환
        if (process.env.NODE_ENV === 'development') {
          console.log('개발 환경: 더미 알림 데이터 반환')
          return [
            {
              id: 1,
              type: 'PAYMENT',
              title: '새로운 결제가 완료되었습니다',
              message: '김철수님이 15,000원을 결제했습니다',
              createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
              isRead: false,
              data: { 
                storeId: ownerId,
                storeName: '정동수 부동산',
                amount: 15000,
                paymentId: 'PAY_20241225_001',
                customerName: '김철수'
              }
            },
            {
              id: 2,
              type: 'CHARGE',
              title: '충전이 완료되었습니다',
              message: '50,000원이 충전되었습니다',
              createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
              isRead: false,
              data: { 
                storeId: ownerId,
                storeName: '정동수 부동산',
                amount: 50000,
                chargeId: 'CHG_20241225_001',
                customerName: '이영희'
              }
            },
            {
              id: 3,
              type: 'STORE_PROMOTION',
              title: '매장 프로모션이 시작되었습니다',
              message: '신년 특가 20% 할인 이벤트가 시작되었습니다',
              createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1시간 전
              isRead: true,
              data: { 
                storeId: ownerId,
                storeName: '정동수 부동산',
                promotionId: 'PROMO_20241225_001',
                discountRate: 20,
                promotionName: '신년 특가 이벤트'
              }
            },
            {
              id: 4,
              type: 'PREPAYMENT_PURCHASE',
              title: '선결제 구매가 완료되었습니다',
              message: '박민수님이 10만원 선결제 상품을 구매했습니다',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
              isRead: true,
              data: { 
                storeId: ownerId,
                storeName: '정동수 부동산',
                amount: 100000,
                prepaymentId: 'PRE_20241225_001',
                customerName: '박민수'
              }
            },
            {
              id: 5,
              type: 'SYSTEM',
              title: '시스템 업데이트 완료',
              message: '알림 시스템이 업데이트되었습니다',
              createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3시간 전
              isRead: true,
              data: { 
                storeId: ownerId,
                updateVersion: '1.2.3',
                updateType: 'notification_system'
              }
            }
          ] as NotificationAPI.NotificationResponseDto[]
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
          `/notifications/owner/${ownerId}?page=${page}&size=${size}`
        )

        console.log('점주 알림 목록 조회 성공:', response.data)
        return response.data.data?.content || []
      } catch (error: any) {
        console.error('점주 알림 목록 조회 실패:', {
          ownerId,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        })
        
        // 에러 발생 시에도 개발 환경에서는 더미 데이터 반환
        if (process.env.NODE_ENV === 'development') {
          console.log('API 오류로 인해 더미 데이터 반환')
          return [
            {
              id: 1,
              type: 'system',
              title: 'API 연결 오류',
              message: '개발 환경에서 더미 데이터를 표시하고 있습니다',
              createdAt: new Date().toISOString(),
              isRead: false,
              data: { storeId: ownerId }
            }
          ] as NotificationAPI.NotificationResponseDto[]
        }
        
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
          `/notifications/owner/${ownerId}/unread?page=${page}&size=${size}`
        )

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
