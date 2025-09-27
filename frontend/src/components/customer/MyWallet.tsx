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
  type:
    | 'charge'
    | 'use'
    | 'transfer-in'
    | 'transfer-out'
    | 'cancel-charge'
    | 'cancel-use'
    | 'unknown'
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

// 결제 취소 관련 타입
interface CancelTransaction {
  transactionUniqueNo: string
  storeName: string
  paymentAmount: number
  transactionTime: string
  remainingBalance: number
}

interface CancelListResponse {
  success: boolean
  status: number
  message: string
  data: {
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    size: number
    content: CancelTransaction[]
    number: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    numberOfElements: number
    pageable: {
      offset: number
      sort: {
        empty: boolean
        sorted: boolean
        unsorted: boolean
      }
      paged: boolean
      pageSize: number
      pageNumber: number
      unpaged: boolean
    }
    empty: boolean
  }
  timestamp: string
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
const fetchChargeOptions = async (
  storeId: number
): Promise<ChargeOptionData[]> => {
  try {
    const response = await fetch(
      buildURL(`/api/v1/stores/${storeId}/charge-bonus`),
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

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

// 결제 취소 목록 조회 API 함수
const fetchCancelList = async (): Promise<CancelTransaction[]> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }
    }

    const url = buildURL('/api/v1/customers/cancel-list')
    console.log('결제 취소 목록 조회 URL:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    console.log(
      '결제 취소 목록 조회 응답 상태:',
      response.status,
      response.statusText
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: CancelListResponse = await response.json()
    console.log('결제 취소 목록 조회 응답 데이터:', data)

    if (data.success) {
      return data.data.content || []
    } else {
      throw new Error(data.message || '결제 취소 목록 조회에 실패했습니다.')
    }
  } catch (error) {
    console.error('결제 취소 목록 조회 실패:', error)
    throw error
  }
}

// 결제 취소 API 함수
const cancelPayment = async (
  transactionUniqueNo: string,
  cardNo: string,
  cvc: string
): Promise<boolean> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }
    }

    const url = buildURL('/api/v1/customers/payments/cancel')
    console.log('결제 취소 URL:', url)

    const requestBody = {
      transactionUniqueNo,
      cardNo,
      cvc,
    }

    console.log('결제 취소 요청:', {
      url,
      method: 'POST',
      headers,
      requestBody,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(requestBody),
    })

    console.log('결제 취소 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      let errorMessage = `결제 취소에 실패했습니다. (${response.status})`

      try {
        const errorData = await response.json()
        console.log('결제 취소 에러 응답:', errorData)
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        const errorText = await response.text()
        console.log('결제 취소 에러 텍스트:', errorText)
        if (errorText) {
          errorMessage = errorText
        }
      }

      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('결제 취소 성공 응답:', result)

    return true
  } catch (error) {
    console.error('결제 취소 실패:', error)
    throw error
  }
}

