import { create } from 'zustand'

// Cookie 읽기 유틸리티 함수
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

// 메모리 기반 토큰 저장소
let memoryAccessToken: string | null = null

interface AuthState {
  isLoggedIn: boolean
  user: {
    id: string
    name: string
    email: string
  } | null
  isLoggingOut: boolean
  login: (user: { id: string; name: string; email: string }, accessToken?: string) => void
  logout: () => Promise<void>
  initializeAuth: () => void
  checkAuthStatus: () => boolean
  getAccessToken: () => string | null
  setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isLoggedIn: false,
  user: null,
  isLoggingOut: false,
  login: (user, accessToken) => {
    if (accessToken) {
      memoryAccessToken = accessToken
      // localStorage에도 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
    set({ isLoggedIn: true, user })
  },
  logout: async () => {
    set({ isLoggingOut: true })
    
    try {
      // authApi를 통해 로그아웃 처리
      const { authApi } = await import('@/api/authApi')
      const result = await authApi.logout()
      
      // 메모리 정리
      memoryAccessToken = null
      
      // localStorage 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        localStorage.removeItem('userInfo')
        // 다른 관련 데이터도 정리
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('auth_') || key.startsWith('user_')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      // 상태 초기화
      set({ isLoggedIn: false, user: null, isLoggingOut: false })
      
      // 카카오 로그아웃 URL이 있으면 리디렉트
      if (result.kakaoLogoutUrl) {
        window.location.href = result.kakaoLogoutUrl
      } else {
        // 없으면 홈페이지로
        window.location.href = '/'
      }
      
    } catch (error) {
      console.error('로그아웃 에러:', error)
      
      // 에러 발생해도 로컬 정리
      memoryAccessToken = null
      if (typeof window !== 'undefined') {
        localStorage.clear()
      }
      
      set({ isLoggedIn: false, user: null, isLoggingOut: false })
      window.location.href = '/'
    }
  },
  getAccessToken: () => {
    return memoryAccessToken
  },
  setAccessToken: (token: string) => {
    memoryAccessToken = token
  },
  initializeAuth: () => {
    // localStorage에서 accessToken 확인
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      const userStr = localStorage.getItem('user')
      
      if (accessToken) {
        memoryAccessToken = accessToken
        try {
          const user = userStr ? JSON.parse(userStr) : null
          set({ isLoggedIn: true, user })
          return
        } catch {
          // JSON 파싱 실패시 로그아웃 처리
          localStorage.clear()
          set({ isLoggedIn: false, user: null })
          return
        }
      }
    }
    
    // fallback으로 Cookie에서 토큰 확인하여 로그인 상태 초기화
    const possibleTokenNames = ['accessToken', 'access_token', 'token', 'authToken', 'jwt']
    let token = null

    for (const name of possibleTokenNames) {
      token = getCookie(name)
      if (token) break
    }

    if (token) {
      memoryAccessToken = token
      set({ isLoggedIn: true, user: null })
    } else {
      set({ isLoggedIn: false, user: null })
    }
  },
  checkAuthStatus: () => {
    // localStorage accessToken 우선 확인
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        memoryAccessToken = accessToken
        set({ isLoggedIn: true, user: get().user })
        return true
      }
    }

    // fallback으로 Cookie 확인 (기존 로직)
    const possibleTokenNames = ['accessToken', 'access_token', 'token', 'authToken', 'jwt']
    let token = null

    for (const name of possibleTokenNames) {
      token = getCookie(name)
      if (token) break
    }

    if (token) {
      memoryAccessToken = token
      set({ isLoggedIn: true, user: get().user })
      return true
    } else {
      memoryAccessToken = null
      set({ isLoggedIn: false, user: null })
      return false
    }
  },
}))
