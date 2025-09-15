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
      logout: () => set({ isLoggedIn: false, user: null }),
      initializeAuth: () => {
        // 로컬 스토리지에서 토큰 확인
        const token = localStorage.getItem('accessToken')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData)
            set({ isLoggedIn: true, user })
          } catch (error) {
            console.error('사용자 데이터 파싱 오류:', error)
            // 잘못된 데이터가 있으면 정리
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            set({ isLoggedIn: false, user: null })
          }
        } else {
          set({ isLoggedIn: false, user: null })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
