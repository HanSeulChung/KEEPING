'use client'

import { endpoints as API_ENDPOINTS, buildURL } from '@/api/config'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()

    const bootstrapRefresh = async () => {
      // Cookie에서 토큰 확인
      const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift() || null
        }
        return null
      }

      // 가능한 쿠키 이름들 시도
      const possibleTokenNames = ['accessToken', 'access_token', 'token', 'authToken', 'jwt', 'refreshToken']
      let token = null
      
      for (const name of possibleTokenNames) {
        token = getCookie(name)
        if (token) break
      }
      
      if (token) return // 이미 토큰이 있으면 리프레시 불필요
      
      try {
        const res = await fetch(buildURL(API_ENDPOINTS.auth.refresh), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        // 토큰은 서버에서 Cookie로 설정되므로 클라이언트에서 저장할 필요 없음
        if (data?.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }
      } catch {}
    }

    bootstrapRefresh()
  }, [initializeAuth])

  return <>{children}</>
}
