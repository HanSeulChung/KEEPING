import { apiConfig } from './config'

export interface FCMTokenRequest {
  userId: string
  token: string
  deviceInfo?: {
    userAgent: string
    platform: string
  }
}

export interface FCMTokenResponse {
  success: boolean
  message: string
}

// FCM 토큰을 서버에 등록
export const registerFCMToken = async (data: FCMTokenRequest): Promise<FCMTokenResponse> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/fcm/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('FCM 토큰 등록 실패:', error)
    throw error
  }
}

// FCM 토큰을 서버에서 삭제 (로그아웃 시)
export const unregisterFCMToken = async (userId: string, token: string): Promise<FCMTokenResponse> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/fcm/unregister`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, token })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('FCM 토큰 삭제 실패:', error)
    throw error
  }
}
