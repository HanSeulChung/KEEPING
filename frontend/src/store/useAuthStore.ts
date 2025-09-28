import { buildURL } from '@/api/config'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// ------------------------------------------------------------
// In-memory access token to avoid frequent localStorage reads
// ------------------------------------------------------------
let memoryAccessToken: string | null = null

// ------------------------------------------------------------
// Cookie helpers
// ------------------------------------------------------------
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.p.ssafy.io;`
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=j13a509.p.ssafy.io;`
}

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

// 토큰 만료 시간 체크 함수 (7일 토큰용)
const isTokenExpired = (token: string): boolean => {
  try {
    // JWT 토큰 디코딩 (payload 부분만)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp
    if (!exp) return false // exp가 없으면 만료되지 않은 것으로 간주

    // 현재 시간과 비교 (1시간 여유를 둠 - 7일 토큰이므로)
    const now = Math.floor(Date.now() / 1000)
    return exp < now + 3600 // 1시간 전에 만료 예정이면 true
  } catch {
    return false // 파싱 실패 시 만료되지 않은 것으로 간주
  }
}
export type AuthUser = {
  id?: number | string
  userId?: number
  ownerId?: number
  name?: string
  email?: string
  role?: 'OWNER' | 'CUSTOMER'
  [key: string]: any
}

interface AuthState {
  // state
  isLoggedIn: boolean
  user: AuthUser | null
  isLoggingOut: boolean
  loading: boolean
  error: string | null

  // actions
  login: (user: AuthUser, accessToken?: string) => void
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  initializeAuth: () => void
  checkAuthStatus: () => boolean
  fetchCurrentUser: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  clearAuth: () => void

  // token helpers
  getAccessToken: () => string | null
  setAccessToken: (token: string) => void
  clearAccessToken: () => void
}

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      isLoggingOut: false,
      loading: false,
      error: null,

      // --------------------------------------------------------
      // Token helpers
      // --------------------------------------------------------
      getAccessToken: () => {
        if (memoryAccessToken) {
          // 토큰 만료 시간 체크
          if (isTokenExpired(memoryAccessToken)) {
            memoryAccessToken = null
            return null
          }
          return memoryAccessToken
        }
        try {
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken')
            if (token) {
              if (isTokenExpired(token)) {
                localStorage.removeItem('accessToken')
                return null
              }
              memoryAccessToken = token
              return token
            }
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

      clearAuth: () => {
        memoryAccessToken = null
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')
            localStorage.removeItem('userInfo')
            deleteCookie('refreshToken')
            deleteCookie('refresh_token')
            deleteCookie('REFRESH_TOKEN')
          }
        } catch {}
        set({ isLoggedIn: false, user: null })
      },

      // --------------------------------------------------------
      // Auth flows
      // --------------------------------------------------------
      login: (user: AuthUser, accessToken?: string) => {
        if (accessToken) {
          get().setAccessToken(accessToken)
        }
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user))
          }
        } catch {}
        set({ isLoggedIn: true, user })
      },

      logout: async () => {
        set({ isLoggingOut: true })
        try {
          const { authApi } = await import('@/api/authApi')
          const result = await authApi.logout()

          get().clearAuth()
          set({ isLoggingOut: false })

          if (result?.kakaoLogoutUrl) {
            window.location.href = result.kakaoLogoutUrl
          } else {
            window.location.href = '/'
          }
        } catch (error) {
          console.error('로그아웃 에러:', error)
          get().clearAuth()
          set({ isLoggingOut: false })
          window.location.href = '/'
        }
      },

      logoutAll: async () => {
        try {
          await fetch(buildURL('/auth/logout'), {
            method: 'GET',
            credentials: 'include',
          })
        } catch {}
        await get().logout()
      },

      initializeAuth: () => {
        try {
          // Restore user
          let savedUser: AuthUser | null = null
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('user')
            if (saved) {
              try {
                savedUser = JSON.parse(saved)
              } catch {
                localStorage.removeItem('user')
              }
            }
          }

          // Find token from cookies first
          const candidates = [
            'accessToken',
            'access_token',
            'token',
            'authToken',
            'jwt',
          ]
          let token: string | null = null
          for (const name of candidates) {
            token = getCookie(name)
            if (token && !isTokenExpired(token)) break
            token = null // 만료된 토큰은 무시
          }
          if (!token && typeof window !== 'undefined') {
            try {
              const localToken = localStorage.getItem('accessToken')
              if (localToken && !isTokenExpired(localToken)) {
                token = localToken
              }
            } catch {}
          }

          if (token) {
            memoryAccessToken = token
            set({ isLoggedIn: true, user: savedUser })
            // non-blocking validation and user sync
            get()
              .refreshAccessToken()
              .then(() => get().fetchCurrentUser())
              .catch(() => {
                console.warn('Token validation failed during initialization')
                // 개발 환경이 아닐 때만 로그아웃
                if (process.env.NODE_ENV !== 'development') {
                  get().logout()
                }
              })
          } else {
            set({ isLoggedIn: false, user: null })
          }
        } catch (error) {
          console.error('Auth initialization failed:', error)
          set({ isLoggedIn: false, user: null })
        }
      },

      checkAuthStatus: () => {
        const candidates = [
          'accessToken',
          'access_token',
          'token',
          'authToken',
          'jwt',
        ]
        let token: string | null = null
        for (const name of candidates) {
          token = getCookie(name)
          if (token) break
        }
        if (!token && typeof window !== 'undefined') {
          try {
            token = localStorage.getItem('accessToken')
          } catch {}
        }
        if (token) {
          set({ isLoggedIn: true })
          return true
        }
        set({ isLoggedIn: false, user: null })
        return false
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
          if (newToken) get().setAccessToken(newToken)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.log('개발 환경: 토큰 갱신 실패 (백엔드 서버 확인 필요)')
          } else {
            console.error('Token refresh failed:', error)
          }
          get().clearAuth()
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
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
