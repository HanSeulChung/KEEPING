'use client'
import Image from 'next/image'
import { useState } from 'react'

// 가게 정보 컴포넌트
const StoreInfo = () => {
  const [activeTab, setActiveTab] = useState<'charge' | 'menu'>('charge')

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 가게 이름 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-black">코미도리</h1>
      </div>

      {/* 가게 소개 섹션 */}
      <div className="mb-8 flex items-center gap-4 px-4">
        <Image
          src="/store/ownerIntro.svg"
          alt="코미도리 가게 이미지"
          width={69}
          height={92}
          className="flex-shrink-0"
        />
        <div className="flex-1 rounded-3xl bg-yellow-50 p-4">
          <p className="text-center text-lg leading-6 text-black">
            "역삼 직장인들의 추천 맛집, 코미도리"
            <br />
            숙성된 도미로 만드는 다양한 요리로 점심은 물론 저녁 술자리까지
            가능합니다 :)
          </p>
        </div>
      </div>

      {/* 가게 이미지 갤러리 */}
      <div className="mb-8 grid grid-cols-3 gap-4 px-4">
        <div className="aspect-[4/3] rounded bg-gray-300"></div>
        <div className="aspect-[4/3] rounded bg-gray-300"></div>
        <div className="aspect-[4/3] rounded bg-gray-300"></div>
      </div>

      {/* 메뉴/충전 탭 */}
      <div className="mb-8 flex justify-center gap-8">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="tab"
            value="charge"
            checked={activeTab === 'charge'}
            onChange={() => setActiveTab('charge')}
            className="sr-only"
          />
          <div
            className={`transition-all ${
              activeTab === 'charge' ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8.69727"
                cy="9"
                r="7.5"
                fill={activeTab === 'charge' ? '#fde047' : 'white'}
                stroke="black"
              />
              <path
                d="M11.6973 2C11.6973 2 7.52196 2.90525 5.37247 4.58134C3.12803 6.33147 1.20994 10.3899 1.20994 10.3899"
                stroke="black"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xs font-extrabold text-black">충전 금액</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="tab"
            value="menu"
            checked={activeTab === 'menu'}
            onChange={() => setActiveTab('menu')}
            className="sr-only"
          />
          <div
            className={`transition-all ${
              activeTab === 'menu' ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8.69727"
                cy="9"
                r="7.5"
                fill={activeTab === 'menu' ? '#fde047' : 'white'}
                stroke="black"
              />
              <path
                d="M11.6973 2C11.6973 2 7.52196 2.90525 5.37247 4.58134C3.12803 6.33147 1.20994 10.3899 1.20994 10.3899"
                stroke="black"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xs font-extrabold text-black">메뉴</span>
        </label>
      </div>
    </div>
  )
}

// 충전 옵션 아이템 컴포넌트
interface ChargeOptionProps {
  discount: string
  points: string
  isSelected?: boolean
}

const ChargeOption = ({
  discount,
  points,
  isSelected = false,
}: ChargeOptionProps) => {
  return (
    <div
      className={`flex h-14 w-full cursor-pointer items-center border border-black px-5 transition-colors ${
        isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-yellow-50'
      }`}
    >
      <span className="text-sm font-bold text-red-500">{discount}</span>
      <span className="ml-24 text-sm font-bold text-black">{points}</span>
    </div>
  )
}

// 충전 섹션 컴포넌트
const ChargeSection = () => {
  const chargeOptions = [
    { discount: '5% 할인', points: '50,000 포인트' },
    { discount: '5% 할인', points: '100,000 포인트' },
    { discount: '5% 할인', points: '150,000 포인트' },
    { discount: '5% 할인', points: '200,000 포인트' },
    { discount: '5% 할인', points: '250,000 포인트' },
  ]

  return (
    <div className="mx-auto w-full max-w-md">
      {/* 충전 옵션들 */}
      <div className="mb-6 space-y-2">
        {chargeOptions.map((option, index) => (
          <ChargeOption
            key={index}
            discount={option.discount}
            points={option.points}
            isSelected={index === 0}
          />
        ))}
      </div>

      {/* 결제 금액 */}
      <div className="mb-6">
        <span className="text-sm font-bold text-black">
          결제 금액: 47,500원
        </span>
      </div>

      {/* 충전하기 버튼 */}
      <button className="flex h-14 w-full items-center justify-center border border-black bg-black">
        <span className="text-sm font-bold text-white">충전하기</span>
      </button>
    </div>
  )
}

// 메인 컴포넌트
export const StoreDetailPage = () => {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <StoreInfo />
        <ChargeSection />
      </div>
    </div>
  )
}
