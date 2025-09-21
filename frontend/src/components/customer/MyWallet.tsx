'use client'
import { buildURL } from '@/api/config'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { PaymentModal } from '../ui/PaymentModal'

// 타입 정의
interface WalletCard {
  id: number
  name: string
  amount: number
  isSelected?: boolean
  storeId?: number
  lastUpdatedAt?: string
}

interface Transaction {
  id: number
  type: 'charge' | 'usage'
  amount: number
  date: string
  transactionId?: number
  transactionType?: string
  transactionUniqueNo?: string
  createdAt?: string
}

// API 응답 타입
interface StoreBalance {
  storeId: number
  storeName: string
  remainingPoints: number
  lastUpdatedAt: string
}

interface WalletBalanceResponse {
  customerId: number
  walletId: number
  storeBalances: {
    content: StoreBalance[]
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    size: number
    number: number
    numberOfElements: number
    empty: boolean
  }
}

// 거래 내역 API 응답 타입
interface TransactionDetail {
  transactionId: number
  transactionType: string
  amount: number
  transactionUniqueNo: string
  createdAt: string
}

interface WalletDetailResponse {
  storeId: number
  storeName: string
  currentBalance: number
  transactions: {
    content: TransactionDetail[]
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    size: number
    number: number
    numberOfElements: number
    empty: boolean
  }
}

