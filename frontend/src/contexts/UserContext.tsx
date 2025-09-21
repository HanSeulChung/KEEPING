'use client'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface User {
  id?: number
  customerId?: number
  ownerId?: number
  userType: 'customer' | 'owner'
  email: string
  name: string
  phoneNumber: string
  birth: string
  gender: string
  imgUrl: string
  points?: number
}

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  refetchUser: () => Promise<void>
  checkAuth: () => Promise<any>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 fetchUser 함수 시작')
      const response = await fetch("/api/user")
      console.log('📡 fetch 응답:', response.status)

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else if (response.status !== 401) {
        const errorData = await response.json()
        setError(errorData.error || '사용자 정보를 가져올 수 없습니다')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
      console.error('❌ fetchUser 에러:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        const data = await response.json()
        return data
      }
      return { authenticated: false }
    } catch (error) {
      return { authenticated: false }
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, error, refetchUser: fetchUser, checkAuth }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}