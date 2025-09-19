import { endpoints as API_ENDPOINTS, buildURL } from '@/api/config'
import { AuthAPI } from '@/types/api'

// 인증 관련 API 함수들
export const authApi = {
  kakaoOwnerLogin: () => {
    window.location.href = buildURL(API_ENDPOINTS.auth.kakaoOwner)
  },

  kakaoCustomerLogin: () => {
    window.location.href = buildURL(API_ENDPOINTS.auth.kakaoCustomer)
  },

  googleOwnerLogin: () => {
    window.location.href = buildURL(API_ENDPOINTS.auth.googleOwner)
  },

  googleCustomerLogin: () => {
    window.location.href = buildURL(API_ENDPOINTS.auth.googleCustomer)
  },

  // 회원가입 완료
  completeOwnerSignup: async (
    data: AuthAPI.OwnerSignupRequest
  ): Promise<AuthAPI.SignupOwnerResponse> => {
    const url = buildURL(API_ENDPOINTS.auth.signupOwner)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  },

  completeCustomerSignup: async (
    data: AuthAPI.CustomerSignupRequest
  ): Promise<AuthAPI.SignupCustomerResponse> => {
    const url = buildURL(API_ENDPOINTS.auth.signupCustomer)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  },

  // 토큰 갱신
  refreshToken: async (): Promise<AuthAPI.TokenResponse> => {
    const url = buildURL(API_ENDPOINTS.auth.refresh)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // RefreshToken 쿠키 포함
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.data
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    const url = buildURL(API_ENDPOINTS.auth.logout)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 로컬 스토리지 정리
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },
}

// 편의 함수들
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken')
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token)
}

export const getUserInfo = (): any => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}
