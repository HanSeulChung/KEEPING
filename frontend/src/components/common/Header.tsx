"use client"
import Image from "next/image"

export default function Header() {
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

                {/* Right: 구분선 + 알림 버튼 */}
                <div className="flex items-center">
                    <div className="self-stretch border-l border-border mx-3"></div>
                        <Image
                            src="/bell.svg"
                            alt="알림"
                            width={48}
                            height={48}
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                        />
                </div>
            </header>
        </div>
    )
}
