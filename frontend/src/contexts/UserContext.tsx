'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { buildURL } from '@/api/config'

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

      const refreshUrl = buildURL('/auth/refresh')
      console.log('🔗 Refresh URL:', refreshUrl)

      // refresh token(쿠키)으로 access token 발급 - 타임아웃 증가
      const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include', // refresh token 쿠키 포함
        signal: AbortSignal.timeout(30000), // 30초 타임아웃
      })

      console.log('🔄 Refresh 응답:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Token refresh 실패:', errorText)
        throw new Error(
          `Token refresh failed: ${response.status} - ${errorText}`
        )
      }

      const data = await response.json()
      console.log('✅ Refresh 응답 데이터:', data)

      // localStorage에 access token 저장
      const accessToken = data.data.accessToken
      console.log('🔑 Access Token:', accessToken ? '토큰 있음' : '토큰 없음')
      localStorage.setItem('accessToken', accessToken)

      return accessToken
    } catch (error) {
      console.error('❌ initializeAuth 실패:', error)
      throw error
    }
  }

  const getCurrentUser = async (accessToken: string) => {
    try {
      const meUrl = buildURL('/auth/me')
      console.log('🔗 User Info URL:', meUrl)

      // accessToken 유효성 검사
      if (
        !accessToken ||
        accessToken === 'null' ||
        accessToken === 'undefined'
      ) {
        console.error('❌ AccessToken이 유효하지 않습니다:', accessToken)
        throw new Error('Invalid access token')
      }

      // Authorization 헤더 추가
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      }

      console.log('🔑 User Info 요청 헤더:', headers)
      console.log('🔑 AccessToken 길이:', accessToken.length)

      const response = await fetch(meUrl, {
        credentials: 'include',
        headers,
        signal: AbortSignal.timeout(30000), // 30초 타임아웃
      })

      console.log('👤 User Info 응답:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ User Info 조회 실패:', errorText)
        throw new Error(
          `Failed to fetch user info: ${response.status} - ${errorText}`
        )
      }

      const userData = await response.json()
      console.log('✅ User Info 응답 데이터:', userData)

      return userData.data
    } catch (error) {
      console.error('❌ getCurrentUser 실패:', error)
      throw error
    }
  }

  const fetchUser = async () => {
    try {
      console.log('🔄 사용자 정보 가져오기 시작')
      setLoading(true)
      setError(null)

      console.log('🔑 Access Token 발급 시도...')
      const accessToken = await initializeAuth()
      console.log(
        '✅ Access Token 발급 완료:',
        accessToken ? '토큰 있음' : '토큰 없음'
      )

      console.log('👤 사용자 정보 조회 시도...')
      const userData = await getCurrentUser(accessToken)
      console.log('✅ 사용자 정보 조회 완료:', userData)
      setUser(userData)
    } catch (err) {
      console.error('❌ 사용자 정보 가져오기 실패:', err)

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
      console.log('🏁 사용자 정보 로딩 완료')
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
    console.log('🚀 UserContext useEffect 시작')
    fetchUser()
  }, [])

  return (
    <UserContext.Provider
      value={{ user, loading, error, refetchUser: fetchUser, checkAuth }}
    >
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
