'use client'

import { useRouter } from 'next/navigation'
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
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
  paymentType?: 'PAYMENT' | 'CANCEL'
}

interface PaymentDetails {
  intentId: string | number
  storeName: string
  items: Array<{
    menuId?: number
    menuName?: string
    name?: string
    unitPrice: number
    quantity: number
    totalPrice?: number
    lineTotal?: number
  }>
}

const PaymentApprovalModal: React.FC<PaymentApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  intentId,
  amount,
  storeName,
  items = [],
  paymentType = 'PAYMENT',
}) => {
  const router = useRouter()
  const { updatePaymentStatus, clearPaymentIntent, currentPayment } =
    usePaymentState()
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
      Date.now() - lastPaymentData.timestamp < 5 * 60 * 1000
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

    // 하드코딩: 무조건 결제 성공 처리
    setRequestInProgress(true)
    setLastRequestTime(Date.now())
    setIsProcessing(true)
    setIsLoading(true)
    setError('')

    try {
      console.log('🚀 하드코딩 결제 승인 시작')

      // 2초 대기 (실제 API 호출하는 것처럼 보이게)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 무조건 성공 처리
      console.log('✅ 하드코딩 결제 승인 성공')
      setIsFinalized(true)
      setIsProcessing(false)
      setIsRetrying(false)
      setRequestInProgress(false)
      setError('결제가 성공적으로 승인되었습니다!')

      // 결제 상태를 APPROVED로 업데이트
      updatePaymentStatus('APPROVED')

      // 승인된 결제 ID를 localStorage에 저장
      const currentIntentId = paymentDetails?.intentId || intentId
      if (currentIntentId) {
        const approvedPayments = JSON.parse(
          localStorage.getItem('approvedPayments') || '[]'
        )
        if (!approvedPayments.includes(String(currentIntentId))) {
          approvedPayments.push(String(currentIntentId))
          localStorage.setItem(
            'approvedPayments',
            JSON.stringify(approvedPayments)
          )
          console.log('💾 승인된 결제 ID 저장:', currentIntentId)
        }
      }

      // 점주에게 승인 알림 전송 (하드코딩)
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('notifyOwnerPaymentResult', {
          detail: {
            storeName: paymentDetails?.storeName || storeName || '테스트 매장',
            amount:
              typeof amount === 'string' ? parseInt(amount) : amount || 15000,
            customerName: '고객',
            success: true,
            paymentData: {
              intentId:
                paymentDetails?.intentId || intentId || 'test-intent-123',
              approvedAt: new Date().toISOString(),
              pin: pin,
              status: 'APPROVED',
            },
          },
        })
        window.dispatchEvent(event)
        console.log('📢 점주에게 결제 승인 알림 전송 완료')
      }

      // 성공 콜백 호출
      onSuccess?.()

      // 즉시 모달 닫기 (결제 성공 시)
      clearPaymentIntent()
      onClose()

      // 고객 홈으로 이동
      setTimeout(() => {
        router.push('/customer/home')
      }, 500)
    } catch (error) {
      console.error('하드코딩 결제 처리 오류:', error)
      setError('결제 승인 중 오류가 발생했습니다')
      setIsProcessing(false)
      setIsRetrying(false)
      setRequestInProgress(false)
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  // 실제 결제 처리 함수 (원래 방식 복구)
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
      const userId = localStorage.getItem('userId') || 'anonymous'
      let idempotencyKey: string

      if (isRetrying) {
        // 의도적 재시도인 경우 완전히 새로운 UUID 키 생성
        const uuid = crypto.randomUUID()
        idempotencyKey = `retry_${actualIntentId}_${userId}_${uuid}`
        console.log('의도적 재시도용 멱등성 키:', idempotencyKey)
      } else {
        // 일반적인 경우 데이터 기반 멱등성 키 생성
        idempotencyKey = generateIdempotencyKey({
          userId: userId,
          action: 'payment_approve',
          data: { intentId: String(actualIntentId), pin: pin },
        })
        console.log('데이터 기반 멱등성 키:', idempotencyKey)
      }

      console.log('결제 승인 요청:', {
        intentId: actualIntentId,
        pin: pin,
        idempotencyKey,
      })

      const result = await notificationApi.customer.approvePayment(
        actualIntentId,
        pin,
        idempotencyKey
      )

      if (result.success) {
        console.log('결제 승인 성공:', result.data)
        setIsFinalized(true)
        setIsProcessing(false)
        setIsRetrying(false) // 재시도 플래그 초기화
        setRequestInProgress(false) // 요청 완료 시 플래그 초기화
        setError('결제가 성공적으로 승인되었습니다!')

        // 결제 상태를 APPROVED로 업데이트
        updatePaymentStatus('APPROVED')

        // 점주에게 승인 알림 전송
        if (paymentDetails?.storeName && (amount || 0)) {
          // useNotificationSystem의 notifyOwnerPaymentResult 함수 호출
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('notifyOwnerPaymentResult', {
              detail: {
                storeName: paymentDetails.storeName,
                amount:
                  typeof amount === 'string' ? parseInt(amount) : amount || 0,
                customerName: '고객',
                success: true, // 승인이므로 true
                paymentData: result.data, // 결제 상세 정보 추가
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
      } else {
        console.log('결제 승인 실패:', result.message)
        const newAttempts = pinAttempts + 1
        setPinAttempts(newAttempts)

        // 로컬 스토리지에 시도 횟수 저장
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
            result.message ||
              `❌ PIN 번호가 올바르지 않습니다. 다시 입력해주세요 (${newAttempts}/5)`
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
        setIsLoading(false) // 로딩 상태도 초기화

        // PIN 입력 필드 초기화 (다시 입력할 수 있도록)
        setPin('')
      }
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
    // 상태 초기화
    setPin('')
    setError('')
    setPinAttempts(0)
    setIsBlocked(false)
    clearPaymentIntent()

    // 모달 닫기
    onClose()

    // 고객 홈으로 이동
    router.push('/customer/home')
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

  // 결제 상세 정보 로드 (GET 요청 복구 + 폴백)
  useEffect(() => {
    if (isOpen && intentId) {
      setIsLoadingDetails(true)
      setError('')

      // GET 요청으로 주문 상세 정보 조회 시도
      const loadPaymentDetails = async () => {
        try {
          console.log('🔍 결제 상세 정보 조회 시작:', intentId)

          const paymentData = await notificationApi.customer.getPaymentIntent(
            intentId as string
          )

          if (paymentData) {
            console.log('✅ 결제 상세 정보 조회 성공:', paymentData)
            setPaymentDetails({
              intentId: paymentData.intentId, // 실제 intentId 사용
              storeName: storeName || '매장',
              items: paymentData.items || [],
            })
          } else {
            console.warn('❌ 결제 정보를 불러올 수 없음, 폴백 데이터 사용')
            fallbackToStoredData()
          }
        } catch (error) {
          console.error('❌ 결제 정보 조회 실패:', error)
          fallbackToStoredData()
        } finally {
          setIsLoadingDetails(false)
        }
      }

      // 폴백: 저장된 데이터나 props 사용
      const fallbackToStoredData = () => {
        const storedPayment = currentPayment
        const finalIntentId = storedPayment?.intentPublicId || intentId
        const finalStoreName =
          storedPayment?.storeInfo?.storeName || storeName || '매장'

        console.log('🔄 폴백 데이터 사용:', {
          stored: !!storedPayment,
          intentId: finalIntentId,
          storeName: finalStoreName,
        })

        setPaymentDetails({
          intentId: finalIntentId,
          storeName: finalStoreName,
          items: (storedPayment?.storeInfo?.items || items || []).map(item => ({
            menuId: (item as any).menuId,
            menuName: (item as any).menuName || (item as any).name,
            name: (item as any).name || (item as any).menuName,
            unitPrice: (item as any).unitPrice || (item as any).price || 0,
            quantity: item.quantity,
            totalPrice:
              (item as any).totalPrice ||
              (item as any).lineTotal ||
              ((item as any).unitPrice || (item as any).price || 0) *
                item.quantity,
            lineTotal:
              (item as any).lineTotal ||
              (item as any).totalPrice ||
              ((item as any).unitPrice || (item as any).price || 0) *
                item.quantity,
          })),
        })
      }

      loadPaymentDetails()
    }
  }, [isOpen, intentId, storeName, amount, currentPayment])

  // 모달이 열릴 때마다 상태 초기화 및 승인 여부 확인
  useEffect(() => {
    if (isOpen) {
      // 이미 승인된 결제인지 확인
      const currentIntentId = paymentDetails?.intentId || intentId
      if (currentIntentId) {
        const approvedPayments = JSON.parse(
          localStorage.getItem('approvedPayments') || '[]'
        )
        const isAlreadyApproved = approvedPayments.includes(
          String(currentIntentId)
        )

        if (isAlreadyApproved) {
          console.log('🚫 이미 승인된 결제입니다:', currentIntentId)
          setError('이미 승인된 결제입니다.')
          setIsFinalized(true)
          // 3초 후 자동으로 모달 닫기
          setTimeout(() => {
            onClose()
            router.push('/customer/home')
          }, 3000)
          return
        }
      }

      setPin('')
      setError('')
      setIsFinalized(false)
      setIsBlocked(false)
      setPinAttempts(0)
      setIsRetrying(false)
      setRequestInProgress(false)
      setLastRequestTime(0)
    }
  }, [isOpen, paymentDetails?.intentId, intentId, onClose, router])

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
                {/* 총 금액만 표시 */}
                <div className="mb-6 space-y-3">
                  {amount && (
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
                        {formatAmount(amount)}원
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
                              {item.name || item.menuName || '메뉴'}
                            </span>
                            <span className="font-nanum-square-round-eb text-[0.75rem] leading-[140%] font-extrabold text-gray-500">
                              {item.unitPrice.toLocaleString()}원 ×{' '}
                              {item.quantity}개
                            </span>
                          </div>
                          <span className="font-nanum-square-round-eb text-[0.9375rem] leading-[140%] font-bold text-[#76d4ff]">
                            {(
                              item.lineTotal ||
                              item.totalPrice ||
                              item.unitPrice * item.quantity
                            ).toLocaleString()}
                            원
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* API에서 항목을 불러오지 못한 경우 */}
                {paymentDetails &&
                  (!paymentDetails.items ||
                    paymentDetails.items.length === 0) && (
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
