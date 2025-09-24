'use client'

import { authApi } from '@/api/authApi'
import { useUser } from '@/contexts/UserContext'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
import LogoutButton from '@/components/auth/LogoutButton'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [forceUpdate, setForceUpdate] = useState(0)

  // 점주용 인증 상태
  const {
    isLoggedIn: ownerLoggedIn,
    user: ownerUser,
    logout: ownerLogout,
  } = useAuthStore()

  // 고객용 인증 상태
  const { user: customerUser, loading: customerLoading } = useUser()

  const { unreadCount } = useNotificationSystem()

  // 로그인 상태 변경 감지를 위한 useEffect
  useEffect(() => {
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
  }, [pathname, customerUser, ownerLoggedIn])

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

  const isLoggedIn = checkLoginStatus()
  const user = isCustomerPage ? customerUser : ownerUser

  // 홈페이지인지 확인
  const isHomePage = pathname === '/'



  const handleNotificationClick = () => {
    router.push('/owner/notification')
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
  return (
    <div className="w-full bg-white pt-1 sm:pt-2 md:pt-3">
      {/* 상단 검은색 가로선 */}
      <div className="border-border w-full border-t"></div>

      {/* 헤더 */}
      <header className="border-border flex h-10 w-full justify-between border-r border-b border-l bg-white px-4 sm:h-12 sm:px-6 md:h-14">
        <div className="flex items-center">
          <button
            className="rounded p-1 hover:bg-gray-100 sm:p-2"
            aria-label="뒤로가기"
          >
            <Image
              src="/back.svg"
              alt="뒤로가기"
              width={20}
              height={20}
              className="sm:h-6 sm:w-6 md:h-7 md:w-7"
            />
          </button>
          {/* 세로 구분선 */}
          <div className="border-border mx-3 self-stretch border-l"></div>
        </div>

        {/* Center: Logo */}
        <div className="flex items-center">
          <button
            onClick={handleLogoClick}
            className="text-text font-display cursor-pointer text-base font-extrabold transition-colors hover:text-gray-600 sm:text-lg md:text-xl"
          >
            KEEPING
          </button>
        </div>

        {/* Right: 구분선 + 알림 버튼 + 로그인/로그아웃 */}
        <div className="flex items-center gap-2">
          <div className="border-border mx-3 self-stretch border-l"></div>

          {/* 홈페이지가 아닐 때만 로그인/로그아웃 버튼 표시 */}
          {!isHomePage && (
            <>
              {/* 로그인 상태일 때만 알림 버튼 표시 */}
              {isLoggedIn && (
                <button
                  onClick={handleNotificationClick}
                  className="relative rounded-md transition-colors hover:bg-gray-100 sm:p-2"
                  aria-label="알림"
                >
                  <div className="relative h-4 w-4 sm:h-5 sm:w-5 md:h-7 md:w-7">
                    <Image
                      src="/icons/bell.svg"
                      alt="알림"
                      fill
                      className="object-contain opacity-60"
                    />
                    {/* 읽지 않은 알림 개수 배지 */}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              )}

              {/* 로그인 상태에 따른 버튼 */}
              {isLoggedIn ? (
                <LogoutButton className="rounded-lg border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-base" />
              ) : (
                <Link
                  href={isCustomerPage ? '/customer/login' : '/owner/login'}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-base"
                >
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