// 거래 내역 API 호출 함수
const fetchWalletTransactions = async (
  groupId: number,
  storeId: number
): Promise<Transaction[]> => {
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

    const response = await fetch(
      buildURL(`/wallets/individual/stores/${storeId}/detail`),
      {
        method: 'GET',
        credentials: 'include',
        headers,
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('거래 내역 API 응답:', result)

    // API 응답 데이터를 Transaction 형식으로 변환 (페이징 제거 대응)
    const transactionsData =
      result.data.transactions?.content || result.data.transactions || []
    const transactions: Transaction[] = transactionsData.map(
      (transaction: TransactionDetail, index: number) => ({
        id: index + 1,
        type: getTransactionDisplayInfo(transaction.transactionType)
          .type as Transaction['type'],
        amount: transaction.amount,
        date: new Date(transaction.createdAt).toLocaleDateString('ko-KR'),
        transactionId: transaction.transactionId,
        transactionType: transaction.transactionType,
        transactionUniqueNo: transaction.transactionUniqueNo,
        createdAt: transaction.createdAt,
      })
    )

    return transactions
  } catch (error) {
    console.error('거래 내역 조회 실패:', error)
    return []
  }
}

// API 호출 함수
const fetchWalletBalance = async (): Promise<WalletCard[]> => {
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

    const response = await fetch(buildURL('/wallets/individual/balance'), {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('지갑 잔액 API 응답:', result)

    // API 응답 데이터를 WalletCard 형식으로 변환 (페이징 제거 대응)
    const storeBalances =
      result.data.storeBalances?.content || result.data.storeBalances || []
    const walletCards: WalletCard[] = storeBalances.map(
      (storeBalance: StoreBalance, index: number) => ({
        id: index + 1,
        name: storeBalance.storeName,
        amount: storeBalance.remainingPoints,
        storeId: storeBalance.storeId,
        lastUpdatedAt: storeBalance.lastUpdatedAt,
        isSelected: index === 0, // 첫 번째 카드를 기본 선택으로 설정
      })
    )

    return walletCards
  } catch (error) {
    console.error('지갑 잔액 조회 실패:', error)
    // 에러 발생 시 더미 데이터 반환
    return [{ id: 1, name: '아쭈맛나', amount: 35000, isSelected: true }]
  }
}

const TAB_CONFIG = {
  history: '사용내역',
  charge: '충전',
  cancel: '결제취소',
} as const

// 거래 타입별 색상 및 라벨 정의
const getTransactionDisplayInfo = (transactionType: string) => {
  switch (transactionType) {
    case 'CHARGE':
      return { type: 'charge', label: '충전', color: 'blue' }
    case 'USE':
      return { type: 'use', label: '사용', color: 'red' }
    case 'TRANSFER_IN':
      return { type: 'transfer-in', label: '회수', color: 'purple' }
    case 'TRANSFER_OUT':
      return { type: 'transfer-out', label: '공유', color: 'green' }
    case 'CANCEL_CHARGE':
      return { type: 'cancel-charge', label: '충전취소', color: 'orange' }
    case 'CANCEL_USE':
      return { type: 'cancel-use', label: '사용취소', color: 'yellow' }
    default:
      return { type: 'unknown', label: '알 수 없음', color: 'gray' }
  }
}

// 거래 타입별 스타일 함수
const getTransactionTypeStyle = (type: string) => {
  switch (type) {
    case 'charge':
      return 'border-blue-500 text-blue-500'
    case 'use':
      return 'border-red-500 text-red-500'
    case 'transfer-in':
      return 'border-purple-500 text-purple-500'
    case 'transfer-out':
      return 'border-green-500 text-green-500'
    case 'cancel-charge':
      return 'border-orange-500 text-orange-500'
    case 'cancel-use':
      return 'border-yellow-500 text-yellow-500'
    default:
      return 'border-gray-500 text-gray-500'
  }
}

// 거래 타입별 라벨 함수
const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case 'charge':
      return '충전'
    case 'use':
      return '사용'
    case 'transfer-in':
      return '회수'
    case 'transfer-out':
      return '공유'
    case 'cancel-charge':
      return '충전취소'
    case 'cancel-use':
      return '사용취소'
    default:
      return '알 수 없음'
  }
}

// 지갑 카드 컴포넌트
const WalletCard = ({
  card,
  onClick,
}: {
  card: WalletCard
  onClick: () => void
}) => {
  const getCardColor = (index: number) => {
    const colors = ['#ff6f6f', '#ff8b68', '#ffd23c']
    return colors[index % colors.length]
  }

  const cardColor = getCardColor(card.id - 1)

  return (
    <div
      className={`inline-flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 pt-[21px] pr-[19px] pb-5 pl-[19px] transition-colors ${
        card.isSelected ? 'bg-white' : 'bg-white hover:bg-gray-50'
      }`}
      style={{
        borderColor: cardColor,
        backgroundColor: card.isSelected ? cardColor : 'white',
      }}
      onClick={onClick}
    >
      <div
        className="text-[15px] leading-[140%] font-extrabold"
        style={{ color: card.isSelected ? 'white' : cardColor }}
      >
        {card.name}
      </div>
      <div
        className="text-[15px] leading-[140%] font-extrabold"
        style={{ color: card.isSelected ? 'white' : cardColor }}
      >
        {card.amount.toLocaleString()} P
      </div>
    </div>
  )
}

