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
      const token = localStorage.getItem('accessToken')
      if (token) return
      try {
        const res = await fetch(buildURL(API_ENDPOINTS.auth.refresh), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        if (data?.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken)
        }
        if (data?.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }
      } catch {}
    }

    bootstrapRefresh()
  }, [initializeAuth])

  return <>{children}</>
}
