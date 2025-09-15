"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"

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
        router.push('/owner/login')
    }
    return (
        <div className="w-full bg-white pt-2 sm:pt-3 md:pt-4">
            {/* 상단 검은색 가로선 */}
            <div className="w-full border-t border-border"></div>

            {/* 헤더 */}
            <header className="w-full h-12 sm:h-14 md:h-16 flex justify-between border-b border-l border-r border-border bg-white px-4 sm:px-6">

                {/* Left: 뒤로가기 버튼 + 구분선 */}
                <div className="flex items-center">
                    <button className="p-2 sm:p-3 hover:bg-gray-100 rounded" aria-label="뒤로가기">
                        <Image
                            src="/back.svg"
                            alt="뒤로가기"
                            width={20}
                            height={20}
                            className="sm:w-6 sm:h-6 md:w-7 md:h-7"
                        />
                    </button>
                    {/* 세로 구분선 */}
                    <div className="self-stretch border-l border-border mx-3"></div>
                </div>

                {/* Center: Logo */}
                <div className="flex items-center">
                    <span className="font-extrabold text-base sm:text-lg md:text-xl text-text font-display">
                        KEEPING
                    </span>
                </div>

                {/* Right: 구분선 + 알림 버튼 + 로그인/로그아웃 */}
                <div className="flex items-center gap-2">
                    <div className="self-stretch border-l border-border mx-3"></div>
                    
                    {/* 홈페이지가 아닐 때만 로그인/로그아웃 버튼 표시 */}
                    {!isHomePage && (
                        <>
                            {/* 로그인 상태일 때만 알림 버튼 표시 */}
                            {isLoggedIn && (
                                <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Image
                                        src="/bell.svg"
                                        alt="알림"
                                        width={48}
                                        height={48}
                                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                                    />
                                    {/* 알림 뱃지 */}
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                                </button>
                            )}
                            
                            {/* 로그인 상태에 따른 버튼 */}
                            {isLoggedIn ? (
                                <button 
                                    onClick={handleLogout}
                                    className="text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    로그아웃
                                </button>
                            ) : (
                                <Link 
                                    href="/owner/login"
                                    className="text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
