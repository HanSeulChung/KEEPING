import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface AuthState {
  isLoggedIn: boolean
  user: {
    id: string
    name: string
    email: string
  } | null
  login: (user: { id: string; name: string; email: string }) => void
  logout: () => void
  initializeAuth: () => void
  checkAuthStatus: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      login: (user) => set({ isLoggedIn: true, user }),
      logout: () => {
        // 로컬 스토리지 정리
        localStorage.removeItem('user')
        // Cookie는 서버에서 처리되므로 클라이언트에서는 제거할 수 없음
        set({ isLoggedIn: false, user: null })
      },
      initializeAuth: () => {
        // 페이지 로드 시 Cookie에서 토큰 확인하여 로그인 상태 초기화
        const possibleTokenNames = ['accessToken', 'access_token', 'token', 'authToken', 'jwt', 'refreshToken']
        let token = null
        
        for (const name of possibleTokenNames) {
          token = getCookie(name)
          if (token) break
        }
        
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            set({ isLoggedIn: true, user })
          } catch (error) {
            console.error('사용자 정보 파싱 오류:', error)
            localStorage.removeItem('user')
            set({ isLoggedIn: false, user: null })
          }
        } else {
          set({ isLoggedIn: false, user: null })
        }
      },
      checkAuthStatus: () => {
        // 현재 로그인 상태 확인 (Cookie 토큰 존재 여부 기준)
        const possibleTokenNames = ['accessToken', 'access_token', 'token', 'authToken', 'jwt', 'refreshToken']
        let token = null
        
        for (const name of possibleTokenNames) {
          token = getCookie(name)
          if (token) break
        }
        
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            const isLoggedIn = true
            set({ isLoggedIn, user })
            return true
          } catch (error) {
            console.error('사용자 정보 파싱 오류:', error)
            localStorage.removeItem('user')
            set({ isLoggedIn: false, user: null })
            return false
          }
        } else {
          set({ isLoggedIn: false, user: null })
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
