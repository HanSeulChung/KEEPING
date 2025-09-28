import apiClient from './axios'

export interface FCMTokenRequest {
  token: string
}

export interface FCMTokenResponse {
  success: boolean
  message: string
  status: number
  data: string
}

// 고객용 FCM 토큰 등록
export const registerCustomerFCMToken = async (
  customerId: number,
  token: string
): Promise<FCMTokenResponse> => {
  try {
    console.log('고객 FCM 토큰 등록 시작 - customerId:', customerId)

    const response = await apiClient.post<FCMTokenResponse>(
      `/api/fcm/customer/${customerId}/token`,
      { token }
    )

    console.log('고객 FCM 토큰 등록 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('고객 FCM 토큰 등록 실패:', error)
    throw error
  }
}

// 점주용 FCM 토큰 등록
export const registerOwnerFCMToken = async (
  ownerId: number,
  token: string
): Promise<FCMTokenResponse> => {
  try {
    console.log('점주 FCM 토큰 등록 시작 - ownerId:', ownerId)

    const response = await apiClient.post<FCMTokenResponse>(
      `/api/fcm/owner/${ownerId}/token`,
      { token }
    )

    console.log('점주 FCM 토큰 등록 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('점주 FCM 토큰 등록 실패:', error)
    throw error
  }
}

// 백엔드에서 FCM 토큰 발급 요청 (고객용)
export const generateCustomerFCMToken = async (
  customerId: number
): Promise<{ token: string }> => {
  try {
    console.log('고객 FCM 토큰 발급 요청 - customerId:', customerId)

    const response = await apiClient.post<{
      success: boolean
      data: { token: string }
    }>(`/api/fcm/customer/${customerId}/token`)

    console.log('고객 FCM 토큰 발급 성공:', response.data.data.token.substring(0, 20) + '...')
    return response.data.data
  } catch (error) {
    console.error('고객 FCM 토큰 발급 실패:', error)
    throw error
  }
}

// 백엔드에서 FCM 토큰 발급 요청 (점주용)
export const generateOwnerFCMToken = async (
  ownerId: number
): Promise<{ token: string }> => {
  try {
    console.log('점주 FCM 토큰 발급 요청 - ownerId:', ownerId)

    const response = await apiClient.post<{
      success: boolean
      data: { token: string }
    }>(`/api/fcm/owner/${ownerId}/token`)

    console.log('점주 FCM 토큰 발급 성공:', response.data.data.token.substring(0, 20) + '...')
    return response.data.data
  } catch (error) {
    console.error('점주 FCM 토큰 발급 실패:', error)
    throw error
  }
}

// FCM 토큰 삭제
export const deleteFCMToken = async (token: string): Promise<FCMTokenResponse> => {
  try {
    console.log('FCM 토큰 삭제 시작')

    const response = await apiClient.delete<FCMTokenResponse>('/api/fcm/token', {
      data: { token }
    })

    console.log('FCM 토큰 삭제 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('FCM 토큰 삭제 실패:', error)
    throw error
  }
}

// 호환성을 위한 기존 함수들
export const registerFCMToken = async (data: {
  userId: string
  token: string
  deviceInfo?: any
}): Promise<FCMTokenResponse> => {
  const userId = parseInt(data.userId)
  if (isNaN(userId)) {
    throw new Error('유효하지 않은 사용자 ID')
  }
  
  // 기본적으로 점주로 처리 (기존 동작 유지)
  return registerOwnerFCMToken(userId, data.token)
}

export const unregisterFCMToken = async (
  userId: string,
  token: string
): Promise<FCMTokenResponse> => {
  return deleteFCMToken(token)
}
