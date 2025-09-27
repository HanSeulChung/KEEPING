import { apiConfig, buildURL, endpoints } from './config'

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
    // 백엔드 직접 호출 (환경변수 기반 baseURL)
    const response = await fetch(buildURL(endpoints.auth.otpRequest), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(otpData),
    })

    const rawText = await response.text()
    let result: any = {}
    try {
      result = rawText ? JSON.parse(rawText) : {}
    } catch {}

    if (!response.ok || result?.success === false) {
      const message =
        result?.message || result?.backend?.raw || `HTTP ${response.status}`
      throw new Error(message)
    }

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
    // 백엔드 직접 호출 (환경변수 기반 baseURL)
    const response = await fetch(buildURL(endpoints.auth.otpVerify), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(verifyData),
    })

    const rawText = await response.text()
    let result: any = {}
    try {
      result = rawText ? JSON.parse(rawText) : {}
    } catch {}

    if (!response.ok || result?.success === false) {
      const message =
        result?.message || result?.backend?.raw || `HTTP ${response.status}`
      console.error('OTP 검증 실패:', response.status, message)
      throw new Error(message)
    }

    console.log('OTP 검증 응답:', result)
    return result
  } catch (error) {
    console.error('OTP 검증 실패:', error)
    throw error
  }
}
