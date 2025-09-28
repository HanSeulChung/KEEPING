'use client'

import Dashboard from '@/components/owner/Dashboard'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

export default function OwnerPage() {
  const router = useRouter()
  const { isLoggedIn, user, checkAuthStatus, initializeAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('=== 대시보드 인증 확인 시작 ===')

        // localStorage에서 직접 토큰 확인
        const accessToken = localStorage.getItem('accessToken')
        console.log('localStorage accessToken:', accessToken ? '있음' : '없음')

        // localStorage에서 사용자 정보 확인
        const storedUser = localStorage.getItem('user')
        console.log('localStorage user:', storedUser ? '있음' : '없음')

        if (!accessToken || !storedUser) {
          console.log(
            '토큰 또는 사용자 정보가 없습니다. 로그인 페이지로 이동합니다.'
          )
          router.push('/owner/login')
          return
        }

        const userInfo = JSON.parse(storedUser)
        console.log('사용자 정보:', userInfo)

        // 역할 확인
        if (userInfo.role !== 'OWNER') {
          console.log('점주가 아닌 사용자입니다. 고객 홈으로 이동합니다.')
          router.push('/customer/home')
          return
        }

        console.log('인증 성공. 대시보드를 표시합니다.')
        setIsLoading(false)
      } catch (error) {
        console.error('인증 확인 중 오류:', error)
        router.push('/owner/login')
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  )
}
