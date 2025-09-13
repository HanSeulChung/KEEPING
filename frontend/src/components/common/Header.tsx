"use client"
import Image from "next/image"

export default function Header() {
    return (
        <div className="w-full bg-white pt-2 sm:pt-3 md:pt-4">
            {/* 상단 검은색 가로선 */}
            <div className="w-full border-t border-border"></div>
            {/* 헤더 */}
            <header className="w-full h-12 sm:h-14 md:h-16 lg:h-18 flex items-center justify-between border-b border-l border-r border-border bg-white px-3 sm:px-4 md:px-6">
                {/* 뒤로가기 버튼 */}
                <button className="p-1 sm:p-2 hover:bg-gray-100 rounded" aria-label="뒤로가기">
                    <Image src="/back.svg" alt="뒤로가기" width={16} height={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>

                {/* 세로 구분선 */}
                <div className="h-12 sm:h-14 md:h-16 lg:h-18 border-l border-border"></div>

                {/* Center: Logo */}
                <span className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl text-text font-display">KEEPING</span>

                {/* 세로 구분선 */}
                <div className="h-12 sm:h-14 md:h-16 lg:h-18 border-l border-border"></div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <button className="p-1 sm:p-2 rounded hover:bg-gray-100" aria-label="알림">
                        <Image src="/bell.svg" alt="알림" width={48} height={48} className="w-16 h-16 sm:w-12 sm:h-12 md:w-14 md:h-14" />
                    </button>
                </div>
            </header>
        </div>
    )
}