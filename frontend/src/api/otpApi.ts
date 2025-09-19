import { apiConfig } from './config'

export interface OtpRequest {
  phoneNumber: string
  purpose: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET'
}

export interface OtpRequestResponse {
  requestId: string
  expiresAt: string
  message: string
}

export interface OtpVerifyRequest {
  requestId: string
  phoneNumber: string
  otpCode: string
}

export interface OtpVerifyResponse {
  isValid: boolean
  token?: string
  message: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  statusCode: number
  data: T
}

// OTP 요청
export const requestOtp = async (otpData: OtpRequest): Promise<ApiResponse<OtpRequestResponse>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/otp/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otpData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('OTP 요청 실패:', error)
    throw error
  }
}

// OTP 검증
export const verifyOtp = async (verifyData: OtpVerifyRequest): Promise<ApiResponse<OtpVerifyResponse>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('OTP 검증 실패:', error)
    throw error
  }
}
