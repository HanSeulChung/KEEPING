'use client'

import { notificationApi } from '@/api/notificationApi'
import { useEffect, useState } from 'react'

interface PaymentApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  intentPublicId?: string // intentPublicId로 변경
  intentId?: string | number // 기존 호환성 유지
  storeName?: string
  amount?: string | number
  customerName?: string
  pointInfo?: {
    currentPoints?: number
    usedPoints?: number
    remainingPoints?: number
  }
  paymentType?: 'PAYMENT' | 'CANCEL'
  onSuccess?: () => void
}

interface PaymentDetails {
  intentId: string
  storeName: string
  customerName: string
  totalAmount: number
  items: Array<{
    menuName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  pointInfo?: {
    currentPoints?: number
    usedPoints?: number
    remainingPoints?: number
  }
}

export default function PaymentApprovalModal({
  isOpen,
  onClose,
  intentPublicId,
  intentId,
  storeName,
  amount,
  customerName,
  pointInfo,
  paymentType = 'PAYMENT',
  onSuccess,
}: PaymentApprovalModalProps) {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  )
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) // 중복 요청 방지
  const [processedKeys, setProcessedKeys] = useState<Set<string>>(new Set()) // 처리된 키 추적

  // intent 식별 키 생성 (publicId 우선, 없으면 intentId)
  const getIntentKey = () => {
    const key = intentPublicId || paymentDetails?.intentId || intentId
    return key ? String(key) : ''
  }

  // 결제 상세 정보 조회
  useEffect(() => {
    if (isOpen && intentPublicId) {
      setIsLoadingDetails(true)
      setError('')

      notificationApi.customer
        .getPaymentIntent(intentPublicId)
        .then(details => {
          if (details) {
            setPaymentDetails(details)
          } else {
            setError('결제 정보를 불러올 수 없습니다')
          }
        })
        .catch(error => {
          console.error('결제 상세 정보 조회 실패:', error)
          setError('결제 정보를 불러오는 중 오류가 발생했습니다')
        })
        .finally(() => {
          setIsLoadingDetails(false)
        })
    }
  }, [isOpen, intentPublicId])

  // 이미 승인된 결제인지 확인하여 재입력 방지
  useEffect(() => {
    if (!isOpen) return
    const key = getIntentKey()
    if (!key) return
    try {
      const flag = localStorage.getItem(`payment:finalized:${key}`)
      if (flag === 'true') {
        setIsFinalized(true)
      } else {
        setIsFinalized(false)
      }
    } catch {}
  }, [isOpen, paymentDetails?.intentId, intentPublicId, intentId])

  const handlePinChange = (value: string) => {
    // 숫자만 입력 가능, 최대 6자리
    if (/^\d{0,6}$/.test(value)) {
      setPin(value)
      setError('')
    }
  }

  const handleApprove = async () => {
    // 중복 요청 방지
    if (isFinalized || isProcessing || isLoading) {
      console.log('이미 처리 중이거나 완료된 요청입니다')
      return
    }

    if (pin.length !== 6) {
      setError('PIN 번호는 6자리를 입력해주세요')
      return
    }

    setIsProcessing(true)
    setIsLoading(true)
    setError('')

    try {
      // intentPublicId가 있으면 paymentDetails에서 실제 intentId 사용
      const actualIntentId = paymentDetails?.intentId || intentId

      if (!actualIntentId) {
        setError('결제 정보가 없습니다')
        return
      }

      // 멱등성 키 생성 (결제 ID + 사용자 ID + 고유 세션 ID)
      const userId = localStorage.getItem('userId') || 'anonymous'
      const sessionId =
        localStorage.getItem('sessionId') ||
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 세션 ID가 없으면 생성해서 저장
      if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', sessionId)
      }

      // 멱등성 키: 결제ID_사용자ID_세션ID (동일한 결제에 대해 항상 같은 키)
      const idempotencyKey = `payment_${actualIntentId}_${userId}_${sessionId}`

      // 이미 처리된 키인지 확인
      if (processedKeys.has(idempotencyKey)) {
        console.log('이미 처리된 요청입니다:', idempotencyKey)
        setError('이미 처리된 요청입니다')
        setIsProcessing(false)
        return
      }

      // 처리 중인 키로 표시
      setProcessedKeys(prev => new Set(prev).add(idempotencyKey))

      const success = await notificationApi.customer.approvePayment(
        actualIntentId,
        pin,
        idempotencyKey // Idempotency Key 전달
      )

      if (success) {
        // 결제 승인 완료 플래그 저장 (로컬)
        try {
          const key = getIntentKey()
          if (key) localStorage.setItem(`payment:finalized:${key}`, 'true')
        } catch {}

        // 즉시 UI 상태 변경 (중복 요청 방지)
        setIsFinalized(true)
        setIsProcessing(false)

        onSuccess?.()
        onClose()
        setPin('')

        // 성공 알림 표시
        const displayStoreName =
          paymentDetails?.storeName || storeName || '매장'
        const displayAmount = paymentDetails?.totalAmount || amount

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('결제 승인 완료', {
            body: `${displayStoreName}에서의 ${displayAmount ? `${displayAmount.toLocaleString()}원` : ''} 결제가 승인되었습니다`,
            icon: '/icons/qr.png',
            badge: '/icons/badge-personal.svg',
          })
        }
      } else {
        setError('결제 승인에 실패했습니다. PIN 번호를 확인해주세요')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('결제 승인 오류:', error)
      setError('결제 승인 중 오류가 발생했습니다')
      setIsProcessing(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPin('')
    setError('')
    onClose()
  }

  const formatAmount = (amount: string | number | undefined) => {
    if (!amount) return ''
    const num = typeof amount === 'string' ? parseInt(amount) : amount
    return num.toLocaleString()
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              paymentType === 'CANCEL' ? 'bg-red-100' : 'bg-blue-100'
            }`}
          >
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 12C2 8.229 2 6.343 3.172 5.172C4.343 4 6.229 4 10 4H14C17.771 4 19.657 4 20.828 5.172C22 6.343 22 8.229 22 12C22 15.771 22 17.657 20.828 18.828C19.657 20 17.771 20 14 20H10C6.229 20 4.343 20 3.172 18.828C2 17.657 2 15.771 2 12Z"
                stroke={paymentType === 'CANCEL' ? '#EF4444' : '#3B82F6'}
                strokeWidth="2"
              />
              <path
                d="M10 16H6M14 16H12.5M2 10H22"
                stroke={paymentType === 'CANCEL' ? '#EF4444' : '#3B82F6'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-black">
            {paymentType === 'CANCEL' ? '결제 취소 승인' : '결제 승인'}
          </h3>
        </div>

        {/* 로딩 중일 때 */}
        {isLoadingDetails && (
          <div className="mb-6 rounded-lg bg-gray-50 p-8 text-center">
            <div className="text-sm text-gray-600">
              결제 정보를 불러오는 중...
            </div>
          </div>
        )}

        {/* 결제 정보 */}
        {!isLoadingDetails && (
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            {/* 기본 정보 */}
            <div className="mb-4">
              {(paymentDetails?.customerName || customerName) && (
                <div className="mb-3 flex justify-between">
                  <span className="text-sm text-gray-600">고객명</span>
                  <span className="text-sm font-medium text-black">
                    {paymentDetails?.customerName || customerName}
                  </span>
                </div>
              )}

              {(paymentDetails?.storeName || storeName) && (
                <div className="mb-3 flex justify-between">
                  <span className="text-sm text-gray-600">매장명</span>
                  <span className="text-sm font-medium text-black">
                    {paymentDetails?.storeName || storeName}
                  </span>
                </div>
              )}

              {(paymentDetails?.totalAmount || amount) && (
                <div className="mb-3 flex justify-between">
                  <span className="text-sm text-gray-600">
                    {paymentType === 'CANCEL' ? '취소 금액' : '총 결제 금액'}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      paymentType === 'CANCEL'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {formatAmount(paymentDetails?.totalAmount || amount)}원
                  </span>
                </div>
              )}
            </div>

            {/* 주문 상세 항목 */}
            {paymentDetails?.items && paymentDetails.items.length > 0 && (
              <>
                <hr className="my-3 border-gray-200" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    주문 내역
                  </h4>
                  {paymentDetails.items.map((item, index) => (
                    <div key={index} className="rounded-lg bg-white p-3">
                      <div className="mb-1 flex items-start justify-between">
                        <span className="text-sm font-medium text-black">
                          {item.menuName}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {item.totalPrice.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {item.unitPrice.toLocaleString()}원 × {item.quantity}
                          개
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 포인트 정보 */}
            {(paymentDetails?.pointInfo || pointInfo) &&
              paymentType === 'PAYMENT' && (
                <>
                  <hr className="my-3 border-gray-200" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      포인트 정보
                    </h4>
                    {(paymentDetails?.pointInfo?.currentPoints ||
                      pointInfo?.currentPoints) !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">
                          보유 포인트
                        </span>
                        <span className="text-xs font-medium text-black">
                          {(
                            paymentDetails?.pointInfo?.currentPoints ||
                            pointInfo?.currentPoints ||
                            0
                          ).toLocaleString()}
                          P
                        </span>
                      </div>
                    )}
                    {(paymentDetails?.pointInfo?.usedPoints ||
                      pointInfo?.usedPoints) !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">
                          사용 포인트
                        </span>
                        <span className="text-xs font-medium text-red-600">
                          -
                          {(
                            paymentDetails?.pointInfo?.usedPoints ||
                            pointInfo?.usedPoints ||
                            0
                          ).toLocaleString()}
                          P
                        </span>
                      </div>
                    )}
                    {(paymentDetails?.pointInfo?.remainingPoints ||
                      pointInfo?.remainingPoints) !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">
                          잔여 포인트
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          {(
                            paymentDetails?.pointInfo?.remainingPoints ||
                            pointInfo?.remainingPoints ||
                            0
                          ).toLocaleString()}
                          P
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
          </div>
        )}

        {/* PIN 입력 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            PIN 번호 입력
          </label>
          <input
            type="password"
            value={pin}
            onChange={e => handlePinChange(e.target.value)}
            placeholder="6자리 PIN 번호"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={isLoading || isFinalized}
          />
          {!isFinalized ? (
            <p className="mt-1 text-xs text-gray-500">
              결제 승인을 위해 6자리 PIN 번호를 입력해주세요
            </p>
          ) : (
            <p className="mt-1 text-xs font-medium text-green-600">
              이미 처리된 결제입니다. 다시 입력할 수 없습니다.
            </p>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleApprove}
            disabled={
              isLoading || isProcessing || pin.length !== 6 || isFinalized
            }
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isFinalized
              ? '이미 승인됨'
              : isLoading || isProcessing
                ? '승인 중...'
                : '승인하기'}
          </button>
        </div>

        {/* 추가 정보 */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            결제 승인 후에는 취소할 수 없습니다
          </p>
        </div>
      </div>
    </div>
  )
}
