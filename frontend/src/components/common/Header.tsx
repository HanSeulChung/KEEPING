'use client'

import { authApi } from '@/api/authApi'
// UserContext 제거: 고객/점주 모두 useAuthStore 사용
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import {
  ArrowLeftIcon,
  BellIcon,
  EnterIcon,
  ExitIcon,
} from '@radix-ui/react-icons'
import * as Tooltip from '@radix-ui/react-tooltip'
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

  const handleLogin = () => {
    if (isCustomerPage) {
      router.push('/customer/login')
    } else {
      router.push('/owner/login')
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
              <Tooltip.Provider delayDuration={200}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={handleBackClick}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95 sm:h-10 sm:w-10"
                      aria-label="뒤로가기"
                    >
                      <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    sideOffset={6}
                    className="rounded bg-black px-2 py-1 text-xs font-medium text-white shadow select-none"
                  >
                    뒤로가기
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
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

              {/* 알림 버튼 */}
              <Tooltip.Provider delayDuration={200}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={handleNotificationClick}
                      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95 sm:h-10 sm:w-10"
                      aria-label="알림"
                    >
                      <BellIcon className="h-5 w-5 text-gray-700" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    sideOffset={6}
                    className="rounded bg-black px-2 py-1 text-xs font-medium text-white shadow select-none"
                  >
                    알림
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>

              {/* 로그인/로그아웃 */}
              {isLoggedIn ? (
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild>
                    <button
                      className="flex h-8 items-center gap-1 rounded-full border border-gray-300 bg-white px-3 text-sm text-gray-800 transition-colors hover:bg-gray-50 active:scale-95 sm:h-10 sm:px-4 sm:text-base"
                      aria-label="로그아웃"
                    >
                      <ExitIcon />
                      <span className="hidden sm:inline">로그아웃</span>
                    </button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 bg-black/40" />
                    <AlertDialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow">
                      <AlertDialog.Title className="mb-2 text-base font-bold">
                        로그아웃하시겠어요?
                      </AlertDialog.Title>
                      <AlertDialog.Description className="mb-4 text-sm text-gray-600">
                        현재 계정에서 로그아웃합니다.
                      </AlertDialog.Description>
                      <div className="flex justify-end gap-2">
                        <AlertDialog.Cancel className="rounded-md border px-3 py-1 text-sm">
                          취소
                        </AlertDialog.Cancel>
                        <AlertDialog.Action
                          onClick={handleLogout}
                          className="rounded-md bg-black px-3 py-1 text-sm font-semibold text-white"
                        >
                          로그아웃
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              ) : (
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={handleLogin}
                        className="flex h-8 items-center gap-1 rounded-full bg-blue-500 px-4 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-blue-600 active:scale-95 sm:h-10 sm:px-6 sm:text-base"
                        aria-label="로그인"
                      >
                        <EnterIcon />
                        <span className="hidden sm:inline">로그인</span>
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      sideOffset={6}
                      className="rounded bg-black px-2 py-1 text-xs font-medium text-white shadow select-none"
                    >
                      로그인
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
            </>
          )}
        </div>
      </header>
    </div>
  )
}
