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
  login: (user: { id: string; name: string; email: string }, accessToken?: string) => void
  logout: () => void
  initializeAuth: () => void
  checkAuthStatus: () => boolean
  getAccessToken: () => string | null
  setAccessToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isLoggedIn: false,
  user: null,
  login: (user, accessToken) => {
    if (accessToken) {
      memoryAccessToken = accessToken
    }
    set({ isLoggedIn: true, user })
  },
  logout: () => {
    memoryAccessToken = null
    set({ isLoggedIn: false, user: null })
  },
  getAccessToken: () => {
    return memoryAccessToken
  },
  setAccessToken: (token: string) => {
    memoryAccessToken = token
  },
  initializeAuth: () => {
    // 페이지 로드 시 Cookie에서 토큰 확인하여 로그인 상태 초기화
    const possibleTokenNames = ['accessToken', 'access_token', 'token', 'authToken', 'jwt']
    let token = null

    for (const name of possibleTokenNames) {
      token = getCookie(name)
      if (token) break
    }

    if (token) {
      memoryAccessToken = token
      // refreshToken으로 사용자 정보 복원 시도
      set({ isLoggedIn: true, user: null })
    } else {
      set({ isLoggedIn: false, user: null })
    }
  },
  checkAuthStatus: () => {
    // 현재 로그인 상태 확인 (Cookie 토큰 존재 여부 기준)
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