// 거래 내역 아이템 컴포넌트
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'use':
        return '#ff6f6f'
      case 'charge':
        return '#6caeff'
      case 'transfer-in':
        return '#e174ff'
      case 'transfer-out':
        return '#a4e846'
      default:
        return '#ff6f6f'
    }
  }

  const transactionColor = getTransactionColor(transaction.type)

  return (
    <div className="mb-4 flex w-full items-center justify-between">
      {/* 거래 타입 라벨 */}
      <div
        className="inline-flex flex-col items-center justify-center rounded-[10px] border-[3px] pt-[11px] pr-2 pb-2 pl-[9px] text-white"
        style={{
          borderColor: transactionColor,
          backgroundColor: transactionColor,
        }}
      >
        <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold">
          {getTransactionTypeLabel(transaction.type)}
        </div>
      </div>

      {/* 금액 */}
      <div className="font-['NanumSquareRoundEB'] text-xl leading-[140%] font-extrabold text-gray-500">
        {transaction.amount.toLocaleString()}P
      </div>

      {/* 날짜 */}
      <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold text-[#ccc]">
        {transaction.date}
      </div>
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
      className={`flex h-16 w-full cursor-pointer items-center justify-between border border-black px-5 transition-colors md:h-14 ${
        isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-yellow-50'
      }`}
      onClick={onClick}
    >
      <span className="text-base font-bold text-red-500 md:text-sm">
        {bonusPercentage}% 보너스
      </span>
      <span className="text-base font-bold text-black md:text-sm">
        {chargeAmount.toLocaleString()}원
      </span>
    </div>
  )
}

// 환불 섹션 컴포넌트
const RefundSection = ({ selectedCard }: { selectedCard: WalletCard }) => {
  return (
    <div className="w-full">
      <p className="mb-6 text-lg font-bold text-black md:text-[15px]">
        "{selectedCard.name}" 포인트 환불받기
      </p>

      <div className="mb-6 flex items-center gap-4">
        <p className="text-base font-bold text-black md:text-sm">
          환불 가능 금액
        </p>
        <div className="relative">
          <Image
            src="/wallet/inputbox.svg"
            alt="입력 박스"
            width={165}
            height={31}
            className="h-[31px] w-[165px]"
          />
          <p className="absolute top-[6px] left-[60px] text-sm font-bold text-black md:text-[11px]">
            {selectedCard.amount.toLocaleString()} 원
          </p>
        </div>
      </div>

      <button className="flex h-14 w-full items-center justify-center border border-black bg-black md:h-12">
        <span className="text-base font-bold text-white md:text-sm">
          환불받기
        </span>
      </button>
    </div>
  )
}

