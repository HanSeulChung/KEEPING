'use client'

import { useUser } from '@/contexts/UserContext'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import { useAuthStore } from '@/store/useAuthStore'
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

  // 로그인/회원가입 페이지인지 확인
  const isAuthPage =
    pathname.includes('/login') || pathname.includes('/register')

  // 로그인/회원가입 페이지와 홈페이지에서는 헤더를 렌더링하지 않음
  if (isAuthPage || isHomePage) {
    return null
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
  // 사용자 타입에 따른 색상 결정
  const isOwner = isOwnerPage // 로그인 상태와 관계없이 owner 페이지면 owner 스타일 적용
  const isCustomer = isCustomerPage

  // 색상 변수
  const backColor = isOwner ? '#77D4FF' : '#FDDB5F'
  const backStrokeColor = isOwner ? '#75D2FF' : '#FDDB60'
  const bellColor = isOwner ? '#76D3FE' : '#FCDB60'
  const logoutColor = isOwner ? '#76D2FE' : '#FCDB60'

  return (
    <div className="flex h-[3.75rem] w-[412px] items-center justify-between px-4">
      {/* 왼쪽: 뒤로가기 버튼 */}
      <div className="flex w-[60px] justify-start">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center"
          aria-label="뒤로가기"
        >
          <svg
            width={25}
            height={25}
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.9 12.1095L15.5384 16.6708L14.1502 18.0825L8.10006 12.133L14.0495 6.0829L15.4612 7.47111L10.9 12.1095Z"
              fill={backColor}
              stroke={backStrokeColor}
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>

      {/* 가운데: 로고 */}
      <div className="flex flex-1 justify-center">
        <button
          onClick={handleLogoClick}
          className={`flex items-center justify-center ${
            isOwner ? 'translate-y-1' : ''
          }`}
        >
          {isLoggedIn ? (
            <Image
              src={
                isOwner ? '/common/logo_owner.svg' : '/common/logo_customer.svg'
              }
              alt="KEEPING"
              width={159}
              height={41}
              className="h-[2.5625rem] w-[9.9375rem]"
            />
          ) : (
            <div
              className={`h-[2.5625rem] w-[9.9375rem] bg-contain bg-no-repeat ${
                isOwner
                  ? "bg-[url('/common/logo_owner.svg')]"
                  : "bg-[url('/common/logo_customer.svg')]"
              }`}
            />
          )}
        </button>
      </div>

      {/* 오른쪽: 알림 + 로그인/로그아웃 */}
      <div className="flex w-[60px] justify-end gap-4">
        {/* 로그인 상태일 때만 알림 버튼 표시 */}
        {isLoggedIn && (
          <button
            onClick={handleNotificationClick}
            className="relative flex items-center justify-center"
            aria-label="알림"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 19V17H6V10C6 8.61667 6.41667 7.39167 7.25 6.325C8.08333 5.24167 9.16667 4.53333 10.5 4.2V3.5C10.5 3.08333 10.6417 2.73333 10.925 2.45C11.225 2.15 11.5833 2 12 2C12.4167 2 12.7667 2.15 13.05 2.45C13.35 2.73333 13.5 3.08333 13.5 3.5V4.2C14.8333 4.53333 15.9167 5.24167 16.75 6.325C17.5833 7.39167 18 8.61667 18 10V17H20V19H4ZM12 22C11.45 22 10.975 21.8083 10.575 21.425C10.1917 21.025 10 20.55 10 20H14C14 20.55 13.8 21.025 13.4 21.425C13.0167 21.8083 12.55 22 12 22ZM8 17H16V10C16 8.9 15.6083 7.95833 14.825 7.175C14.0417 6.39167 13.1 6 12 6C10.9 6 9.95833 6.39167 9.175 7.175C8.39167 7.95833 8 8.9 8 10V17Z"
                fill={bellColor}
              />
            </svg>
            {/* 읽지 않은 알림 개수 배지 */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </button>
        )}

        {/* 로그인/로그아웃 버튼 */}
        {isLoggedIn ? (
          <button
            onClick={() => {
              if (isCustomerPage) {
                // 고객 로그아웃 로직
                localStorage.removeItem('accessToken')
                localStorage.removeItem('user')
                router.push('/customer/login')
              } else {
                // 점주 로그아웃 로직
                ownerLogout()
                router.push('/owner/login')
              }
            }}
            className="flex items-center justify-center"
            aria-label="로그아웃"
          >
            {/* 로그아웃 아이콘 */}
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 16L21 12M21 12L17 8M21 12H9M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                stroke={logoutColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <Link
            href={isCustomerPage ? '/customer/login' : '/owner/login'}
            className="flex items-center justify-center"
            aria-label="로그인"
          >
            {/* 로그인 아이콘 */}
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3"
                stroke={logoutColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}
