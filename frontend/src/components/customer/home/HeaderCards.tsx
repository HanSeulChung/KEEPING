'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import QRModal from './QRmodal'

const dummyCards: Card[] = [
  { id: 1, name: '카페리', type: 'group' },
  { id: 2, name: '아쭈맛나', type: 'personal' },
  { id: 3, name: '점심모임', type: 'group' },
  { id: 4, name: '마트쇼핑', type: 'personal' },
]

// 카드 색상 배열
const cardColors = [
  '#fcf2f6', // 연한 핑크
  '#faf7ed', // 연한 노랑
  '#f2fafe', // 연한 파랑
  '#fafdee', // 연한 초록
  '#fff5f5', // 연한 빨강
  '#f0f9ff', // 연한 하늘
]

// 카드 타입 정의
interface Card {
  id: number
  name: string
  type: 'group' | 'personal'
}

export const HeaderCards = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  // 카드 목록 조회
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards')
        const data = await response.json()
        setCards(data)
      } catch (error) {
        console.error('카드 목록 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  // 카드 색상 가져오기 함수
  const getCardColor = (index: number) => {
    return cardColors[index % cardColors.length]
  }

  // 배지 렌더링 함수
  const renderBadge = (type: 'group' | 'personal') => {
    if (type === 'group') {
      return (
        <div className="absolute top-2 left-2 h-6 w-6">
          <div className="relative h-6 w-[22px]">
            <Image
              src="/icons/badge-group.svg"
              alt="Ellipse"
              width={22}
              height={14}
              className="absolute top-[5px] left-0"
            />
            <div className="font-nanum absolute top-0 left-1.5 text-[5px] leading-6 font-bold tracking-[0] whitespace-nowrap text-[#ffdb69]">
              그룹
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="absolute top-2 left-2 h-6 w-6">
          <div className="relative h-6 w-[22px]">
            <Image
              src="/icons/badge-personal.svg"
              alt="Circle"
              width={22}
              height={14}
              className="absolute top-[5px] left-0"
            />
            <div className="font-nanum absolute top-0 left-1.5 text-[5px] leading-6 font-bold tracking-[0] whitespace-nowrap text-[#4c97d5]">
              개인
            </div>
          </div>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="mb-6 w-full">
        <div className="scrollbar-hide overflow-x-auto">
          <div
            className="flex gap-2 pb-2 sm:gap-4"
            style={{ width: 'max-content' }}
          >
            {/* 로딩 스켈레톤 */}
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex h-[129px] w-[108px] flex-shrink-0 animate-pulse items-center justify-center border border-solid border-gray-300 bg-gray-100 sm:w-[120px] lg:w-[140px]"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 w-full">
      <div className="scrollbar-hide overflow-x-auto">
        <div
          className="flex gap-2 pb-2 sm:gap-4"
          style={{ width: 'max-content' }}
        >
          {/* 카드가 없을 때 기본 카드 표시 */}
          {dummyCards.length === 0 && (
            <div className="flex h-[129px] w-[108px] flex-shrink-0 items-center justify-center border border-solid border-black bg-white sm:w-[120px] lg:w-[140px]">
              <Image
                src="/home/card/nocards.svg"
                alt="No cards"
                width={108}
                height={128}
                className="object-cover"
              />
            </div>
          )}

          {/* 실제 카드들 */}
          {dummyCards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="relative flex h-[129px] w-[108px] flex-shrink-0 cursor-pointer items-center justify-center border border-solid border-black transition-transform sm:w-[120px] lg:w-[140px]"
              style={{ backgroundColor: getCardColor(index) }}
            >
              {renderBadge(card.type)}
              <div className="font-nanum text-xs leading-6 font-extrabold tracking-[0] text-black">
                {card.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR 모달 */}
      <QRModal
        cardName={selectedCard?.name}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  )
}
