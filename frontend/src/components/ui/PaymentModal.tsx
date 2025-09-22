'use client'
import { buildURL } from '@/api/config'
import { useUser } from '@/contexts/UserContext'
import { useState } from 'react'

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
  const [cardNumber, setCardNumber] = useState(['', '', '', ''])
  const [cvc, setCvc] = useState('')
  const [showCvc, setShowCvc] = useState(false)
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { user, loading, error } = useUser()

  if (!isOpen) return null

  const handleCardNumberChange = (index: number, value: string) => {
    const newCardNumber = [...cardNumber]
    newCardNumber[index] = value.replace(/\D/g, '').slice(0, 4)
    setCardNumber(newCardNumber)
  }

  const handleCvcChange = (value: string) => {
    setCvc(value.replace(/\D/g, '').slice(0, 3))
  }

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

    // 입력 검증
    const fullCardNumber = cardNumber.join('')
    if (fullCardNumber.length !== 16) {
      alert('카드번호를 16자리 모두 입력해주세요.')
      return
    }
    if (cvc.length !== 3) {
      alert('CVC를 3자리 입력해주세요.')
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
        cardNo: fullCardNumber,
        cvc: cvc,
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

        {/* 카드 정보 입력 폼 */}
        <div className="space-y-6 p-4">
          {/* 카드 번호 */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-black">카드 번호</p>
            <div className="relative">
              <div className="flex gap-2 rounded-md border border-gray-300 bg-white p-3 pr-12">
                {cardNumber.map((number, index) => (
                  <input
                    key={index}
                    type={showCardNumber ? 'text' : 'password'}
                    value={number}
                    onChange={e =>
                      handleCardNumberChange(index, e.target.value)
                    }
                    className="w-14 border-b border-black bg-transparent py-2 text-center text-base text-black outline-none"
                    maxLength={4}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowCardNumber(!showCardNumber)}
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
              >
                {showCardNumber ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* CVC */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-black">CVC</p>
            <div className="relative">
              <input
                type={showCvc ? 'text' : 'password'}
                value={cvc}
                onChange={e => handleCvcChange(e.target.value)}
                placeholder="3자리를 입력해주세요."
                className="h-12 w-full rounded-md border border-gray-300 bg-white p-3 pr-12 text-base text-black outline-none"
                maxLength={3}
              />
              <button
                type="button"
                onClick={() => setShowCvc(!showCvc)}
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
              >
                {showCvc ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 결제 버튼 */}
        <div className="p-4">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`h-12 w-full rounded-md bg-black text-base font-bold text-white transition-colors ${
              isProcessing
                ? 'cursor-not-allowed bg-gray-400'
                : 'hover:bg-gray-800'
            }`}
          >
            {isProcessing ? '결제 처리 중...' : '결제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
