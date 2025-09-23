'use client'
import { buildURL } from '@/api/config'
import { useUser } from '@/contexts/UserContext'
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

  const { user, loading, error } = useUser()

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

      console.log('카드 정보 조회 요청:', {
        url: buildURL('/customers/me/card'),
        method: 'POST',
        headers,
        credentials: 'include',
      })

      const response = await fetch(buildURL('/customers/me/card'), {
        method: 'POST',
        headers,
        credentials: 'include',
      })

      console.log(
        '카드 정보 조회 응답 상태:',
        response.status,
        response.statusText
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('카드 정보 조회 실패 - 응답 텍스트:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CreditCardResponse = await response.json()
      console.log('카드 정보 조회 응답 데이터:', data)

      if (data.success && data.data) {
        return data.data
      } else {
        throw new Error(data.message || '카드 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('카드 정보 조회 실패:', error)
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
          console.error('카드 정보 로드 실패:', error)
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

        {/* 카드 정보 표시 */}
        <div className="space-y-6 p-4">
          {cardsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">카드 정보를 불러오는 중...</div>
            </div>
          ) : cardsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{cardsError}</div>
            </div>
          ) : selectedCard ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">카드명:</span>
                  <span className="text-sm font-medium text-black">
                    {selectedCard.cardName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">카드번호:</span>
                  <span className="text-sm font-medium text-black">
                    {selectedCard.cardNo.replace(
                      /(\d{4})(\d{4})(\d{4})(\d{4})/,
                      '$1-****-****-$4'
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">등록된 카드가 없습니다.</div>
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
            {isProcessing
              ? '결제 처리 중...'
              : cardsLoading
                ? '카드 정보 로딩 중...'
                : !selectedCard
                  ? '카드 정보를 불러올 수 없습니다'
                  : '결제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
