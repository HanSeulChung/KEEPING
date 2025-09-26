'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        // URL 파라미터에서 에러 확인
        const error = searchParams.get('error')
        if (error) {
          console.error('로그인 에러:', error)
          alert('로그인 중 오류가 발생했습니다.')
          router.push('/')
          return
        }

        // /auth/refresh로 accessToken 발급 및 사용자 정보 가져오기
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'https://j13a509.p.ssafy.io/api'
        console.log('accessToken 발급 및 사용자 정보 요청...')
        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // refreshToken 쿠키 포함
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!refreshResponse.ok) {
          console.error(
            'Refresh 요청 실패:',
            refreshResponse.status,
            refreshResponse.statusText
          )
          const errorText = await refreshResponse.text()
          console.error('응답 내용:', errorText)
          throw new Error(
            `인증 정보를 가져올 수 없습니다. (${refreshResponse.status})`
          )
        }

        const refreshData = await refreshResponse.json()
        console.log('refresh 응답:', refreshData)

        // 사용자 정보와 토큰 처리
        if (refreshData.success && refreshData.data) {
          // accessToken만 사용 (refreshToken은 무시)
          const accessToken = refreshData.data.accessToken

          // 사용자 정보를 localStorage에 저장
          const userInfo = {
            id: refreshData.data.userId || 'unknown',
            userId: refreshData.data.userId,
            name: refreshData.data.name || '사용자',
            email: refreshData.data.email || '',
            role: refreshData.data.role || 'CUSTOMER',
          }

          localStorage.setItem('user', JSON.stringify(userInfo))

          if (accessToken) {
            localStorage.setItem('accessToken', accessToken)
            console.log('accessToken 저장 완료')
          } else {
            console.warn('refresh 응답에 accessToken이 없습니다')
          }

          // Zustand 스토어 업데이트 (refreshToken은 쿠키로만 관리)
          login(userInfo, accessToken)

          console.log('로그인 성공:', userInfo)
          console.log('저장된 토큰 여부:', !!accessToken)
          console.log('refreshToken 쿠키 제거 완료')

          // 사용자 역할에 따라 리다이렉트
          const userRole = refreshData.data.role || 'CUSTOMER'
          if (userRole === 'OWNER') {
            router.push('/owner/dashboard')
          } else {
            router.push('/customer/home')
          }
        } else {
          throw new Error('인증 정보를 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error)
        alert('로그인 처리 중 오류가 발생했습니다.')
        router.push('/')
      } finally {
        setIsProcessing(false)
      }
    }

    processCallback()
  }, [router, searchParams, login])

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">로그인 처리 중...</p>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
