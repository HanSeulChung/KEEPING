'use client'
import { buildURL } from '@/api/config'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect, useState } from 'react'

// 카드 정보 타입 정의
interface CreditCard {
  cardNo: string
  cvc: string
  cardName: string
}

interface CreditCardResponse {
  success: boolean
  status: number
  message: string
  data: CreditCard
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
  const [creditCard, setCreditCard] = useState<CreditCard | null>(null)
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsError, setCardsError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaymentComplete, setIsPaymentComplete] = useState(false)

  const { user, loading, error } = useAuthStore()

  // 카드 정보 조회 함수
  const fetchCreditCard = async (): Promise<CreditCard> => {
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

      const response = await fetch(buildURL('/customers/me/card'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CreditCardResponse = await response.json()

      if (data.success && data.data) {
        return data.data
      } else {
        throw new Error(data.message || '카드 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      throw error
    }
  }

  // 모달이 열릴 때 카드 정보 로드
  useEffect(() => {
    if (isOpen && !creditCard) {
      const loadCard = async () => {
        try {
          setCardsLoading(true)
          setCardsError(null)

          const card = await fetchCreditCard()
          setCreditCard(card)
          setSelectedCard(card)
        } catch (error) {
          setCardsError('카드 정보를 불러오는데 실패했습니다.')
        } finally {
          setCardsLoading(false)
        }
      }

      loadCard()
    }
  }, [isOpen, creditCard])

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

      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      const requestBody = {
        cardNo: selectedCard.cardNo,
        cvc: selectedCard.cvc,
        paymentBalance: amount,
      }

      const sessionKey = `payment_${storeId}_${amount}_${selectedCard.cardNo}`
      let idempotencyKey = sessionStorage.getItem(sessionKey)
      if (!idempotencyKey) {
        idempotencyKey = generateUUID()
        sessionStorage.setItem(sessionKey, idempotencyKey)
      }

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

      // 성공 시 결제 완료 상태로 변경
      setIsPaymentComplete(true)
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '결제 처리 중 오류가 발생했습니다.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // 결제 완료 화면
  if (isPaymentComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative h-[147px] w-[412px] rounded-[30px] bg-[#fbf9f5]">
          {/* 닫기 버튼 */}
          <div className="flex items-center justify-end pt-[25px] pr-[29px] pb-[86px] pl-[347px]">
            <button
              onClick={() => {
                setIsPaymentComplete(false)
                onPayment()
                onClose()
              }}
              className="flex items-center justify-center"
            >
              <svg
                width={36}
                height={36}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z"
                  stroke="#FFC800"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* 결제 완료 메시지 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center">
            <div className="font-jalnan mb-4 text-xl leading-[140%] whitespace-nowrap text-[#ffc800]">
              결제가 완료되었습니다!
            </div>

            {/* 포인트 확인 버튼 */}
            <button
              onClick={() => {
                setIsPaymentComplete(false)
                onPayment()
                onClose()
                // 포인트 확인 페이지로 이동
                window.location.href = '/customer/myWallet'
              }}
              className="inline-flex items-center justify-center rounded-[10px] bg-[#fdda60] p-1 pr-[21px] pl-[22px]"
            >
              <div className="font-jalnan text-[15px] leading-[140%] text-white">
                포인트 확인하러 가기
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative h-[331px] w-[412px] rounded-[30px] bg-[#fbf9f5]">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6">
          <div className="font-jalnan text-xl leading-[140%] text-[#ffc800]">
            결제하기
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
          >
            <svg
              width={36}
              height={36}
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z"
                stroke="#FFC800"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 구분선 */}
        <div className="h-[3px] w-full bg-[#ffc800]" />

        {/* 카드 정보 표시 */}
        <div className="px-4 pt-6 pb-6">
          {cardsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">카드 정보를 불러오는 중...</div>
            </div>
          ) : cardsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{cardsError}</div>
            </div>
          ) : selectedCard ? (
            <div className="flex flex-col space-y-2 rounded-[10px] border-2 border-[#ccc] bg-white p-4">
              <div className="font-['Jalnan2TTF'] text-[15px] leading-[140%] font-bold text-black">
                {selectedCard.cardName}
              </div>
              <div className="font-['Jalnan2TTF'] text-[15px] leading-[140%] font-bold text-black">
                {selectedCard.cardNo.replace(
                  /(\d{4})(\d{4})(\d{4})(\d{4})/,
                  '$1 - $2 - $3 - $4'
                )}
              </div>
              <div className="font-['Jalnan2TTF'] text-[15px] leading-[140%] font-bold text-black">
                {selectedCard.cvc}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">등록된 카드가 없습니다.</div>
            </div>
          )}
        </div>

        {/* 결제 버튼 */}
        <div className="px-4 pb-6">
          <button
            onClick={handlePayment}
            disabled={isProcessing || !selectedCard || cardsLoading}
            className={`flex h-[45px] w-[380px] items-center justify-center rounded-[10px] px-0 pt-1 pb-1 transition-colors ${
              isProcessing || !selectedCard || cardsLoading
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-[#fdda60] hover:bg-[#f4d03f]'
            }`}
          >
            <span
              className={`font-jalnan text-lg font-bold ${
                isProcessing || !selectedCard || cardsLoading
                  ? 'text-gray-500'
                  : 'text-white'
              }`}
            >
              {isProcessing
                ? '결제 처리 중...'
                : cardsLoading
                  ? '카드 정보 로딩 중...'
                  : !selectedCard
                    ? '카드 정보를 불러올 수 없습니다'
                    : '결제하기'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
