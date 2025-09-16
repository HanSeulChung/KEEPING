'use client'
import { useState } from 'react'

// 타입 정의
interface WalletCard {
  id: number
  name: string
  amount: number
  isSelected?: boolean
}

interface Transaction {
  id: number
  type: 'charge' | 'usage'
  amount: number
  date: string
}

// 더미 데이터
const WALLET_CARDS: WalletCard[] = [
  { id: 1, name: '아쭈맛나', amount: 35000, isSelected: false },
  { id: 2, name: '아쭈맛나', amount: 35000, isSelected: true },
  { id: 3, name: '아쭈맛나', amount: 35000, isSelected: false },
]

const TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'charge', amount: 35000, date: '2025-09-01' },
  { id: 2, type: 'usage', amount: 12000, date: '2025-09-07' },
  { id: 3, type: 'charge', amount: 35000, date: '2025-09-01' },
  { id: 4, type: 'usage', amount: 12000, date: '2025-09-07' },
  { id: 5, type: 'charge', amount: 35000, date: '2025-09-01' },
  { id: 6, type: 'usage', amount: 12000, date: '2025-09-07' },
]

const TAB_CONFIG = {
  history: '사용내역',
  charge: '충전',
  refund: '환불',
} as const

// 지갑 카드 컴포넌트
const WalletCard = ({
  card,
  onClick,
}: {
  card: WalletCard
  onClick: () => void
}) => {
  return (
    <div
      className={`relative h-40 w-40 cursor-pointer border border-black transition-colors ${
        card.isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {/* 아쭈맛나 텍스트 */}
      <div className="absolute top-4 left-4 text-sm font-normal text-black">
        {card.name}
      </div>

      {/* 01 텍스트 */}
      <div className="absolute top-4 right-4 text-xs font-normal text-black">
        {card.id.toString().padStart(2, '0')}
      </div>

      {/* 선 */}
      <div className="absolute top-12 right-4 left-4 h-px bg-black"></div>

      {/* 금액 */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 text-sm font-extrabold text-black">
        {card.amount.toLocaleString()}원
      </div>

      {/* 결제하기 버튼 */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2">
        <div className="flex h-5 w-15 items-center justify-center border-2 border-blue-500 bg-white">
          <span className="text-xs font-bold text-blue-500">결제하기</span>
        </div>
      </div>
    </div>
  )
}

// 거래 내역 아이템 컴포넌트
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div className="relative h-16 w-full">
      {/* 충전/사용 라벨 */}
      <div
        className={`absolute top-4 left-4 flex h-6 w-13 items-center justify-center border text-sm font-extrabold ${
          transaction.type === 'charge'
            ? 'border-blue-500 text-blue-500'
            : 'border-red-500 text-red-500'
        }`}
      >
        {transaction.type === 'charge' ? '충전' : '사용'}
      </div>

      {/* 금액 */}
      <div className="absolute top-4 left-20 text-sm font-extrabold text-black">
        {transaction.amount.toLocaleString()}원
      </div>

      {/* 날짜 */}
      <div className="absolute top-5 left-44 text-xs font-extrabold text-gray-400">
        {transaction.date}
      </div>

      {/* 구분선 */}
      <div className="absolute right-3 bottom-4 left-3 h-px bg-gray-300"></div>
    </div>
  )
}

// 페이지네이션 컴포넌트
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-8 w-8 rounded-full border border-black text-sm font-bold ${
            currentPage === page
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  )
}

// 메인 컴포넌트
export const MyWallet = () => {
  const [selectedCard, setSelectedCard] = useState<number>(2)
  const [activeTab, setActiveTab] = useState<keyof typeof TAB_CONFIG>('history')
  const [currentPage, setCurrentPage] = useState(1)

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId)
  }

  const cardsWithSelection = WALLET_CARDS.map(card => ({
    ...card,
    isSelected: card.id === selectedCard,
  }))

  return (
    <div className="min-h-screen bg-white p-4">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-black">내 지갑</h1>
      </div>

      {/* 지갑 카드 캐러셀 */}
      <div className="mb-6 w-full">
        <div className="scrollbar-hide overflow-x-auto">
          <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
            {cardsWithSelection.map(card => (
              <WalletCard
                key={card.id}
                card={card}
                onClick={() => handleCardSelect(card.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="relative mb-6 h-13 w-full">
        {Object.entries(TAB_CONFIG).map(([tabKey, tabLabel], index) => (
          <div key={tabKey} className="relative">
            <button
              onClick={() => setActiveTab(tabKey as keyof typeof TAB_CONFIG)}
              className={`absolute h-8 w-22 border border-black text-xs font-normal transition-colors ${
                activeTab === tabKey
                  ? 'bg-[#efefef] text-black'
                  : 'bg-white text-black hover:bg-[#efefef]'
              }`}
              style={{
                left: `${7 + index * 94}px`,
                top: '11px',
              }}
            >
              <div className="flex h-full items-center justify-center">
                {tabLabel}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* 탭 내용 */}
      {activeTab === 'history' && (
        <div className="mb-6">
          {TRANSACTIONS.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}

      {activeTab === 'charge' && (
        <div className="mb-6 text-center text-gray-500">
          충전 기능은 준비 중입니다.
        </div>
      )}

      {activeTab === 'refund' && (
        <div className="mb-6 text-center text-gray-500">
          환불 기능은 준비 중입니다.
        </div>
      )}

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={3}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
