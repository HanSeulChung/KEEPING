'use client'
import { useUser } from '@/contexts/UserContext'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  // 점주용 인증 상태
  const {
    isLoggedIn: ownerLoggedIn,
    user: ownerUser,
    logout: ownerLogout,
  } = useAuthStore()

  // 고객용 인증 상태
  const { user: customerUser, loading: customerLoading } = useUser()

  const { unreadCount } = useNotificationSystem()

  // 현재 페이지가 고객 페이지인지 점주 페이지인지 확인
  const isCustomerPage = pathname.startsWith('/customer')
  const isOwnerPage = pathname.startsWith('/owner')

  // 현재 페이지에 맞는 로그인 상태 결정
  const isLoggedIn = isCustomerPage ? !!customerUser : ownerLoggedIn
  const user = isCustomerPage ? customerUser : ownerUser

  // 홈페이지인지 확인
  const isHomePage = pathname === '/'

  const handleLogout = async () => {
    try {
      // Authorization 헤더 추가
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      // 서버에 로그아웃 요청 (Cookie 제거를 위해)
      await fetch('/api/auth/logout', {
        method: 'GET',
        headers,
        credentials: 'include',
      })
    } catch (error) {
      console.error('로그아웃 요청 실패:', error)
    } finally {
      // 로컬 상태 업데이트
      if (isCustomerPage) {
        // 고객 로그아웃 처리
        localStorage.removeItem('accessToken')
        window.location.href = '/customer/login'
      } else {
        // 점주 로그아웃 처리
        ownerLogout()
        router.push('/')
      }
    }
  }

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
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-base"
                >
                  로그아웃
                </button>
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
