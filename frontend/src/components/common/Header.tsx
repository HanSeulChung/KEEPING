'use client'

import { authApi } from '@/api/authApi'
// UserContext 제거: 고객/점주 모두 useAuthStore 사용
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
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
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }

      // 상태 업데이트
      if (isCustomerPage) {
        // 고객 로그아웃 처리
        window.location.href = '/customer/login'
      } else {
        // 점주 로그아웃 처리
        ownerLogout()
        router.push('/')
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
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={handleLogoClick}
            className="text-text font-display cursor-pointer text-base font-extrabold transition-colors hover:text-gray-600 sm:text-lg md:text-xl"
          >
            KEEPING
          </button>
        </div>

        {/* Right: 구분선 + 알림 버튼 + 로그인/로그아웃 */}
        <div className="flex items-center gap-2">
          {/* 홈페이지가 아닐 때만 구분선과 버튼들 표시 */}
          {!isHomePage && (
            <>
              <div className="border-border mx-3 self-stretch border-l"></div>

              {mounted ? (
                <>
                  {/* 로그인 상태일 때만 알림 버튼 표시 */}
                  {isLoggedIn && (
                    <button
                      onClick={handleNotificationClick}
                      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95 sm:h-10 sm:w-10"
                      aria-label="알림"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-700"
                      >
                        <path
                          d="M18 8A6 6 0 0 0 6 8C6 7.46957 6.21071 6.96086 6.58579 6.58579C6.96086 6.21071 7.46957 6 8 6H16C16.5304 6 17.0391 6.21071 17.4142 6.58579C17.7893 6.96086 18 7.46957 18 8Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18 8V13C18 13.5304 18.2107 14.0391 18.5858 14.4142C18.9609 14.7893 19.4696 15 20 15H4C4.53043 15 5.03914 14.7893 5.41421 14.4142C5.78929 14.0391 6 13.5304 6 13V8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {/* 읽지 않은 알림 개수 배지 */}
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </button>
                  )}

                  {/* 로그인 상태에 따른 버튼 */}
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="flex h-8 items-center rounded-full bg-gray-100 px-4 text-sm font-medium text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95 sm:h-10 sm:px-6 sm:text-base"
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
                          d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 17L21 12L16 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 12H9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      로그아웃
                    </button>
                  ) : (
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
