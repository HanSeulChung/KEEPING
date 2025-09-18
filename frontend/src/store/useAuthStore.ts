import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (user) => set({ isLoggedIn: true, user }),
      logout: () => {
        // 로컬 스토리지 정리
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        set({ isLoggedIn: false, user: null })
      },
      initializeAuth: () => {
        // 자동 로그인 비활성화 - 항상 소셜 로그인을 통해서만 로그인
        // 기존 토큰이 있어도 자동 로그인하지 않고 초기화
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        set({ isLoggedIn: false, user: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