// 충전 섹션 컴포넌트 (StoreDetail과 동일)
const ChargeSection = ({
  chargeOptions,
  storeId,
  storeName,
  cardColor,
}: {
  chargeOptions: ChargeOptionData[]
  storeId: string
  storeName: string
  cardColor: string
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
      {/* 제목 */}
      <div className="mb-6 text-left">
        <h2 className="font-['NanumSquareRoundEB'] text-2xl font-bold text-gray-600">
          <span style={{ color: cardColor }}>{storeName}</span>에 충전하기
        </h2>
      </div>

      {/* 충전 옵션들 */}
      <div className="mb-8 space-y-3">
        {chargeOptions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            충전 옵션을 불러오는 중...
          </div>
        ) : (
          chargeOptions.map((option, index) => (
            <div
              key={index}
              className={`flex h-20 w-full cursor-pointer items-center justify-between rounded-lg border-2 px-6 transition-colors ${
                selectedIndex === index
                  ? 'border-[#fdda60] bg-yellow-50'
                  : 'border-gray-300 bg-white hover:bg-yellow-50'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="font-['NanumSquareRoundEB'] text-lg font-bold text-[#fdda60]">
                {option.bonusPercentage}% 보너스
              </div>
              <div className="font-['NanumSquareRoundEB'] text-3xl font-bold text-black">
                {option.chargeAmount.toLocaleString()}원
              </div>
            </div>
          ))
        )}
      </div>

      {/* 결제 금액 */}
      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <div className="mb-3 font-['NanumSquareRoundEB'] text-lg font-bold text-gray-600">
          결제 금액
        </div>
        <div className="font-['NanumSquareRoundEB'] text-3xl font-bold text-black">
          {paymentAmount > 0
            ? `${paymentAmount.toLocaleString()}원`
            : '옵션을 선택해주세요'}
        </div>
        {chargeAmount > 0 && (
          <div className="mt-3 font-['NanumSquareRoundEB'] text-xl font-bold text-[#fdda60]">
            충전 금액: {chargeAmount.toLocaleString()}원
          </div>
        )}
      </div>

      {/* 충전하기 버튼 */}
      <button
        className={`mb-20 flex h-16 w-full items-center justify-center rounded-lg border-2 transition-colors ${
          selectedIndex !== null
            ? 'border-[#fdda60] bg-[#fdda60] hover:bg-[#f4d03f]'
            : 'cursor-not-allowed border-gray-300 bg-gray-300'
        }`}
        disabled={selectedIndex === null}
        onClick={() => {
          if (selectedIndex !== null) {
            setIsPaymentModalOpen(true)
          }
        }}
      >
        <span
          className={`font-['NanumSquareRoundEB'] text-2xl font-bold ${
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

// 결제 취소 섹션 컴포넌트
const CancelSection = ({
  cancelTransactions,
  cancelLoading,
  cancelError,
  onCancelClick,
}: {
  cancelTransactions: CancelTransaction[]
  cancelLoading: boolean
  cancelError: string | null
  onCancelClick: (transaction: CancelTransaction) => void
}) => {
  return (
    <div className="mx-auto w-full max-w-md">
      {cancelLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">결제 취소 목록을 불러오는 중...</div>
        </div>
      ) : cancelError ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">{cancelError}</div>
        </div>
      ) : cancelTransactions.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">취소 가능한 결제 내역이 없습니다.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {cancelTransactions.map((transaction, index) => (
            <div
              key={transaction.transactionUniqueNo}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="font-bold text-black">
                    {transaction.storeName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.transactionTime).toLocaleString(
                      'ko-KR'
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-black">
                    {transaction.paymentAmount.toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-500">
                    잔액: {transaction.remainingBalance.toLocaleString()}원
                  </div>
                </div>
              </div>
              <div className="mb-3 text-xs text-gray-400">
                거래번호: {transaction.transactionUniqueNo}
              </div>
              <button
                onClick={() => onCancelClick(transaction)}
                className="w-full rounded bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600"
              >
                결제 취소
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 결제 취소 모달 컴포넌트
const CancelModal = ({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  loading,
}: {
  isOpen: boolean
  onClose: () => void
  transaction: CancelTransaction | null
  onConfirm: (cardNo: string, cvc: string) => void
  loading: boolean
}) => {
  const [cardNo, setCardNo] = useState('')
  const [cvc, setCvc] = useState('')

  if (!isOpen || !transaction) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cardNo.trim() && cvc.trim()) {
      onConfirm(cardNo.trim(), cvc.trim())
    }
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-bold">결제 취소</h3>

        <div className="mb-4 rounded bg-gray-50 p-3">
          <div className="text-sm text-gray-600">취소할 결제 정보</div>
          <div className="font-bold">{transaction.storeName}</div>
          <div className="text-sm text-gray-500">
            금액: {transaction.paymentAmount.toLocaleString()}원
          </div>
          <div className="text-sm text-gray-500">
            결제일:{' '}
            {new Date(transaction.transactionTime).toLocaleString('ko-KR')}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              카드번호
            </label>
            <input
              type="text"
              value={cardNo}
              onChange={e => setCardNo(e.target.value)}
              placeholder="카드번호를 입력하세요"
              className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading}
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              CVC
            </label>
            <input
              type="text"
              value={cvc}
              onChange={e => setCvc(e.target.value)}
              placeholder="CVC를 입력하세요"
              className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-red-500 px-4 py-3 text-white transition-colors hover:bg-red-600 disabled:bg-gray-400"
              disabled={loading || !cardNo.trim() || !cvc.trim()}
            >
              {loading ? '처리 중...' : '결제 취소'}
            </button>
          </div>
        </form>
      </div>
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
    <div className="relative h-[55px] w-[382px] overflow-hidden">
      <div className="h-[30px] w-[30px]">
        <div className="absolute top-3 left-[141px] flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-[10px] border border-black">
          <p className="text-[15px] font-bold text-black">1</p>
        </div>
      </div>
      <div className="h-[30px] w-[65px]">
        <div className="absolute top-3 left-[177px] flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-[10px] border border-black">
          <p className="text-[15px] font-bold text-black">2</p>
        </div>
        <div className="h-[30px] w-[30px]">
          <div className="absolute top-3 left-[212px] flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-[10px] border border-black">
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
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  )

  // 충전 옵션 관련 상태
  const [chargeOptions, setChargeOptions] = useState<ChargeOptionData[]>([])
  const [chargeOptionsLoading, setChargeOptionsLoading] = useState(false)
  const [chargeOptionsError, setChargeOptionsError] = useState<string | null>(
    null
  )

  // 결제 취소 관련 상태
  const [cancelTransactions, setCancelTransactions] = useState<
    CancelTransaction[]
  >([])
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  // 결제 취소 모달 관련 상태
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<CancelTransaction | null>(null)
  const [cardNo, setCardNo] = useState('')
  const [cvc, setCvc] = useState('')
  const [cancelProcessing, setCancelProcessing] = useState(false)

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
      const selectedCardData = walletCards.find(
        card => card.id === selectedCard
      )
      if (selectedCardData?.storeId) {
        if (activeTab === 'history') {
          loadTransactions(selectedCardData.storeId)
        } else if (activeTab === 'charge') {
          loadChargeOptions(selectedCardData.storeId)
        } else if (activeTab === 'cancel') {
          loadCancelList()
        }
      }
    }
  }, [walletCards, selectedCard, activeTab])

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId)
    // 카드 선택 시 사용내역 탭으로 자동 전환
    setActiveTab('history')
  }

  // 결제 취소 목록 로드 함수
  const loadCancelList = async () => {
    try {
      setCancelLoading(true)
      setCancelError(null)

      const cancelData = await fetchCancelList()
      setCancelTransactions(cancelData)
    } catch (err) {
      console.error('결제 취소 목록 로드 실패:', err)
      setCancelError('결제 취소 목록을 불러오는데 실패했습니다.')
    } finally {
      setCancelLoading(false)
    }
  }

  // 결제 취소 확인 함수
  const handleCancelConfirm = async (cardNo: string, cvc: string) => {
    if (!selectedTransaction) return

    try {
      setCancelProcessing(true)

      await cancelPayment(selectedTransaction.transactionUniqueNo, cardNo, cvc)

      alert('결제가 성공적으로 취소되었습니다.')

      // 모달 닫기 및 목록 새로고침
      setIsCancelModalOpen(false)
      setSelectedTransaction(null)
      setCardNo('')
      setCvc('')

      // 결제 취소 목록 새로고침
      loadCancelList()
    } catch (error) {
      console.error('결제 취소 실패:', error)
      alert(
        error instanceof Error
          ? error.message
          : '결제 취소 중 오류가 발생했습니다.'
      )
    } finally {
      setCancelProcessing(false)
    }
  }

  // 탭 변경 함수
  const handleTabChange = (tabKey: keyof typeof TAB_CONFIG) => {
    setActiveTab(tabKey)
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
            <h1
              className="text-2xl font-bold text-black md:text-xl"
              style={{ fontFamily: 'Tenada' }}
            >
              내 지갑
            </h1>
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
            <h1
              className="text-2xl font-bold text-black md:text-xl"
              style={{ fontFamily: 'Tenada' }}
            >
              내 지갑
            </h1>
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
            <h1
              className="text-2xl font-bold text-black md:text-xl"
              style={{ fontFamily: 'Tenada' }}
            >
              내 지갑
            </h1>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">
              {' '}
              등록된 카드가 없습니다. 가게 목록에서 포인트를 충전해보세요!
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="flex w-full items-center bg-[#fddb5f] px-4 py-3">
        <svg
          width={24}
          height={24}
          viewBox="0 0 35 33"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.4997 15.5002C15.8955 15.5002 14.5222 14.929 13.3799 13.7866C12.2375 12.6443 11.6663 11.271 11.6663 9.66683C11.6663 8.06266 12.2375 6.6894 13.3799 5.54704C14.5222 4.40468 15.8955 3.8335 17.4997 3.8335C19.1038 3.8335 20.4771 4.40468 21.6195 5.54704C22.7618 6.6894 23.333 8.06266 23.333 9.66683C23.333 11.271 22.7618 12.6443 21.6195 13.7866C20.4771 14.929 19.1038 15.5002 17.4997 15.5002ZM5.83301 27.1668V23.0835C5.83301 22.2571 6.04568 21.4976 6.47103 20.8048C6.89638 20.1121 7.46148 19.5835 8.16634 19.2189C9.67329 18.4654 11.2045 17.9003 12.7601 17.5236C14.3156 17.1469 15.8955 16.9585 17.4997 16.9585C19.1038 16.9585 20.6837 17.1469 22.2393 17.5236C23.7948 17.9003 25.3261 18.4654 26.833 19.2189C27.5379 19.5835 28.103 20.1121 28.5283 20.8048C28.9537 21.4976 29.1663 22.2571 29.1663 23.0835V27.1668H5.83301ZM8.74967 24.2502H26.2497V23.0835C26.2497 22.8161 26.1828 22.5731 26.0492 22.3543C25.9155 22.1356 25.7393 21.9654 25.5205 21.8439C24.208 21.1877 22.8834 20.6955 21.5465 20.3674C20.2097 20.0392 18.8608 19.8752 17.4997 19.8752C16.1386 19.8752 14.7896 20.0392 13.4528 20.3674C12.116 20.6955 10.7913 21.1877 9.47884 21.8439C9.26009 21.9654 9.08388 22.1356 8.9502 22.3543C8.81651 22.5731 8.74967 22.8161 8.74967 23.0835V24.2502ZM17.4997 12.5835C18.3018 12.5835 18.9884 12.2979 19.5596 11.7267C20.1308 11.1555 20.4163 10.4689 20.4163 9.66683C20.4163 8.86475 20.1308 8.17811 19.5596 7.60693C18.9884 7.03575 18.3018 6.75016 17.4997 6.75016C16.6976 6.75016 16.011 7.03575 15.4398 7.60693C14.8686 8.17811 14.583 8.86475 14.583 9.66683C14.583 10.4689 14.8686 11.1555 15.4398 11.7267C16.011 12.2979 16.6976 12.5835 17.4997 12.5835Z"
            fill="white"
          />
        </svg>
        <div className="ml-2 font-['Jalnan2TTF'] text-lg leading-[140%] text-white">
          내 지갑
        </div>
      </div>

      {/* 지갑 카드 캐러셀 */}
      <div className="px-4 py-6">
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
      <div className="mb-6 px-4">
        <div className="flex w-52 items-start">
          <button
            onClick={() => handleTabChange('history')}
            className={`flex items-center justify-center rounded-tl-lg rounded-tr-lg px-3 py-1 ${
              activeTab === 'history'
                ? 'bg-[#fdda60] text-white'
                : 'border-t border-r border-b border-l border-[#fdda60] bg-white text-[#fdda60]'
            }`}
          >
            <div className="font-['Jalnan2TTF'] text-xl leading-[140%]">
              사용내역
            </div>
          </button>
          <button
            onClick={() => handleTabChange('charge')}
            className={`flex w-[104px] items-center justify-center rounded-tl-lg rounded-tr-lg px-3 py-1 ${
              activeTab === 'charge'
                ? 'bg-[#fdda60] text-white'
                : 'border-t border-r border-b border-l border-[#fdda60] bg-white text-[#fdda60]'
            }`}
          >
            <div className="font-['Jalnan2TTF'] text-xl leading-[140%]">
              충전하기
            </div>
          </button>
        </div>
      </div>

      {/* 탭 내용 */}
      {activeTab === 'history' && (
        <div className="mb-6 px-4">
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
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <TransactionItem transaction={transaction} />
                  {index < transactions.length - 1 && (
                    <div className="my-2 h-[3px] w-full bg-neutral-100" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'charge' && (
        <div className="mb-6 px-4">
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
              storeId={
                cardsWithSelection
                  .find(card => card.isSelected)
                  ?.storeId?.toString() || '0'
              }
              storeName={
                cardsWithSelection.find(card => card.isSelected)?.name || '가게'
              }
              cardColor={(() => {
                const selectedCard = cardsWithSelection.find(
                  card => card.isSelected
                )
                if (!selectedCard) return '#ff6f6f'
                const colors = ['#ff6f6f', '#ff8b68', '#ffd23c']
                return colors[(selectedCard.id - 1) % colors.length]
              })()}
            />
          )}
        </div>
      )}

      {activeTab === 'cancel' && (
        <div className="mb-6 px-4">
          <CancelSection
            cancelTransactions={cancelTransactions}
            cancelLoading={cancelLoading}
            cancelError={cancelError}
            onCancelClick={transaction => {
              setSelectedTransaction(transaction)
              setIsCancelModalOpen(true)
            }}
          />
        </div>
      )}

      {/* 결제 취소 모달 */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false)
          setSelectedTransaction(null)
          setCardNo('')
          setCvc('')
        }}
        transaction={selectedTransaction}
        onConfirm={handleCancelConfirm}
        loading={cancelProcessing}
      />
    </div>
  )
}
