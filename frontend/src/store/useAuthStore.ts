import { buildURL } from '@/api/config'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

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

// Cookie 삭제 유틸리티 함수
const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.p.ssafy.io;`
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=j13a509.p.ssafy.io;`
}

// 메모리 기반 토큰 저장소
let memoryAccessToken: string | null = null

type AuthUser = {
  // 공통 필드 (OWNER/CUSTOMER 혼용 지원)
  id?: number | string
  userId?: number
  ownerId?: number
  name?: string
  email?: string
  role?: 'OWNER' | 'CUSTOMER'
  [key: string]: any
}

interface AuthState {
  isLoggedIn: boolean
  user: AuthUser | null
  loading: boolean
  error: string | null

  login: (user: AuthUser, accessToken?: string) => void
  logout: () => void
  logoutAll: () => Promise<void>
  initializeAuth: () => void
  checkAuthStatus: () => boolean
  fetchCurrentUser: () => Promise<void>
  refreshAccessToken: () => Promise<void>

  getAccessToken: () => string | null
  setAccessToken: (token: string) => void
  clearAccessToken: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      loading: false,
      error: null,

      login: (user, accessToken) => {
        if (accessToken) {
          memoryAccessToken = accessToken
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('accessToken', accessToken)
            }
          } catch {}
        }
        set({ isLoggedIn: true, user })
      },
      logout: () => {
        memoryAccessToken = null
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')

            // 쿠키에서 refreshToken 완전 제거
            deleteCookie('refreshToken')
            deleteCookie('refresh_token')
            deleteCookie('REFRESH_TOKEN')
          }
        } catch {}
        set({ isLoggedIn: false, user: null, loading: false, error: null })
      },

      logoutAll: async () => {
        try {
          await fetch(buildURL('/auth/logout'), {
            method: 'GET',
            credentials: 'include',
          })
        } catch {}
        get().logout()
      },

      getAccessToken: () => {
        if (memoryAccessToken) return memoryAccessToken
        try {
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken')
            return token
          }
        } catch {}
        return null
      },
      setAccessToken: (token: string) => {
        memoryAccessToken = token
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token)
          }
        } catch {}
      },
      clearAccessToken: () => {
        memoryAccessToken = null
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
          }
        } catch {}
      },

      initializeAuth: () => {
        // 페이지 로드 시 Cookie/LocalStorage에서 토큰 확인하여 로그인 상태 초기화
        const possibleTokenNames = [
          'accessToken',
          'access_token',
          'token',
          'authToken',
          'jwt',
        ]
        let token: string | null = null

        for (const name of possibleTokenNames) {
          token = getCookie(name)
          if (token) break
        }

        if (!token) {
          try {
            if (typeof window !== 'undefined') {
              token = localStorage.getItem('accessToken')
            }
          } catch {}
        }

        if (token) {
          memoryAccessToken = token
          set({ isLoggedIn: true })
          // 토큰 최신화 후 사용자 정보 동기화 (비차단)
          get()
            .refreshAccessToken()
            .catch(() => {
              console.warn('Token refresh failed during initialization')
            })
          get()
            .fetchCurrentUser()
            .catch(() => {
              console.warn('User fetch failed during initialization')
            })
        } else {
          set({ isLoggedIn: false, user: null })
        }
      },
      checkAuthStatus: () => {
        // 현재 로그인 상태 확인 (Cookie/LocalStorage 토큰 존재 여부 기준)
        const possibleTokenNames = [
          'accessToken',
          'access_token',
          'token',
          'authToken',
          'jwt',
        ]
        let token: string | null = null

        for (const name of possibleTokenNames) {
          token = getCookie(name)
          if (token) break
        }
        if (!token) {
          try {
            if (typeof window !== 'undefined')
              token = localStorage.getItem('accessToken')
          } catch {}
        }

        if (token) {
          memoryAccessToken = token
          set({ isLoggedIn: true })
          return true
        } else {
          memoryAccessToken = null
          set({ isLoggedIn: false, user: null })
          return false
        }
      },

      fetchCurrentUser: async () => {
        set({ loading: true, error: null })
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }
          const token = get().getAccessToken()
          if (token) headers.Authorization = `Bearer ${token}`

          const res = await fetch(buildURL('/auth/me'), {
            method: 'GET',
            credentials: 'include',
            headers,
          })
          if (!res.ok) {
            if (res.status === 401) {
              // 토큰이 만료된 경우 로그아웃 처리하지 않고 그냥 에러만 기록
              console.warn('Token expired, but keeping login state')
              set({ loading: false, error: 'Token expired' })
              return
            }
            throw new Error(`HTTP ${res.status}`)
          }
          const json = await res.json()
          const data = json?.data ?? json
          set({
            user: data ?? null,
            isLoggedIn: true,
            loading: false,
            error: null,
          })
        } catch (err: any) {
          const message = err?.message || '사용자 정보 조회 실패'
          console.warn('fetchCurrentUser failed:', message)
          set({ loading: false, error: message })
        }
      },

      refreshAccessToken: async () => {
        try {
          const res = await fetch(buildURL('/auth/refresh'), {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          const newToken = json?.data?.accessToken
          if (newToken) {
            get().setAccessToken(newToken)
          }
        } catch {}
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          // SSR 안전 스토리지 (no-op)
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage
        }
        return localStorage
      }),
      partialize: state => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
    }
  )
)
