'use client'

import React, { useEffect, useState } from 'react'

import { notificationApi } from '@/api/notificationApi'
import { usePaymentState } from '@/hooks/usePaymentState'
import { generateIdempotencyKey } from '@/utils/idempotency'

interface PaymentApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  intentId?: string | number
  customerName?: string
  amount?: string | number
  storeName?: string
  pointInfo?: string | { [key: string]: unknown }
  paymentType?: 'PAYMENT' | 'CANCEL'
}

interface PaymentDetails {
  intentId: string | number
  customerName: string
  storeName: string
  totalAmount: number
  items: Array<{
    menuId: number
    name: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }>
  pointInfo?: {
    [key: string]: unknown
  }
}

const PaymentApprovalModal: React.FC<PaymentApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  intentId,
  customerName,
  amount,
  storeName,
  pointInfo,
  paymentType = 'PAYMENT',
}) => {
  const { updatePaymentStatus, clearPaymentIntent } = usePaymentState()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [pinAttempts, setPinAttempts] = useState(0)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  )
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [showRetryModal, setShowRetryModal] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastPaymentData, setLastPaymentData] = useState<{
    intentId: string | number
    pin: string
    timestamp: number
  } | null>(null)
  const [requestInProgress, setRequestInProgress] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState(0)

  // PIN 입력 핸들러
  const handlePinChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value)
      setError('')
    }
  }

  // 의도적 재시도 확인
  const checkForRetry = (
    actualIntentId: string | number,
    pin: string
  ): boolean => {
    if (!lastPaymentData) return false
    const isSamePayment =
      lastPaymentData.intentId === actualIntentId && lastPaymentData.pin === pin
    const isRecentPayment =
      Date.now() - lastPaymentData.timestamp < 5 * 60 * 1000 // 5분 이내
    return isSamePayment && isRecentPayment
  }

  // 재시도 확인 모달 핸들러
  const handleRetryConfirm = () => {
    setShowRetryModal(false)
    setIsRetrying(true)
    const actualIntentId = paymentDetails?.intentId || intentId
    if (actualIntentId) {
      processPayment(actualIntentId, pin)
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


  // 실제 결제 처리 함수 (PIN 검증 없이 항상 성공)
  const processPayment = async (
    actualIntentId: string | number,
    pin: string
  ) => {
    setRequestInProgress(true) // 요청 시작 시 플래그 설정
    setLastRequestTime(Date.now()) // 요청 시간 기록
    setIsProcessing(true)
    setIsLoading(true)
    setError('')

    try {
      console.log('결제 승인 요청 (테스트 모드 - 항상 성공):', {
        intentId: actualIntentId,
        pin: pin,
      })

      // 테스트를 위해 항상 성공 처리
      console.log('결제 승인 성공 (테스트 모드)')
      setIsFinalized(true)
      setIsProcessing(false)
      setIsRetrying(false) // 재시도 플래그 초기화
      setRequestInProgress(false) // 요청 완료 시 플래그 초기화
      setError('✅ 결제가 성공적으로 승인되었습니다!')

      // 결제 상태를 APPROVED로 업데이트
      updatePaymentStatus('APPROVED')

      // 점주에게 승인 알림 전송
      if (paymentDetails?.storeName && paymentDetails?.totalAmount) {
        // useNotificationSystem의 notifyOwnerPaymentResult 함수 호출
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('notifyOwnerPaymentResult', {
            detail: {
              storeName: paymentDetails.storeName,
              amount: paymentDetails.totalAmount,
              customerName: paymentDetails.customerName || '고객',
              success: true, // 승인이므로 true
              paymentData: {
                intentId: actualIntentId,
                pin: pin,
                timestamp: new Date().toISOString(),
              }, // 테스트용 데이터
            },
          })
          window.dispatchEvent(event)
        }
      }

      // 성공 콜백 호출
      onSuccess?.()

      // 바로 모달 닫기 (결제 성공 시)
      setTimeout(() => {
        // 결제 완료 후 상태 정리
        clearPaymentIntent()
        onClose()
      }, 1000)
    } catch (error) {
      console.error('결제 승인 오류:', error)
      setError('결제 승인 중 오류가 발생했습니다')
      setIsProcessing(false)
      setIsRetrying(false)
      setRequestInProgress(false) // 요청 진행 플래그 초기화

      // 에러 발생 시에도 PIN 필드를 다시 사용할 수 있도록 초기화
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }


  const handleCancel = () => {
    setPin('')
    setError('')
    setPinAttempts(0)
    setIsBlocked(false)

    // 취소 시에도 결제 상태 정리
    clearPaymentIntent()
    onClose()
  }

  const formatAmount = (amount: string | number | undefined) => {
    if (!amount) return ''
    const num = typeof amount === 'string' ? parseInt(amount) : amount
    return num.toLocaleString()
  }

  // intentId 키 생성 함수
  const getIntentKey = () => {
    return paymentDetails?.intentId || intentId
  }

  // 결제 상세 정보 로드 (GET 요청 제거 - props 데이터만 사용)
  useEffect(() => {
    if (isOpen && intentId) {
      setIsLoadingDetails(true)
      setError('')

      // props로 전달받은 기본 정보만 사용
      setTimeout(() => {
        setPaymentDetails({
          intentId: intentId,
          customerName: customerName || '고객',
          storeName: storeName || '매장',
          totalAmount:
            typeof amount === 'string'
              ? parseInt(amount)
              : (amount as number) || 0,
          items: [], // 주문 상세 없이 빈 배열
          pointInfo: typeof pointInfo === 'object' ? pointInfo : undefined,
        })
        setIsLoadingDetails(false)
      }, 500)
    }
  }, [isOpen, intentId, customerName, storeName, amount, pointInfo])

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setPin('')
      setError('')
      setIsFinalized(false)
      setIsBlocked(false)
      setPinAttempts(0)
      setIsRetrying(false)
      setRequestInProgress(false)
      setLastRequestTime(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="h-[580px] w-[412px]">
          <div className="h-[580px] w-[412px] flex-shrink-0 rounded-[30px] bg-[#f6fcff]">
            {/* 상단 바 */}
            <div className="h-[0.1875rem] w-full rounded-t-[30px] bg-[#76d4ff]" />

            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="font-jalnan text-xl leading-[140%] text-[#76d4ff]">
                {paymentType === 'CANCEL' ? '결제 취소 승인' : '결제 승인'}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
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
                    stroke="#76D4FF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* 로딩 중일 때 */}
            {isLoadingDetails && (
              <div className="flex h-32 items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#76d4ff] border-t-transparent"></div>
                  <div className="font-nanum-square-round-eb text-sm text-gray-600">
                    주문 정보를 불러오는 중...
                  </div>
                </div>
              </div>
            )}

            {/* 결제 정보 */}
            {!isLoadingDetails && (
              <div className="px-6 py-4">
                {/* 기본 정보 */}
                <div className="mb-6 space-y-3">
                  {(paymentDetails?.customerName || customerName) && (
                    <div className="flex items-center justify-between py-2">
                      <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-extrabold text-gray-500">
                        고객명
                      </span>
                      <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-bold text-black">
                        {paymentDetails?.customerName || customerName}
                      </span>
                    </div>
                  )}

                  {(paymentDetails?.storeName || storeName) && (
                    <div className="flex items-center justify-between py-2">
                      <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-extrabold text-gray-500">
                        매장명
                      </span>
                      <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-bold text-black">
                        {paymentDetails?.storeName || storeName}
                      </span>
                    </div>
                  )}

                  {(paymentDetails?.totalAmount || amount) && (
                    <div className="flex items-center justify-between py-2">
                      <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-extrabold text-gray-500">
                        {paymentType === 'CANCEL'
                          ? '취소 금액'
                          : '총 결제 금액'}
                      </span>
                      <span
                        className={`font-nanum-square-round-eb text-lg font-bold ${
                          paymentType === 'CANCEL'
                            ? 'text-red-600'
                            : 'text-[#76d4ff]'
                        }`}
                      >
                        {formatAmount(paymentDetails?.totalAmount || amount)}원
                      </span>
                    </div>
                  )}
                </div>

                {/* 주문 상세 항목 */}
                {paymentDetails?.items && paymentDetails.items.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-4 h-[0.1875rem] w-full bg-[#76d4ff]" />
                    <div className="space-y-3">
                      <h4 className="font-nanum-square-round-eb mb-3 text-[0.9375rem] leading-[140%] font-extrabold text-gray-500">
                        주문 내역
                      </h4>
                      {paymentDetails.items.map((item, index) => (
                        <div
                          key={item.menuId || index}
                          className="flex h-8 w-full flex-shrink-0 items-center justify-between rounded-[0.625rem] border-[3px] border-[#76d4ff] bg-white px-3"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-bold text-black">
                              {item.name}
                            </span>
                            <span className="font-nanum-square-round-eb text-[0.75rem] leading-[140%] font-extrabold text-gray-500">
                              {item.unitPrice.toLocaleString()}원 ×{' '}
                              {item.quantity}개
                            </span>
                          </div>
                          <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-bold text-[#76d4ff]">
                            {item.lineTotal.toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* API에서 항목을 불러오지 못한 경우 */}
                {paymentDetails && (!paymentDetails.items || paymentDetails.items.length === 0) && (
                  <div className="mb-6">
                    <div className="mb-4 h-[0.1875rem] w-full bg-[#76d4ff]" />
                    <div className="space-y-3">
                      <h4 className="font-nanum-square-round-eb mb-3 text-[0.9375rem] leading-[140%] font-extrabold text-gray-500">
                        주문 내역
                      </h4>
                      <div className="flex h-8 w-full flex-shrink-0 items-center justify-center rounded-[0.625rem] border-[3px] border-gray-300 bg-gray-50 px-3">
                        <span className="font-nanum-square-round-eb text-[0.75rem] leading-[140%] font-bold text-gray-500">
                          주문 상세 정보를 불러올 수 없습니다
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 포인트 정보 */}
                {(paymentDetails?.pointInfo || pointInfo) &&
                  paymentType === 'PAYMENT' && (
                    <>
                      <div className="mb-4 h-[0.1875rem] w-full bg-[#76d4ff]" />
                      <div className="space-y-2">
                        <h4 className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-extrabold text-gray-500">
                          포인트 정보
                        </h4>
                        <div className="flex h-8 w-full flex-shrink-0 items-center rounded-[0.625rem] border-[3px] border-[#76d4ff] bg-white px-3">
                          <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-bold text-black">
                            {typeof paymentDetails?.pointInfo === 'object'
                              ? JSON.stringify(paymentDetails.pointInfo)
                              : String(
                                  paymentDetails?.pointInfo || pointInfo || ''
                                )}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                {/* PIN 입력 */}
                <div className="mb-6">
                  <div className="mb-4 flex h-[2.8125rem] w-full items-center justify-center rounded-[0.625rem] bg-[#76d4ff] px-0 pt-[0.3125rem] pb-[0.3125rem]">
                    <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-extrabold text-gray-500">
                      PIN 번호 입력
                    </span>
                  </div>

                  <div className="flex h-12 w-full flex-shrink-0 items-center rounded-[0.625rem] border-[3px] border-[#76d4ff] bg-white px-4">
                    <input
                      type="password"
                      value={pin}
                      onChange={e => handlePinChange(e.target.value)}
                      placeholder="6자리 PIN 번호"
                      className="font-nanum-square-round-eb w-full text-center text-lg font-bold tracking-widest text-black focus:outline-none"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      disabled={isFinalized || isBlocked}
                    />
                  </div>

                  {!isFinalized && !isBlocked ? (
                    <p className="font-nanum-square-round-eb mt-2 text-center text-xs text-gray-500">
                      결제 승인을 위해 6자리 PIN 번호를 입력해주세요
                      {pinAttempts > 0 && ` (${pinAttempts}/5)`}
                    </p>
                  ) : isBlocked ? (
                    <p className="font-nanum-square-round-eb mt-2 text-center text-xs font-medium text-red-600">
                      PIN 번호를 5회 잘못 입력하여 결제가 차단되었습니다.
                    </p>
                  ) : (
                    <p className="font-nanum-square-round-eb mt-2 text-center text-xs font-medium text-green-600">
                      이미 처리된 결제입니다. 다시 입력할 수 없습니다.
                    </p>
                  )}
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className="mb-4 flex h-8 w-full flex-shrink-0 items-center justify-center rounded-[0.625rem] border-[3px] border-red-400 bg-red-50 px-3">
                    <span className="font-nanum-square-round-eb text-[0.75rem] leading-[140%] font-bold text-red-600">
                      {error}
                    </span>
                  </div>
                )}

                {/* 버튼 */}
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isLoading || isFinalized}
                    className="font-nanum-square-round-eb h-10 flex-1 rounded-[0.625rem] border-[3px] border-gray-300 bg-gray-50 px-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
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
                    className="font-nanum-square-round-eb h-10 flex-1 rounded-[0.625rem] border-[3px] border-[#76d4ff] bg-[#76d4ff] px-3 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
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
                <div className="text-center">
                  <p className="font-nanum-square-round-eb text-xs text-gray-500">
                    결제 승인 후에는 취소할 수 없습니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 의도적 재시도 확인 모달 */}
      {showRetryModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="h-[280px] w-[350px]">
            <div className="h-[280px] w-[350px] flex-shrink-0 rounded-[30px] bg-[#f6fcff]">
              {/* 상단 바 */}
              <div className="h-[0.1875rem] w-full rounded-t-[30px] bg-[#76d4ff]" />

              {/* 헤더 */}
              <div className="flex items-center justify-center px-6 py-4">
                <div className="font-jalnan text-lg leading-[140%] text-[#76d4ff]">
                  재시도 확인
                </div>
              </div>

              {/* 내용 */}
              <div className="px-6 py-4 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
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

                <h3 className="font-nanum-square-round-eb mb-3 text-lg font-semibold text-gray-900">
                  이전과 같은 결제를 다시 진행하시겠습니까?
                </h3>
                <p className="font-nanum-square-round-eb mb-6 text-sm text-gray-600">
                  동일한 결제 정보로 최근에 시도한 기록이 있습니다.
                  <br />
                  다시 진행하려면 &apos;네&apos;를 선택해주세요.
                </p>

                {/* 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={handleRetryCancel}
                    className="font-nanum-square-round-eb h-10 flex-1 rounded-[0.625rem] border-[3px] border-gray-300 bg-gray-50 px-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
                  >
                    아니오
                  </button>
                  <button
                    onClick={handleRetryConfirm}
                    className="font-nanum-square-round-eb h-10 flex-1 rounded-[0.625rem] border-[3px] border-[#76d4ff] bg-[#76d4ff] px-3 text-sm font-bold text-white hover:bg-blue-600"
                  >
                    네, 다시 진행
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PaymentApprovalModal
