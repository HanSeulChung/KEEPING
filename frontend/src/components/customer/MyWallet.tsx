'use client'
import Image from 'next/image'
import { useState } from 'react'
import { PaymentModal } from '../ui/PaymentModal'

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
      className={`relative h-44 w-44 md:h-40 md:w-40 cursor-pointer border border-black transition-colors ${
        card.isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {/* 아쭈맛나 텍스트 */}
      <div className="absolute top-4 left-4 text-base md:text-sm font-normal text-black">
        {card.name}
      </div>

      {/* 01 텍스트 */}
      <div className="absolute top-4 right-4 text-sm md:text-xs font-normal text-black">
        {card.id.toString().padStart(2, '0')}
      </div>

      {/* 선 */}
      <div className="absolute top-12 right-4 left-4 h-px bg-black"></div>

      {/* 금액 */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 text-base md:text-sm font-extrabold text-black">
        {card.amount.toLocaleString()}원
      </div>

      {/* 결제하기 버튼 */}
      <div className="absolute top-32 md:top-28 left-1/2 -translate-x-1/2">
        <div className="flex h-6 w-16 md:h-5 md:w-15 items-center justify-center border-2 border-blue-500 bg-white">
          <span className="text-sm md:text-xs font-bold text-blue-500">결제하기</span>
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

// 충전 옵션 아이템 컴포넌트
interface ChargeOptionProps {
  discount: string
  points: string
  isSelected?: boolean
  onClick?: () => void
}

const ChargeOption = ({
  discount,
  points,
  isSelected = false,
  onClick,
}: ChargeOptionProps) => {
  return (
    <div
      className={`flex h-16 md:h-[59px] w-full cursor-pointer items-center justify-between border border-black px-5 transition-colors ${
        isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-yellow-50'
      }`}
      onClick={onClick}
    >
      <span className="text-base md:text-sm font-bold text-red-500">{discount}</span>
      <span className="text-base md:text-sm font-bold text-black">{points}</span>
    </div>
  )
}

// 환불 섹션 컴포넌트
const RefundSection = () => {
  return (
    <div className="w-full">
      <p className="mb-6 text-lg md:text-[15px] font-bold text-black">
        "아쭈맛나" 포인트 환불받기
      </p>
      
      <div className="mb-6 flex items-center gap-4">
        <p className="text-base md:text-sm font-bold text-black">
          환불 가능 금액
        </p>
        <div className="relative">
          <Image
            src="/wallet/inputbox.svg"
            alt="입력 박스"
            width={165}
            height={31}
            className="w-[165px] h-[31px]"
          />
          <p className="absolute left-[60px] top-[6px] text-sm md:text-[11px] font-bold text-black">
            35,000 원
          </p>
        </div>
      </div>
      
      <button className="flex h-14 md:h-12 w-full items-center justify-center border border-black bg-black">
        <span className="text-base md:text-sm font-bold text-white">환불받기</span>
      </button>
    </div>
  )
}

// 충전 섹션 컴포넌트
const ChargeSection = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  
  const chargeOptions = [
    { discount: '5% 할인', points: '50,000 포인트', originalPrice: 50000, discountRate: 0.05 },
    { discount: '5% 할인', points: '100,000 포인트', originalPrice: 100000, discountRate: 0.05 },
    { discount: '5% 할인', points: '150,000 포인트', originalPrice: 150000, discountRate: 0.05 },
    { discount: '5% 할인', points: '200,000 포인트', originalPrice: 200000, discountRate: 0.05 },
    { discount: '5% 할인', points: '250,000 포인트', originalPrice: 250000, discountRate: 0.05 },
  ]

  // 선택된 옵션의 결제 금액 계산
  const calculatePaymentAmount = () => {
    if (selectedIndex === null) return 0
    const selectedOption = chargeOptions[selectedIndex]
    return Math.round(selectedOption.originalPrice * (1 - selectedOption.discountRate))
  }

  const paymentAmount = calculatePaymentAmount()

  return (
    <div className="w-full">
      {/* 충전 옵션들 */}
      <div className="mb-6 space-y-2">
        {chargeOptions.map((option, index) => (
          <ChargeOption
            key={index}
            discount={option.discount}
            points={option.points}
            isSelected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {/* 결제 금액 */}
      <div className="mb-6">
        <span className="text-base md:text-sm font-bold text-black">
          결제 금액: {paymentAmount > 0 ? `${paymentAmount.toLocaleString()}원` : '옵션을 선택해주세요'}
        </span>
      </div>

      {/* 충전하기 버튼 */}
      <button 
        className="flex h-14 md:h-12 w-full items-center justify-center border border-black bg-black"
        onClick={() => {
          if (selectedIndex !== null) {
            setIsPaymentModalOpen(true)
          }
        }}
        disabled={selectedIndex === null}
      >
        <span className="text-base md:text-sm font-bold text-white">충전하기</span>
      </button>

      {/* 결제 모달 */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={paymentAmount}
        onPayment={() => {
          console.log('결제 완료:', paymentAmount)
          // 결제 완료 후 로직
        }}
      />
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
    <div className="w-[382px] h-[55px] relative overflow-hidden">
      <div className="w-[30px] h-[30px]">
        <div className="w-[30px] h-[30px] absolute left-[141px] top-3 overflow-hidden rounded-[10px] border border-black flex items-center justify-center">
          <p className="text-[15px] font-bold text-black">1</p>
        </div>
      </div>
      <div className="w-[65px] h-[30px]">
        <div className="w-[30px] h-[30px] absolute left-[177px] top-3 overflow-hidden rounded-[10px] border border-black flex items-center justify-center">
          <p className="text-[15px] font-bold text-black">2</p>
        </div>
        <div className="w-[30px] h-[30px]">
          <div className="w-[30px] h-[30px] absolute left-[212px] top-3 overflow-hidden rounded-[10px] border border-black flex items-center justify-center">
            <p className="text-[15px] font-bold text-black">3</p>
          </div>
        </div>
      </div>
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
      <div className="mx-auto max-w-md">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-xl font-bold text-black" style={{ fontFamily: 'Tenada' }}>내 지갑</h1>
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
        <div className="relative mb-6 h-16 md:h-13 w-full">
          {Object.entries(TAB_CONFIG).map(([tabKey, tabLabel], index) => (
            <div key={tabKey} className="relative">
              <button
                onClick={() => setActiveTab(tabKey as keyof typeof TAB_CONFIG)}
                className={`absolute h-10 md:h-8 w-24 md:w-22 border border-black text-sm md:text-xs font-normal transition-colors ${
                  activeTab === tabKey
                    ? 'bg-[#efefef] text-black'
                    : 'bg-white text-black hover:bg-[#efefef]'
                }`}
                style={{
                  left: `${7 + index * 100}px`,
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
        <div className="mb-6">
          <ChargeSection />
        </div>
      )}

      {activeTab === 'refund' && (
        <div className="mb-6">
          <RefundSection />
        </div>
      )}

      {/* 페이지네이션 - 사용내역 탭에서만 표시 */}
      {activeTab === 'history' && (
        <div className="flex justify-center -ml-4">
          <Pagination
            currentPage={currentPage}
            totalPages={3}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      </div>
    </div>
  )
}
