import { endpoints as API_ENDPOINTS, buildURL } from '@/api/config'
import { AuthAPI } from '@/types/api'

import apiClient from './axios'

// 인증 관련 API 함수들
export const authApi = {
  kakaoOwnerLogin: () => {
    window.location.href = buildURL(API_ENDPOINTS.auth.kakaoOwner)
  },

  kakaoCustomerLogin: () => {
    window.location.href = buildURL(API_ENDPOINTS.auth.kakaoCustomer)
  },

  // googleOwnerLogin: () => {
  //   window.location.href = buildURL(API_ENDPOINTS.auth.googleOwner)
  // },

  // googleCustomerLogin: () => {
  //   window.location.href = buildURL(API_ENDPOINTS.auth.googleCustomer)
  // },

  // 회원가입 완료
  completeOwnerSignup: async (
    data: AuthAPI.OwnerSignupRequest
  ): Promise<AuthAPI.SignupOwnerResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.signupOwner, data, {
      withCredentials: true,
    })
    return response.data.data
  },

  completeCustomerSignup: async (
    data: AuthAPI.CustomerSignupRequest
  ): Promise<AuthAPI.SignupCustomerResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.signupCustomer, data, {
      withCredentials: true,
    })
    return response.data.data
  },

  // 세션 정보 조회
  getSessionInfo: async (): Promise<AuthAPI.SessionInfoResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.auth.sessionInfo, {
      withCredentials: true,
    })
    return response.data
  },

  // 토큰 갱신
  refreshToken: async (): Promise<AuthAPI.TokenResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.auth.refresh, {}, {
      withCredentials: true, // RefreshToken 쿠키 포함
    })
    return response.data.data
  },

  // 로그아웃 - 카카오 로그아웃 URL 받기
  logout: async (): Promise<AuthAPI.LogoutResponse> => {
    // Next.js API route를 통해 백엔드 호출
    const response = await fetch('/api/auth/logout', {
      method: 'GET',
      credentials: 'include',
    })
    
    const result = await response.json()
    
    // localStorage 정리
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userInfo')
    }
    
    return {
      kakaoLogoutUrl: result.data?.kakaoLogoutUrl
    }
  },
}

// 편의 함수들 - useAuthStore 사용 권장
export const isAuthenticated = (): boolean => {
  // 쿠키에서 토큰 확인
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  const possibleTokenNames = ['accessToken', 'access_token', 'token', 'authToken', 'jwt']
  for (const name of possibleTokenNames) {
    const token = getCookie(name)
    if (token) return true
  }
  return false
}
