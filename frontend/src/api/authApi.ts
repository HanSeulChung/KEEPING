import { apiConfig } from './config'
import { AuthAPI } from '@/types/api'

// 인증 관련 API 함수들
export const authApi = {
  // 소셜 로그인 리다이렉트
  kakaoOwnerLogin: () => {
    window.location.href = `${apiConfig.baseURL}/auth/kakao/owner`
  },
  
  kakaoCustomerLogin: () => {
    window.location.href = `${apiConfig.baseURL}/auth/kakao/customer`
  },
  
  googleOwnerLogin: () => {
    window.location.href = `${apiConfig.baseURL}/auth/google/owner`
  },
  
  googleCustomerLogin: () => {
    window.location.href = `${apiConfig.baseURL}/auth/google/customer`
  },
  
  // 회원가입 완료
  completeOwnerSignup: async (data: AuthAPI.OwnerSignupRequest): Promise<AuthAPI.SignupOwnerResponse> => {
    const response = await fetch(`${apiConfig.baseURL}/auth/signup/owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  },
  
  completeCustomerSignup: async (data: AuthAPI.CustomerSignupRequest): Promise<AuthAPI.SignupCustomerResponse> => {
    const response = await fetch(`${apiConfig.baseURL}/auth/signup/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  },
  
  // 토큰 갱신
  refreshToken: async (): Promise<AuthAPI.TokenResponse> => {
    const response = await fetch(`${apiConfig.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // RefreshToken 쿠키 포함
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  },
  
  // 로그아웃
  logout: async (): Promise<void> => {
    const response = await fetch(`${apiConfig.baseURL}/auth/logout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // 로컬 스토리지 정리
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
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