// 충전 옵션 API 호출 함수 (StoreDetail과 동일)
const fetchChargeOptions = async (storeId: number): Promise<ChargeOptionData[]> => {
  try {
    const response = await fetch(buildURL(`/api/v1/stores/${storeId}/charge-bonus`), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    console.log('충전 옵션 API 응답:', responseData)

    // 응답 데이터에서 실제 데이터 추출
    let data = responseData
    if (responseData && responseData.data) {
      data = responseData.data
    }

    console.log('추출된 충전 옵션 데이터:', data)

    // 배열인지 확인
    if (Array.isArray(data)) {
      return data
    } else {
      console.warn('충전 옵션 데이터가 배열이 아닙니다:', data)
      return []
    }
  } catch (error) {
    console.error('충전 옵션 조회 실패:', error)
    // 에러 발생 시 더미 데이터 반환
    return [
      { chargeAmount: 10000, bonusPercentage: 5, expectedTotalPoints: 10500 },
      { chargeAmount: 25000, bonusPercentage: 4, expectedTotalPoints: 26000 },
      { chargeAmount: 50000, bonusPercentage: 3, expectedTotalPoints: 51500 },
    ]
  }
}

// 거래 내역 API 호출 함수
const fetchWalletTransactions = async (groupId: number, storeId: number): Promise<Transaction[]> => {
  try {
    const response = await fetch(buildURL(`/wallets/individual/stores/${storeId}/detail`), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('거래 내역 API 응답:', result)

    // API 응답 데이터를 Transaction 형식으로 변환
    const transactions: Transaction[] = result.data.transactions.content.map((transaction: TransactionDetail, index: number) => ({
      id: index + 1,
      type: transaction.transactionType.includes('CHARGE') || transaction.transactionType.includes('충전') ? 'charge' : 'usage',
      amount: transaction.amount,
      date: new Date(transaction.createdAt).toLocaleDateString('ko-KR'),
      transactionId: transaction.transactionId,
      transactionType: transaction.transactionType,
      transactionUniqueNo: transaction.transactionUniqueNo,
      createdAt: transaction.createdAt,
    }))

    return transactions
  } catch (error) {
    console.error('거래 내역 조회 실패:', error)
    // 에러 발생 시 더미 데이터 반환
    return [
      { id: 1, type: 'charge', amount: 35000, date: '2025-09-01' },
      { id: 2, type: 'usage', amount: 12000, date: '2025-09-07' },
    ]
  }
}

// API 호출 함수
const fetchWalletBalance = async (): Promise<WalletCard[]> => {
  try {
    const response = await fetch(buildURL('/wallets/individual/balance'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('지갑 잔액 API 응답:', result)

    // API 응답 데이터를 WalletCard 형식으로 변환
    const walletCards: WalletCard[] = result.data.storeBalances.content.map((storeBalance: StoreBalance, index: number) => ({
      id: index + 1,
      name: storeBalance.storeName,
      amount: storeBalance.remainingPoints,
      storeId: storeBalance.storeId,
      lastUpdatedAt: storeBalance.lastUpdatedAt,
      isSelected: index === 0, // 첫 번째 카드를 기본 선택으로 설정
    }))

    return walletCards
  } catch (error) {
    console.error('지갑 잔액 조회 실패:', error)
    // 에러 발생 시 더미 데이터 반환
    return [
      { id: 1, name: '아쭈맛나', amount: 35000, isSelected: true },
    ]
  }
}

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

// 충전 옵션 데이터 타입 (StoreDetail과 동일)
interface ChargeOptionData {
  chargeAmount: number
  bonusPercentage: number
  expectedTotalPoints: number
}

// 충전 옵션 아이템 컴포넌트 (StoreDetail과 동일)
interface ChargeOptionProps extends ChargeOptionData {
  isSelected?: boolean
  onClick?: () => void
}

const ChargeOption = ({
  chargeAmount,
  bonusPercentage,
  expectedTotalPoints,
  isSelected = false,
  onClick,
}: ChargeOptionProps) => {
  return (
    <div
      className={`flex h-16 md:h-14 w-full cursor-pointer items-center justify-between border border-black px-5 transition-colors ${
        isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-yellow-50'
      }`}
      onClick={onClick}
    >
      <span className="text-base md:text-sm font-bold text-red-500">{bonusPercentage}% 보너스</span>
      <span className="text-base md:text-sm font-bold text-black">{chargeAmount.toLocaleString()}원</span>
    </div>
  )
}

// 환불 섹션 컴포넌트
const RefundSection = ({ selectedCard }: { selectedCard: WalletCard }) => {
  return (
    <div className="w-full">
      <p className="mb-6 text-lg md:text-[15px] font-bold text-black">
        "{selectedCard.name}" 포인트 환불받기
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
            {selectedCard.amount.toLocaleString()} 원
          </p>
        </div>
      </div>
      
      <button className="flex h-14 md:h-12 w-full items-center justify-center border border-black bg-black">
        <span className="text-base md:text-sm font-bold text-white">환불받기</span>
      </button>
    </div>
  )
}

// 충전 섹션 컴포넌트 (StoreDetail과 동일)
const ChargeSection = ({
  chargeOptions,
  storeId,
}: {
  chargeOptions: ChargeOptionData[]
  storeId: string
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // 결제 금액 계산 (할인 없음, chargeAmount 그대로)
  // 예: chargeAmount=25000 → 결제금액 = 25000원
  const calculatePaymentAmount = () => {
    if (selectedIndex === null || !chargeOptions[selectedIndex]) return 0
    const selectedOption = chargeOptions[selectedIndex]
    return selectedOption.chargeAmount || 0
  }

  // 충전 금액 계산 (보너스 포함)
  // 예: chargeAmount=25000, bonusPercentage=4% → 충전금액 = 25000 + (25000 * 0.04) = 26000원
  const calculateChargeAmount = () => {
    if (selectedIndex === null || !chargeOptions[selectedIndex]) return 0
    const selectedOption = chargeOptions[selectedIndex]

    const originalAmount = selectedOption.chargeAmount || 0
    const bonusAmount = originalAmount * (selectedOption.bonusPercentage / 100)
    return originalAmount + bonusAmount
  }

  const paymentAmount = calculatePaymentAmount()
  const chargeAmount = calculateChargeAmount()

  return (
    <div className="mx-auto w-full max-w-md">
      {/* 충전 옵션들 */}
      <div className="mb-6 space-y-2">
        {chargeOptions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            충전 옵션을 불러오는 중...
          </div>
        ) : (
          chargeOptions.map((option, index) => (
            <ChargeOption
              key={index}
              chargeAmount={option.chargeAmount}
              bonusPercentage={option.bonusPercentage}
              expectedTotalPoints={option.expectedTotalPoints}
              isSelected={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
            />
          ))
        )}
      </div>

      {/* 결제 금액 */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <div className="mb-1 text-sm text-gray-600">결제 금액</div>
        <div className="text-xl font-bold text-black">
          {paymentAmount > 0
            ? `${paymentAmount.toLocaleString()}원`
            : '옵션을 선택해주세요'}
        </div>
        {chargeAmount > 0 && (
          <div className="mt-2 text-sm font-medium text-blue-600">
            충전 금액: {chargeAmount.toLocaleString()}원
          </div>
        )}
      </div>

      {/* 충전하기 버튼 */}
      <button
        className={`flex h-14 w-full items-center justify-center border border-black transition-colors ${
          selectedIndex !== null
            ? 'bg-black hover:bg-gray-800'
            : 'cursor-not-allowed bg-gray-300'
        }`}
        disabled={selectedIndex === null}
        onClick={() => {
          if (selectedIndex !== null) {
            setIsPaymentModalOpen(true)
          }
        }}
      >
        <span
          className={`text-sm font-bold ${
            selectedIndex !== null ? 'text-white' : 'text-gray-500'
          }`}
        >
          충전하기
        </span>
      </button>

      {/* 결제 모달 */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={paymentAmount}
        storeId={storeId}
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
  const [walletCards, setWalletCards] = useState<WalletCard[]>([])
  const [selectedCard, setSelectedCard] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<keyof typeof TAB_CONFIG>('history')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 거래 내역 관련 상태
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)
  
  // 충전 옵션 관련 상태
  const [chargeOptions, setChargeOptions] = useState<ChargeOptionData[]>([])
  const [chargeOptionsLoading, setChargeOptionsLoading] = useState(false)
  const [chargeOptionsError, setChargeOptionsError] = useState<string | null>(null)

  // API 호출하여 지갑 데이터 가져오기
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setLoading(true)
        setError(null)
        const cards = await fetchWalletBalance()
        setWalletCards(cards)
        if (cards.length > 0) {
          setSelectedCard(cards[0].id) // 첫 번째 카드를 기본 선택
        }
      } catch (err) {
        console.error('지갑 데이터 로드 실패:', err)
        setError('지갑 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadWalletData()
  }, [])

  // 카드가 로드되고 선택된 카드가 있을 때 데이터 자동 로드
  useEffect(() => {
    if (walletCards.length > 0) {
      const selectedCardData = walletCards.find(card => card.id === selectedCard)
      if (selectedCardData?.storeId) {
        if (activeTab === 'history') {
          loadTransactions(selectedCardData.storeId)
        } else if (activeTab === 'charge') {
          loadChargeOptions(selectedCardData.storeId)
        }
      }
    }
  }, [walletCards, selectedCard, activeTab])

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId)
  }

  // 거래 내역 로드 함수
  const loadTransactions = async (storeId: number) => {
    try {
      setTransactionsLoading(true)
      setTransactionsError(null)
      
      // 임시로 groupId를 1로 설정 (실제로는 사용자의 그룹 ID를 가져와야 함)
      const groupId = 1
      const transactionData = await fetchWalletTransactions(groupId, storeId)
      setTransactions(transactionData)
    } catch (err) {
      console.error('거래 내역 로드 실패:', err)
      setTransactionsError('거래 내역을 불러오는데 실패했습니다.')
    } finally {
      setTransactionsLoading(false)
    }
  }

  // 충전 옵션 로드 함수
  const loadChargeOptions = async (storeId: number) => {
    try {
      setChargeOptionsLoading(true)
      setChargeOptionsError(null)
      
      const chargeData = await fetchChargeOptions(storeId)
      setChargeOptions(chargeData)
    } catch (err) {
      console.error('충전 옵션 로드 실패:', err)
      setChargeOptionsError('충전 옵션을 불러오는데 실패했습니다.')
    } finally {
      setChargeOptionsLoading(false)
    }
  }

  // 탭 클릭 시 데이터 로드
  const handleTabChange = (tabKey: keyof typeof TAB_CONFIG) => {
    setActiveTab(tabKey)
    
    const selectedCardData = walletCards.find(card => card.id === selectedCard)
    if (selectedCardData?.storeId) {
      if (tabKey === 'history') {
        loadTransactions(selectedCardData.storeId)
      } else if (tabKey === 'charge') {
        loadChargeOptions(selectedCardData.storeId)
      }
    }
  }

  const cardsWithSelection = walletCards.map(card => ({
    ...card,
    isSelected: card.id === selectedCard,
  }))

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="mx-auto max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl md:text-xl font-bold text-black" style={{ fontFamily: 'Tenada' }}>내 지갑</h1>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">지갑 정보를 불러오는 중...</div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="mx-auto max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl md:text-xl font-bold text-black" style={{ fontFamily: 'Tenada' }}>내 지갑</h1>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  // 카드가 없는 경우 처리
  if (cardsWithSelection.length === 0) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="mx-auto max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl md:text-xl font-bold text-black" style={{ fontFamily: 'Tenada' }}>내 지갑</h1>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">등록된 지갑이 없습니다.</div>
          </div>
        </div>
      </div>
    )
  }

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
                onClick={() => handleTabChange(tabKey as keyof typeof TAB_CONFIG)}
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
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">거래 내역을 불러오는 중...</div>
            </div>
          ) : transactionsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{transactionsError}</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">거래 내역이 없습니다.</div>
            </div>
          ) : (
            transactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>
      )}

      {activeTab === 'charge' && (
        <div className="mb-6">
          {chargeOptionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">충전 옵션을 불러오는 중...</div>
            </div>
          ) : chargeOptionsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{chargeOptionsError}</div>
            </div>
          ) : (
            <ChargeSection 
              chargeOptions={chargeOptions} 
              storeId={cardsWithSelection.find(card => card.isSelected)?.storeId?.toString() || '0'} 
            />
          )}
        </div>
      )}

      {activeTab === 'refund' && (
        <div className="mb-6">
          <RefundSection selectedCard={cardsWithSelection.find(card => card.isSelected) || cardsWithSelection[0]} />
        </div>
      )}
      </div>
    </div>
  )
}
