'use client'
import { useAuthStore } from '@/store/useAuthStore'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn, user, logout } = useAuthStore()

  // 홈페이지인지 확인
  const isHomePage = pathname === '/'

  const handleLogout = () => {
    logout()
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/')
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
          <span className="text-text font-display text-base font-extrabold sm:text-lg md:text-xl">
            KEEPING
          </span>
        </div>

        {/* Right: 구분선 + 알림 버튼 + 로그인/로그아웃 */}
        <div className="flex items-center gap-2">
          <div className="border-border mx-3 self-stretch border-l"></div>

          {/* 홈페이지가 아닐 때만 로그인/로그아웃 버튼 표시 */}
          {!isHomePage && (
            <>
              {/* 로그인 상태일 때만 알림 버튼 표시 */}
              {isLoggedIn && (
                <button className="hover:bg-gray-100 sm:p-2" aria-label="알림">
                  <div className="relative h-4 w-4 sm:h-5 sm:w-5 md:h-7 md:w-7">
                    <Image
                      src="/icons/bell.svg"
                      alt="알림"
                      fill
                      className="object-contain opacity-60"
                    />
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
                  href="/owner/login"
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
