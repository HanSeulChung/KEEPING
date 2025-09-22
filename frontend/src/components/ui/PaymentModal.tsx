'use client'
import { buildURL } from '@/api/config'
import { useUser } from '@/contexts/UserContext'
import { useEffect, useState } from 'react'

// 카드 정보 타입 정의
interface CreditCard {
  cardNo: string
  cvc: string
  cardUniqueNo: string
  cardIssuerCode: string
  cardIssuerName: string
  cardName: string
  baselinePerformance: string
  maxBenefitLimit: string
  cardDescription: string
  cardExpiryDate: string
  withdrawalAccountNo: string
  withdrawalDate: string
}

interface CreditCardListResponse {
  Header: {
    responseCode: string
    responseMessage: string
    apiName: string
    transmissionDate: string
    transmissionTime: string
    institutionCode: string
    apiKey: string
    apiServiceCode: string
    institutionTransactionUniqueNo: string
  }
  REC: CreditCard[]
}

interface AuthMeResponse {
  success: boolean
  status: number
  message: string
  data: {
    userId: number
    userKey: string
    role: string
    email: string
  }
  timestamp: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onPayment: () => void
  storeId: string
}

export const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  onPayment,
  storeId,
}: PaymentModalProps) => {
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsError, setCardsError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { user, loading, error } = useUser()

  // userKey 조회 함수
  const fetchUserKey = async (): Promise<string> => {
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

      const response = await fetch(buildURL('/auth/me'), {
        method: 'GET',
        headers,
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AuthMeResponse = await response.json()
      console.log('userKey 조회 응답:', data)

      if (data.success && data.data.userKey) {
        return data.data.userKey
      } else {
        throw new Error('userKey를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('userKey 조회 실패:', error)
      throw error
    }
  }

  // 카드 목록 조회 함수
  const fetchCreditCardList = async (userKey: string): Promise<CreditCard[]> => {
    try {
      // 현재 날짜와 시간 생성
      const now = new Date()
      // transmissionDate는 한국 시간 기준 (UTC+9)
      const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
      const transmissionDate = koreanTime.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
      // transmissionTime은 UTC 기준으로 유지
      const transmissionTime = now.toTimeString().slice(0, 8).replace(/:/g, '') // HHMMSS
      
      // institutionTransactionUniqueNo 생성 (YYYYMMDD + HHMMSS + 일련번호 6자리)
      const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      const institutionTransactionUniqueNo = transmissionDate + transmissionTime + randomNumber

      const requestBody = {
        Header: {
          apiName: "inquireSignUpCreditCardList",
          transmissionDate: transmissionDate,
          transmissionTime: transmissionTime,
          institutionCode: "00100",
          fintechAppNo: "001",
          apiServiceCode: "inquireSignUpCreditCardList",
          institutionTransactionUniqueNo: institutionTransactionUniqueNo,
          apiKey: "e17ca6be4bc44d4ead381bd9cbbd075a",
          userKey: userKey
        }
      }

      console.log('=== 카드 목록 조회 요청 ===')
      console.log('요청 URL:', 'https://finopenapi.ssafy.io/ssafy/api/v1/edu/creditCard/inquireSignUpCreditCardList')
      console.log('요청 메서드:', 'POST')
      console.log('요청 헤더:', {
        'Content-Type': 'application/json',
      })
      console.log('요청 본문:', requestBody)
      console.log('생성된 값들:', {
        transmissionDate,
        transmissionTime,
        institutionTransactionUniqueNo,
        userKey
      })

      const response = await fetch('https://finopenapi.ssafy.io/ssafy/api/v1/edu/creditCard/inquireSignUpCreditCardList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('카드 목록 조회 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CreditCardListResponse = await response.json()
      console.log('카드 목록 조회 응답 데이터:', data)

      if (data.Header.responseCode === 'H0000') {
        return data.REC || []
      } else {
        throw new Error(data.Header.responseMessage || '카드 목록 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('카드 목록 조회 실패:', error)
      throw error
    }
  }

  // 모달이 열릴 때 카드 목록 로드
  useEffect(() => {
    if (isOpen && creditCards.length === 0) {
      const loadCards = async () => {
        try {
          setCardsLoading(true)
          setCardsError(null)
          
          const userKey = await fetchUserKey()
          const cards = await fetchCreditCardList(userKey)
          setCreditCards(cards)
          
          // 첫 번째 카드를 기본 선택
          if (cards.length > 0) {
            setSelectedCard(cards[0])
          }
        } catch (error) {
          console.error('카드 목록 로드 실패:', error)
          setCardsError('카드 목록을 불러오는데 실패했습니다.')
        } finally {
          setCardsLoading(false)
        }
      }
      
      loadCards()
    }
  }, [isOpen, creditCards.length])

  if (!isOpen) return null

  // UUID 생성 함수 (표준 UUID v4 형식)
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
  }

  // 결제 처리 함수
  const handlePayment = async () => {
    if (isProcessing) return

    // 카드 선택 검증
    if (!selectedCard) {
      alert('카드를 선택해주세요.')
      return
    }

    setIsProcessing(true)

    try {
      // 로그인 상태 확인
      console.log('로그인 상태:', { user, loading, error })

      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      const requestBody = {
        cardNo: selectedCard.cardNo,
        cvc: selectedCard.cvc,
        paymentBalance: amount,
      }

      // 헤더 정보 생성 및 로그 출력
      const idempotencyKey = generateUUID()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      }

      // Authorization 헤더 추가
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      // API 요청
      const response = await fetch(
        buildURL(`/api/v1/stores/${storeId}/prepayment`),
        {
          method: 'POST',
          credentials: 'include',
          headers: headers,
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || '결제 처리 중 오류가 발생했습니다.'
        )
      }

      const result = await response.json()
      console.log('결제 성공:', result)

      // 성공 시 알림 표시
      alert('충전되었습니다.')
      
      // 성공 시 콜백 호출 및 모달 닫기
      onPayment()
      onClose()
    } catch (error) {
      console.error('결제 실패:', error)
      alert(
        error instanceof Error
          ? error.message
          : '결제 처리 중 오류가 발생했습니다.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div
        className="relative h-auto max-h-[90vh] w-full max-w-md overflow-hidden rounded-[10px] bg-white"
        style={{ boxShadow: '0px 4px 4px 0 rgba(0,0,0,0.25)' }}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between p-4">
          <div>
            <p className="mb-2 text-xl font-bold text-black">카드 결제</p>
            <p className="text-xs text-black">
              본인 명의의 카드 정보를 입력해주세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
            >
              <path
                d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="#1E1E1E"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 구분선 */}
        <div className="mx-4 h-px w-full bg-gray-300"></div>

        {/* 카드 선택 폼 */}
        <div className="space-y-6 p-4">
          {/* 카드 선택 */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-black">결제 카드 선택</p>
            {cardsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-gray-500">카드 목록을 불러오는 중...</div>
              </div>
            ) : cardsError ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-red-500">{cardsError}</div>
              </div>
            ) : creditCards.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-gray-500">등록된 카드가 없습니다.</div>
              </div>
            ) : (
              <select
                value={selectedCard?.cardNo || ''}
                onChange={(e) => {
                  const card = creditCards.find(c => c.cardNo === e.target.value)
                  setSelectedCard(card || null)
                }}
                className="h-12 w-full rounded-md border border-gray-300 bg-white p-3 text-base text-black outline-none"
              >
                {creditCards.map((card, index) => (
                  <option key={index} value={card.cardNo}>
                    {card.cardName} ({card.cardNo.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4')})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 선택된 카드 정보 표시 */}
          {selectedCard && (
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">카드명:</span>
                  <span className="text-sm font-medium text-black">{selectedCard.cardName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">발급사:</span>
                  <span className="text-sm font-medium text-black">{selectedCard.cardIssuerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">카드번호:</span>
                  <span className="text-sm font-medium text-black">
                    {selectedCard.cardNo.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4')}
                  </span>
                </div>
                {selectedCard.cardDescription && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">카드 혜택:</span>
                    <span className="text-sm font-medium text-black">{selectedCard.cardDescription}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 결제 버튼 */}
        <div className="p-4">
          <button
            onClick={handlePayment}
            disabled={isProcessing || !selectedCard || cardsLoading}
            className={`h-12 w-full rounded-md bg-black text-base font-bold text-white transition-colors ${
              isProcessing || !selectedCard || cardsLoading
                ? 'cursor-not-allowed bg-gray-400'
                : 'hover:bg-gray-800'
            }`}
          >
            {isProcessing ? '결제 처리 중...' : 
             cardsLoading ? '카드 목록 로딩 중...' :
             !selectedCard ? '카드를 선택해주세요' :
             '결제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
