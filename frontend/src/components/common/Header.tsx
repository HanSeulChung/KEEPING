'use client'

import { authApi } from '@/api/authApi'
// UserContext 제거: 고객/점주 모두 useAuthStore 사용
import LogoutButton from '@/components/auth/LogoutButton'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface HeaderProps {
  title?: string
}

export default function Header({ title }: HeaderProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [forceUpdate, setForceUpdate] = useState(0)
  const [mounted, setMounted] = useState(false)

  // 점주용 인증 상태
  const {
    isLoggedIn: ownerLoggedIn,
    user: ownerUser,
    logout: ownerLogout,
  } = useAuthStore()

  // 고객/점주 공통 인증 상태 (일원화)
  const { user: customerUser } = useAuthStore()

  const { unreadCount } = useNotificationSystem()

  // 클라이언트 마운트 확인
  useEffect(() => {
    setMounted(true)
  }, [])

  // 로그인 상태 변경 감지를 위한 useEffect
  useEffect(() => {
    if (!mounted) return

    const checkLoginStatus = () => {
      setForceUpdate(prev => prev + 1)
    }

    // Next.js 내부 경로가 아닐 때만 로그인 상태 확인
    if (!pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      // 주기적으로 로그인 상태 확인 (5초마다)
      const interval = setInterval(checkLoginStatus, 5000)

      // 컴포넌트 마운트 시 즉시 확인
      checkLoginStatus()

      return () => clearInterval(interval)
    }
  }, [pathname, customerUser, ownerLoggedIn, mounted])

  // 현재 페이지가 고객 페이지인지 점주 페이지인지 확인
  const isCustomerPage = pathname.startsWith('/customer')
  const isOwnerPage = pathname.startsWith('/owner')

  // localStorage에서 로그인 상태 확인 (여러 방법 체크)
  const checkLoginStatus = () => {
    if (typeof window === 'undefined') return false

    // 1. accessToken 직접 확인
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken && accessToken !== 'null' && accessToken !== 'undefined') {
      return true
    }

    // 2. auth-storage에서 확인 (Zustand store)
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage)
        if (parsed.state?.isLoggedIn) {
          return true
        }
      } catch (e) {
        console.error('auth-storage 파싱 오류:', e)
      }
    }

    // 3. user 정보가 있으면 로그인된 상태로 간주
    const userInfo = localStorage.getItem('user')
    if (userInfo && userInfo !== 'null' && userInfo !== 'undefined') {
      try {
        const parsed = JSON.parse(userInfo)
        if (parsed && (parsed.ownerId || parsed.userId)) {
          return true
        }
      } catch (e) {
        console.error('user 정보 파싱 오류:', e)
      }
    }

    return false
  }

  const isLoggedIn = mounted ? checkLoginStatus() : false
  const user = isCustomerPage ? customerUser : ownerUser

  // 홈페이지인지 확인
  const isHomePage = pathname === '/'

  // 로그인 후 첫 화면 또는 메인 화면에서는 뒤로가기 버튼 숨김 (클라이언트에서만)
  const isFirstScreenAfterLogin =
    mounted &&
    (isHomePage ||
      (isLoggedIn &&
        ((isCustomerPage && pathname === '/customer/home') ||
          (isOwnerPage && pathname === '/owner/dashboard'))))

  const handleLogout = async () => {
    try {
      // 백엔드에 로그아웃 요청
      await authApi.logout()
    } catch (error) {
      console.error('로그아웃 요청 실패:', error)
    } finally {
      // localStorage 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }

      // 상태 업데이트
      if (isCustomerPage) {
        // 고객 로그아웃 처리
        window.location.href = '/customer/login'
      } else {
        // 점주 로그아웃 처리
        ownerLogout()
        window.location.href = '/'
      }
    }
  }

  const handleNotificationClick = () => {
    if (isCustomerPage) {
      router.push('/customer/notification')
    } else {
      router.push('/owner/notification')
    }
  }

  const handleLogoClick = () => {
    if (isLoggedIn) {
      if (isCustomerPage) {
        router.push('/customer/home')
      } else {
        router.push('/owner/dashboard')
      }
    } else {
      router.push('/')
    }
  }

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      // 히스토리가 없으면 홈으로 이동
      if (isLoggedIn) {
        if (isCustomerPage) {
          router.push('/customer/home')
        } else {
          router.push('/owner/dashboard')
        }
      } else {
        router.push('/')
      }
    }
  }
  return (
    <div className="w-full bg-white pt-1 sm:pt-2 md:pt-3">
      {/* 상단 검은색 가로선 */}
      <div className="border-border w-full border-t"></div>

      {/* 헤더 */}
      <header className="border-border relative flex h-10 w-full border-r border-b border-l bg-white px-4 sm:h-12 sm:px-6 md:h-14">
        {/* Left: Back button */}
        <div className="flex items-center">
          {!isFirstScreenAfterLogin && (
            <>
              <button
                onClick={handleBackClick}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95 sm:h-10 sm:w-10"
                aria-label="뒤로가기"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-700"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* 세로 구분선 */}
              <div className="border-border mx-3 self-stretch border-l"></div>
            </>
          )}
        </div>

        {/* Center: Logo - 절대 중앙 배치 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={handleLogoClick}
            className="text-text font-display cursor-pointer text-base font-extrabold transition-colors hover:text-gray-600 sm:text-lg md:text-xl"
          >
            {title ||
              (pathname === '/owner/manage'
                ? '매장 관리'
                : pathname === '/owner/calendar'
                  ? 'CALENDAR'
                  : 'KEEPING')}
          </button>
        </div>

        {/* Right: 구분선 + 알림 버튼 + 로그인/로그아웃 */}
        <div className="ml-auto flex items-center gap-2">
          {/* 홈페이지가 아닐 때만 구분선과 버튼들 표시 */}
          {!isHomePage && (
            <>
              <div className="border-border mx-3 self-stretch border-l"></div>

              {/* 로그인 상태에 따른 버튼 */}
              {isLoggedIn ? (
                <LogoutButton className="rounded-lg border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-base" />
              ) : (
                /* 마운트되지 않았을 때 기본 로그인 버튼 표시 (hydration 방지) */
                <Link
                  href={isCustomerPage ? '/customer/login' : '/owner/login'}
                  className="flex h-8 items-center rounded-full bg-blue-500 px-4 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 sm:h-10 sm:px-6 sm:text-base"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 17L15 12L10 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 12H3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  로그인
                </Link>
              )}
            </>
          )}
        </div>
      </header>
    </div>
  )
}
