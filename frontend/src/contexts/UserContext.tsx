'use client'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface User {
  userId: number
  role: 'CUSTOMER' | 'OWNER'
  name: string
  email: string
  phoneNumber: string
  imgUrl: string
  gender: 'MALE' | 'FEMALE'
  birth: string
  providerType: 'GOOGLE' | 'KAKAO' | 'NAVER'
  createdAt: string
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

  // 페이지 로드 시 access token 발급 (클로드 방식)
  const initializeAuth = async () => {
    try {
      console.log('🔄 앱 시작 - 토큰 초기화')
      
      // refresh token(쿠키)으로 access token 발급 - 타임아웃 증가
      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        credentials: 'include', // refresh token 쿠키 포함
        signal: AbortSignal.timeout(30000) // 30초 타임아웃
      })
      
      if (!response.ok) {
        throw new Error('Token refresh failed')
      }
      
      const data = await response.json()
      console.log('✅ 토큰 갱신 성공:', data)
      
      // localStorage에 access token 저장
      const accessToken = data.data.accessToken
      localStorage.setItem('accessToken', accessToken)
      console.log('💾 accessToken을 localStorage에 저장:', accessToken.substring(0, 20) + '...')
      
      return accessToken
    } catch (error) {
      console.error('❌ 토큰 초기화 실패:', error)
      throw error
    }
  }

  // 이후 API 호출 시 (클로드 방식)
  const getCurrentUser = async (accessToken: string) => {
    try {
      console.log('👤 사용자 정보 조회')
      
      const response = await fetch('http://localhost:8080/auth/me', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(30000) // 30초 타임아웃
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info')
      }
      
      const userData = await response.json()
      console.log('✅ 사용자 데이터:', userData)
      
      return userData.data
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error)
      throw error
    }
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('⏳ 토큰 갱신 시작...')
      
      // 1. 토큰 초기화 (더 오래 기다림)
      const accessToken = await initializeAuth()
      
      console.log('⏳ 사용자 정보 조회 시작...')
      
      // 2. 사용자 정보 조회
      const userData = await getCurrentUser(accessToken)
      setUser(userData)
      
      console.log('🎉 인증 완료!')
      
    } catch (err) {
      console.error('❌ fetchUser 에러:', err)
      
      // 에러 타입별 처리
      if (err instanceof Error) {
        if (err.name === 'TimeoutError') {
          setError('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.')
        } else if (err.message.includes('Token refresh failed')) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.')
        } else {
          setError('인증에 실패했습니다.')
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.')
      }
      
      // 리다이렉트 로직 완전 제거
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