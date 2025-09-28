'use client'

import { notificationApi } from '@/api/notificationApi'
import { generateIdempotencyKey } from '@/utils/idempotency'
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
  // processedKeys 제거: 타임스탬프 기반 키 사용으로 중복 체크 불필요
  const [pinAttempts, setPinAttempts] = useState(0) // PIN 시도 횟수
  const [isBlocked, setIsBlocked] = useState(false) // PIN 입력 차단 상태
  const [showRetryModal, setShowRetryModal] = useState(false) // 의도적 재시도 확인 모달
  const [isRetrying, setIsRetrying] = useState(false) // 의도적 재시도 플래그
  const [lastPaymentData, setLastPaymentData] = useState<{
    intentId: string | number
    pin: string
    timestamp: number
  } | null>(null) // 마지막 결제 데이터
  const [requestInProgress, setRequestInProgress] = useState(false) // 요청 진행 중 플래그
  const [lastRequestTime, setLastRequestTime] = useState(0) // 마지막 요청 시간

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

      // PIN 시도 횟수 확인
      const attempts = localStorage.getItem(`payment:attempts:${key}`)
      const attemptCount = attempts ? parseInt(attempts) : 0
      setPinAttempts(attemptCount)

      // 5회 이상 시도시 차단
      if (attemptCount >= 5) {
        setIsBlocked(true)
        setError('PIN 번호를 5회 잘못 입력하여 결제가 차단되었습니다.')
      }
    } catch {}
  }, [isOpen, paymentDetails?.intentId, intentPublicId, intentId])

  const handlePinChange = (value: string) => {
    // 차단된 상태면 입력 불가
    if (isBlocked) return

    // 숫자만 입력 가능, 최대 6자리
    if (/^\d{0,6}$/.test(value)) {
      setPin(value)
      if (!isBlocked) {
        setError('')
      }
    }
  }

  // 의도적 재시도 확인 함수
  const checkForRetry = (
    actualIntentId: string | number,
    pin: string
  ): boolean => {
    if (!lastPaymentData) return false

    // 같은 결제 정보인지 확인 (intentId와 pin이 같으면)
    const isSamePayment =
      lastPaymentData.intentId === actualIntentId && lastPaymentData.pin === pin

    // 5분 이내의 같은 결제인지 확인
    const isRecentPayment =
      Date.now() - lastPaymentData.timestamp < 5 * 60 * 1000

    return isSamePayment && isRecentPayment
  }

  // 의도적 재시도 확인 모달 핸들러
  const handleRetryConfirm = async () => {
    setShowRetryModal(false)

    // 의도적 재시도 플래그 설정
    setIsRetrying(true)

    // 새로운 멱등성 키로 재시도
    const actualIntentId = paymentDetails?.intentId || intentId
    if (actualIntentId) {
      await processPayment(actualIntentId, pin)
    }
  }

  const handleRetryCancel = () => {
    setShowRetryModal(false)
    setPin('') // PIN 초기화
  }

  const handleApprove = async () => {
    // 차단 상태 확인
    if (isBlocked) {
      setError('PIN 번호를 5회 잘못 입력하여 결제가 차단되었습니다.')
      return
    }

    // 강화된 중복 요청 방지
    if (isFinalized || isProcessing || isLoading || requestInProgress) {
      console.log('이미 처리 중이거나 완료된 요청입니다')
      return
    }

    // 연속 클릭 방지 (1초 이내 중복 클릭 차단)
    const now = Date.now()
    if (now - lastRequestTime < 1000) {
      console.log('너무 빠른 연속 클릭입니다. 잠시 후 다시 시도해주세요.')
      setError('너무 빠른 연속 클릭입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (pin.length !== 6) {
      setError('PIN 번호는 6자리를 입력해주세요')
      return
    }

    // intentPublicId가 있으면 paymentDetails에서 실제 intentId 사용
    const actualIntentId = paymentDetails?.intentId || intentId

    if (!actualIntentId) {
      setError('결제 정보가 없습니다')
      return
    }

    // 의도적 재시도 확인
    if (checkForRetry(actualIntentId, pin)) {
      setShowRetryModal(true)
      return
    }

    // 정상 결제 진행
    await processPayment(actualIntentId, pin)
  }

  // 실제 결제 처리 함수
  const processPayment = async (
    actualIntentId: string | number,
    pin: string
  ) => {
    // 중복 요청 방지 플래그 설정
    setRequestInProgress(true)
    setLastRequestTime(Date.now())
    setIsProcessing(true)
    setIsLoading(true)
    setError('')

    try {
      // 멱등성 키 생성
      const userId = localStorage.getItem('userId') || 'anonymous'
      let idempotencyKey: string

      if (isRetrying) {
        // 의도적 재시도: UUID v4 형식으로 완전히 새로운 키 생성
        const uuid = crypto.randomUUID()
        idempotencyKey = `retry_${actualIntentId}_${userId}_${uuid}`
        console.log('의도적 재시도용 멱등성 키:', idempotencyKey)
      } else {
        // 일반 요청: 데이터 기반 멱등성 키 생성 (시간 무관)
        idempotencyKey = generateIdempotencyKey({
          userId: userId,
          action: 'payment_approve',
          data: {
            intentId: String(actualIntentId),
            pin: pin,
          },
        })
        console.log('데이터 기반 멱등성 키:', idempotencyKey)
      }

      console.log('생성된 멱등성 키:', idempotencyKey)

      const success = await notificationApi.customer.approvePayment(
        actualIntentId,
        pin,
        idempotencyKey // 생성된 멱등성 키 전달
      )

      if (success) {
        // 결제 승인 완료 플래그 저장 (로컬)
        try {
          const key = getIntentKey()
          if (key) localStorage.setItem(`payment:finalized:${key}`, 'true')
        } catch {}

        // 마지막 결제 데이터 저장 (의도적 재시도 확인용)
        setLastPaymentData({
          intentId: actualIntentId,
          pin: pin,
          timestamp: Date.now(),
        })

        // 즉시 UI 상태 변경 (중복 요청 방지)
        setIsFinalized(true)
        setIsProcessing(false)
        setIsRetrying(false) // 재시도 플래그 초기화
        setRequestInProgress(false) // 요청 진행 플래그 초기화

        onSuccess?.()
        onClose()
        setPin('')

        // 성공 시 시도 횟수 초기화
        try {
          const key = getIntentKey()
          if (key) {
            localStorage.removeItem(`payment:attempts:${key}`)
          }
        } catch {}

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
        // 실패 시 시도 횟수 증가
        const newAttempts = pinAttempts + 1
        setPinAttempts(newAttempts)

        try {
          const key = getIntentKey()
          if (key) {
            localStorage.setItem(
              `payment:attempts:${key}`,
              newAttempts.toString()
            )
          }
        } catch {}

        // 5회 실패시 차단
        if (newAttempts >= 5) {
          setIsBlocked(true)
          setError('PIN 번호를 5회 잘못 입력하여 결제가 차단되었습니다.')
        } else {
          setError(
            `결제 승인에 실패했습니다. PIN 번호를 확인해주세요 (${newAttempts}/5)`
          )
        }

        // 실패 시에도 마지막 결제 데이터 저장 (의도적 재시도 확인용)
        setLastPaymentData({
          intentId: actualIntentId,
          pin: pin,
          timestamp: Date.now(),
        })

        setIsProcessing(false)
        setIsRetrying(false) // 재시도 플래그 초기화
        setRequestInProgress(false) // 요청 진행 플래그 초기화
      }
    } catch (error) {
      console.error('결제 승인 오류:', error)
      setError('결제 승인 중 오류가 발생했습니다')
      setIsProcessing(false)
      setRequestInProgress(false) // 요청 진행 플래그 초기화
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPin('')
    setError('')
    setPinAttempts(0)
    setIsBlocked(false)
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
            disabled={isLoading || isFinalized || isBlocked}
          />
          {!isFinalized && !isBlocked ? (
            <p className="mt-1 text-xs text-gray-500">
              결제 승인을 위해 6자리 PIN 번호를 입력해주세요
              {pinAttempts > 0 && ` (${pinAttempts}/5)`}
            </p>
          ) : isBlocked ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              PIN 번호를 5회 잘못 입력하여 결제가 차단되었습니다.
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
              isLoading ||
              isProcessing ||
              requestInProgress ||
              pin.length !== 6 ||
              isFinalized ||
              isBlocked
            }
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isFinalized
              ? '이미 승인됨'
              : isBlocked
                ? '입력 차단됨'
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

      {/* 의도적 재시도 확인 모달 */}
      {showRetryModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                이전과 같은 결제를 다시 진행하시겠습니까?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                동일한 결제 정보로 최근에 시도한 기록이 있습니다.
                <br />
                다시 진행하려면 '네'를 선택해주세요.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetryCancel}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              >
                아니오
              </button>
              <button
                onClick={handleRetryConfirm}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                네, 다시 진행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
