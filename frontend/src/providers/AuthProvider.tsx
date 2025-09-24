'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return <>{children}</>
}
