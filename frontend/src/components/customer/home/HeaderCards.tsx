'use client'
import { buildURL } from '@/api/config'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import QRModal from './QRmodal'

// 카드 색상 배열
const cardColors = [
  '#fcf2f6', // 연한 핑크
  '#faf7ed', // 연한 노랑
  '#f2fafe', // 연한 파랑
  '#fafdee', // 연한 초록
  '#fff5f5', // 연한 빨강
  '#f0f9ff', // 연한 하늘
]

// API 응답 타입 정의
interface StoreBalance {
  storeId: number
  storeName: string
  remainingPoints: number
  lastUpdatedAt: string
}

interface WalletData {
  groupId?: number
  walletId: number
  groupName?: string
  storeBalances: {
    content: StoreBalance[]
    totalElements: number
    empty: boolean
  }
}

interface WalletBalanceResponse {
  success: boolean
  status: number
  message: string
  data: {
    personalWallet: WalletData
    groupWallets: WalletData[]
  }
  timestamp: string
}

// 카드 타입 정의
interface Card {
  id: number
  storeName: string
  remainingPoints: number
  type: 'group' | 'personal'
  walletId: number
  groupId?: number
  groupName?: string
}

export const HeaderCards = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  // 카드 목록 조회
  useEffect(() => {
    const fetchCards = async () => {
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

        // 개인 지갑과 그룹 지갑 정보를 각각 조회
        const [personalResponse, groupsResponse] = await Promise.all([
          fetch(buildURL('/wallets/individual/balance'), {
            method: 'GET',
            headers,
            credentials: 'include',
          }),
          fetch(buildURL('/groups'), {
            method: 'GET',
            headers,
            credentials: 'include',
          }),
        ])

        if (!personalResponse.ok) {
          console.warn(
            `개인 지갑 조회 실패: ${personalResponse.status}, 더미 데이터 사용`
          )
          // 404 에러 시 더미 데이터로 대체
          const transformedCards: Card[] = [
            {
              id: 1,
              storeName: '아쭈맛나',
              remainingPoints: 35000,
              type: 'personal',
              walletId: 1,
            },
          ]
          setCards(transformedCards)
          setLoading(false)
          return
        }

        const personalData = await personalResponse.json()
        console.log('개인 지갑 응답 데이터:', personalData)

        // API 응답을 카드 형태로 변환
        const transformedCards: Card[] = []

        // 개인 지갑의 각 가게별 카드 추가
        const personalStoreBalances =
          personalData.data?.storeBalances?.content ||
          personalData.data?.storeBalances ||
          []
        if (personalData.data && personalStoreBalances.length > 0) {
          personalStoreBalances.forEach((store: any) => {
            transformedCards.push({
              id: personalData.data.walletId * 1000 + store.storeId, // 고유 ID 생성
              storeName: store.storeName,
              remainingPoints: store.remainingPoints,
              type: 'personal',
              walletId: personalData.data.walletId,
            })
          })
        }

        // 그룹 지갑들의 각 가게별 카드 추가
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          console.log('그룹 목록 응답 데이터:', groupsData)

          if (groupsData.data && groupsData.data.length > 0) {
            for (const group of groupsData.data) {
              try {
                const groupWalletResponse = await fetch(
                  buildURL(`/wallets/groups/${group.groupId}/balance`),
                  {
                    method: 'GET',
                    headers,
                    credentials: 'include',
                  }
                )

                if (groupWalletResponse.ok) {
                  const groupWalletData = await groupWalletResponse.json()
                  const groupStoreBalances =
                    groupWalletData.data?.storeBalances?.content ||
                    groupWalletData.data?.storeBalances ||
                    []

                  if (groupStoreBalances.length > 0) {
                    groupStoreBalances.forEach((store: any) => {
                      transformedCards.push({
                        id:
                          groupWalletData.data.walletId * 1000 + store.storeId, // 고유 ID 생성
                        storeName: store.storeName,
                        remainingPoints: store.remainingPoints,
                        type: 'group',
                        walletId: groupWalletData.data.walletId,
                        groupId: group.groupId,
                        groupName: group.groupName,
                      })
                    })
                  }
                }
              } catch (groupError) {
                console.error(
                  `그룹 ${group.groupId} 지갑 조회 실패:`,
                  groupError
                )
              }
            }
          }
        }

        console.log('변환된 카드 목록:', transformedCards)
        setCards(transformedCards)
      } catch (error) {
        console.error('카드 목록 조회 실패:', error)
        // 에러 발생 시 빈 배열로 설정
        setCards([])
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
          {cards.length === 0 && (
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
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="relative flex h-[129px] w-[108px] flex-shrink-0 cursor-pointer flex-col items-center justify-center border border-solid border-black transition-transform sm:w-[120px] lg:w-[140px]"
              style={{ backgroundColor: getCardColor(index) }}
            >
              {renderBadge(card.type)}
              <div className="px-2 text-center">
                <div className="font-nanum mb-1 text-xs leading-4 font-extrabold tracking-[0] text-black">
                  {card.storeName}
                </div>
                <div className="font-nanum text-[10px] leading-3 font-bold tracking-[0] text-gray-600">
                  {card.remainingPoints.toLocaleString()}P
                </div>
                {card.type === 'group' && card.groupName && (
                  <div className="font-nanum mt-1 text-[8px] leading-3 font-medium tracking-[0] text-blue-600">
                    {card.groupName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR 모달 */}
      <QRModal
        cardName={selectedCard?.storeName}
        walletId={selectedCard?.walletId}
        storeId={selectedCard?.id ? selectedCard.id % 1000 : undefined} // storeId 추출
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  )
}
