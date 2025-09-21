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
        console.log('=== 카카오 로그인 콜백 처리 ===')
        
        // URL 파라미터에서 에러 확인
        const error = searchParams.get('error')
        if (error) {
          console.error('로그인 에러:', error)
          alert('로그인 중 오류가 발생했습니다.')
          router.push('/')
          return
        }

        // 서버에서 사용자 정보를 가져오는 API 호출
        const response = await fetch('/auth/session-info', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('세션 정보를 가져올 수 없습니다.')
        }

        const sessionData = await response.json()
        console.log('세션 정보:', sessionData)

        // 사용자 정보가 있으면 로그인 처리
        if (sessionData.success && sessionData.data) {
          // 사용자 정보를 localStorage에 저장
          const userInfo = {
            id: sessionData.data.id || 'unknown',
            name: sessionData.data.name || '사용자',
            email: sessionData.data.email || '',
          }
          
          localStorage.setItem('user', JSON.stringify(userInfo))
          
          // Zustand 스토어 업데이트
          login(userInfo)
          
          console.log('로그인 성공:', userInfo)
          
          // 사용자 역할에 따라 리다이렉트
          const userRole = sessionData.data.role || 'CUSTOMER'
          if (userRole === 'OWNER') {
            router.push('/owner/dashboard')
          } else {
            router.push('/customer/home')
          }
        } else {
          throw new Error('사용자 정보를 찾을 수 없습니다.')
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
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">로그인 처리 중...</p>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
