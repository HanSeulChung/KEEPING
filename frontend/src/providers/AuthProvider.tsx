'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore()
  const pathname = usePathname()

  useEffect(() => {
    // 회원가입 페이지에서는 인증 초기화를 건너뛰기
    const isRegisterPage = pathname.includes('/register/')
    if (isRegisterPage) {
      console.log('회원가입 페이지: 인증 초기화 건너뛰기')
      return
    }

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
  }, [initializeAuth, pathname])

  return <>{children}</>
}
