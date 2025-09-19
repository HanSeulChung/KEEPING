import { apiConfig } from './config'

export interface OtpRequest {
  regSessionId: string
  userRole: string
  name: string
  phoneNumber: string
  birth: string // YYYY-MM-DD 형식으로 전송
  genderDigit: string
}

export interface OtpRequestResponse {
  regSessionId: string
  otpNumber: string
}

export interface OtpVerifyRequest {
  regSessionId: string
  code: string
}

export interface OtpVerifyResponse {
  verified: boolean
  token?: string
  message?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  statusCode: number
  data: T
}

// OTP 요청
export const requestOtp = async (
  otpData: OtpRequest
): Promise<ApiResponse<OtpRequestResponse>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/otp/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otpData),
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
export const verifyOtp = async (
  verifyData: OtpVerifyRequest
): Promise<ApiResponse<OtpVerifyResponse>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(verifyData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OTP 검증 실패:', response.status, errorText)
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      )
    }

    const result = await response.json()
    console.log('OTP 검증 응답:', result)
    return result
  } catch (error) {
    console.error('OTP 검증 실패:', error)
    throw error
  }
}
