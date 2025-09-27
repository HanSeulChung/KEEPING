'use client'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
  const [isFoodActive, setIsFoodActive] = useState(true)
  const { user, loading, error } = useUser()
  const router = useRouter()
  console.log('홈페이지 - useUser 상태:', { user, loading, error })

  const handleCategoryClick = (category: string) => {
    const type = isFoodActive ? 'food' : 'life'
    router.push(`/customer/list?type=${type}&category=${category}`)
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-6">
        <div className="w-full max-w-4xl">
          <div className="animate-pulse">
            <div className="mb-4 h-32 rounded bg-gray-200"></div>
            <div className="mb-4 h-12 rounded bg-gray-200"></div>
            <div className="mb-4 h-8 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[629px] w-[392px] flex-shrink-0 flex-col items-center px-6 pt-8 md:h-auto md:w-full md:max-w-4xl md:px-8 md:pt-12">
      {/* 검색바
      <div className="mb-4 h-14 w-full max-w-[720px] flex-shrink-0 items-center gap-1 rounded-[28px] bg-[#f6f8fc]">
        <div className="state-layer flex items-center self-stretch p-1">
          <div className="content font-nanum-square-round-eb flex items-center gap-2.5 self-stretch px-5 py-0 text-base leading-6 text-[#d9d9d9]">
            가게 검색
          </div>
          <div className="absolute top-[0.25rem] right-[0.25rem] flex items-center justify-end">
            <div className="flex h-12 w-12 items-center justify-center">
              <div className="flex w-10 flex-shrink-0 flex-col items-center justify-center rounded-full">
                <div className="flex h-10 items-center justify-center self-stretch">
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z"
                      fill="#D9D9D9"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* 메인 카드 */}
      <div className="mb-8 h-[11.5625rem] w-full flex-shrink-0 rounded-[0.625rem] bg-yellow-50 md:h-[13rem]">
        <div className="flex h-full items-center justify-between px-6 md:px-8">
          <div className="font-jalnan text-lg leading-[140%] text-[#ffc800] md:text-xl">
            똑똑한 선결제,
            <br />
            키핑으로 절약하세요 !
          </div>
          <div className="h-28 w-28 bg-[url('/common/customer.svg')] bg-cover bg-center bg-no-repeat md:h-32 md:w-32" />
        </div>
      </div>

      {/* 탭 버튼 */}
      <div className="mb-6 flex w-full items-start">
        <button
          onClick={() => setIsFoodActive(true)}
          className={`font-jalnan flex h-[2.5rem] w-[5.125rem] items-center justify-center rounded-tl-lg rounded-tr-lg px-3 py-1 text-xl leading-[140%] md:text-2xl ${
            isFoodActive
              ? 'bg-[#fdda60] text-white'
              : 'border-t border-r border-b border-l border-[#fdda60] text-[#fdda60]'
          }`}
        >
          FOOD
        </button>
        <button
          onClick={() => setIsFoodActive(false)}
          className={`font-jalnan flex h-[2.5rem] w-[5.125rem] items-center justify-center rounded-tl-lg rounded-tr-lg px-3 py-1 text-xl leading-[140%] md:text-2xl ${
            !isFoodActive
              ? 'bg-[#fdda60] text-white'
              : 'border-t border-r border-b border-l border-[#fdda60] text-[#fdda60]'
          }`}
        >
          LIFE
        </button>
      </div>

      {/* 카테고리 그리드 */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-5 md:gap-4">
        {isFoodActive ? (
          <>
            {/* 한식 */}
            <button
              onClick={() => handleCategoryClick('한식')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/한식.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            {/* 양식 */}
            <button
              onClick={() => handleCategoryClick('양식')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/양식.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            {/* 아시안 */}
            <button
              onClick={() => handleCategoryClick('아시안')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/아시안.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            {/* 중식 */}
            <button
              onClick={() => handleCategoryClick('중식')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/중식.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            {/* 분식 */}
            <button
              onClick={() => handleCategoryClick('분식')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/분식.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            {/* 식료품 */}
            <button
              onClick={() => handleCategoryClick('식료품')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/식료품.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            {/* 일식 */}
            <button
              onClick={() => handleCategoryClick('일식')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/일식.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            {/* 패스트푸드 */}
            <button
              onClick={() => handleCategoryClick('패스트푸드')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/패스트푸드.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            {/* 반찬 */}
            <button
              onClick={() => handleCategoryClick('반찬')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/food/반찬.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />
          </>
        ) : (
          <>
            {/* LIFE 카테고리들 */}
            <button
              onClick={() => handleCategoryClick('주류')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/주류.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            <button
              onClick={() => handleCategoryClick('뷰티')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/뷰티.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            <button
              onClick={() => handleCategoryClick('헤어')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/헤어.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            <button
              onClick={() => handleCategoryClick('클래스')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/클래스svg.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            <button
              onClick={() => handleCategoryClick('엔터테인먼트')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/엔터테인먼트.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            <button
              onClick={() => handleCategoryClick('꽃')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/꽃.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            <button
              onClick={() => handleCategoryClick('잡화')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/잡화.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            <button
              onClick={() => handleCategoryClick('반려동물')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/반려동물.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />

            <button
              onClick={() => handleCategoryClick('스포츠')}
              className="h-[6.25rem] w-[6.25rem] bg-[url('/home/life/스포츠.svg')] bg-cover bg-center bg-no-repeat transition-transform hover:scale-105 md:h-[7.5rem] md:w-[7.5rem]"
            />
          </>
        )}
      </div>
    </div>
  )
}
