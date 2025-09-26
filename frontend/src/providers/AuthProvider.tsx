'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuth()
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('개발 환경: 인증 초기화 실패 (백엔드 서버 확인 필요)')
        } else {
          console.error('Auth initialization failed:', error)
        }
      }
    }
    initAuth()
  }, [initializeAuth])

  return <>{children}</>
}
