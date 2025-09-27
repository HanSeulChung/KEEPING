/**
 * 멱등키 기반 결제 버튼 컴포넌트 예시
 *
 * 주요 특징:
 * - 결제 중복 실행 방지
 * - 페이지 재진입 시 이전 상태 복원
 * - 성공한 결제는 재실행 불가
 * - 실패한 결제는 재시도 가능
 */

'use client'

import { paymentApi } from '@/api/idempotentClient'
import { useIdempotentButton } from '@/hooks/useIdempotentRequest'
import { useAuthStore } from '@/store/useAuthStore'
import { useState } from 'react'

interface PaymentButtonProps {
  storeId: number
  amount: number
  description?: string
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
}

export const IdempotentPaymentButton = ({
  storeId,
  amount,
  description = '선결제',
  onSuccess,
  onError,
}: PaymentButtonProps) => {
  const { user } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(false)

  // 멱등키 기반 결제 처리
  const payment = useIdempotentButton(
    async () => {
      if (!user?.userId) {
        throw new Error('사용자 정보가 없습니다.')
      }

      setIsProcessing(true)

      try {
        const result = await paymentApi.createPrepayment({
          userId: user.userId,
          storeId,
          amount,
          description,
        })

        console.log('결제 성공:', result)
        return result
      } finally {
        setIsProcessing(false)
      }
    },
    {
      // 멱등키 생성 옵션
      userId: user?.userId,
      storeId,
      action: 'payment_button',

      // 동작 옵션
      skipIfPending: true,
      retryOnError: true,

      // 메시지 설정
      confirmMessage: `${amount.toLocaleString()}원을 결제하시겠습니까?`,
      successMessage: '결제가 완료되었습니다!',
      errorMessage: '결제 처리 중 오류가 발생했습니다.',

      // 콜백
      onSuccess: result => {
        console.log('결제 완료:', result)
        onSuccess?.(result)
      },
      onError: error => {
        console.error('결제 실패:', error)
        onError?.(error)
      },
    }
  )

  // 버튼 스타일 결정
  const getButtonStyle = () => {
    if (payment.isSuccess) {
      return 'bg-green-600 hover:bg-green-700 cursor-not-allowed'
    }
    if (payment.isError && payment.canRetry) {
      return 'bg-red-600 hover:bg-red-700'
    }
    if (payment.disabled) {
      return 'bg-gray-400 cursor-not-allowed'
    }
    return 'bg-blue-600 hover:bg-blue-700'
  }

  return (
    <div className="space-y-4">
      {/* 결제 정보 표시 */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">결제 금액</span>
          <span className="text-xl font-bold">{amount.toLocaleString()}원</span>
        </div>
        {description && (
          <div className="mt-2 text-sm text-gray-600">{description}</div>
        )}
      </div>

      {/* 결제 상태 표시 */}
      {payment.lastExecutedAt && (
        <div className="text-sm text-gray-600">
          마지막 시도: {new Date(payment.lastExecutedAt).toLocaleString()}
        </div>
      )}

      {/* 메시지 표시 */}
      {payment.message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            payment.messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {payment.message}
        </div>
      )}

      {/* 에러 상세 정보 */}
      {payment.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          오류: {payment.error.message || '알 수 없는 오류가 발생했습니다.'}
        </div>
      )}

      {/* 결제 버튼 */}
      <button
        onClick={() => payment.handleClick()}
        disabled={payment.disabled || isProcessing}
        className={`w-full rounded-lg px-6 py-3 text-lg font-bold text-white transition-colors ${getButtonStyle()}`}
      >
        {payment.getButtonText(
          `${amount.toLocaleString()}원 결제하기`,
          '결제 처리 중...'
        )}
      </button>

      {/* 확인 다이얼로그 */}
      {payment.showConfirm && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">결제 확인</h3>
            <p className="mb-6 text-gray-600">
              {amount.toLocaleString()}원을 결제하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={payment.handleCancel}
                className="flex-1 rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                취소
              </button>
              <button
                onClick={() => payment.handleConfirm()}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개발용 디버깅 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 rounded bg-gray-100 p-3 text-xs text-gray-600">
          <div>멱등키: {payment.idempotencyKey}</div>
          <div>상태: {payment.status}</div>
          <div>재시도 가능: {payment.canRetry ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}

/**
 * QR 코드 처리 컴포넌트 예시
 */
interface QrProcessorProps {
  storeId: number
  qrData: string
  scanType: 'payment' | 'checkin' | 'order'
  onSuccess?: (result: any) => void
}

export const IdempotentQrProcessor = ({
  storeId,
  qrData,
  scanType,
  onSuccess,
}: QrProcessorProps) => {
  const { user } = useAuthStore()

  const qrProcessor = useIdempotentButton(
    async () => {
      if (!user?.userId) {
        throw new Error('사용자 정보가 없습니다.')
      }

      const { qrApi } = await import('@/api/idempotentClient')

      return qrApi.processQrScan({
        userId: user.userId,
        storeId,
        qrData,
        scanType,
      })
    },
    {
      userId: user?.userId,
      storeId,
      action: `qr_process_${scanType}`,
      // data 필드는 지원되지 않음. 필요한 경우 buttonAction 인자로 전달하세요.

      skipIfPending: true,
      retryOnError: true,

      successMessage: 'QR 코드 처리가 완료되었습니다!',
      errorMessage: 'QR 코드 처리 중 오류가 발생했습니다.',

      onSuccess: result => {
        console.log('QR 처리 성공:', result)
        onSuccess?.(result)
      },
    }
  )

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="font-bold text-blue-800">QR 코드 처리</h3>
        <p className="text-blue-600">스캔 타입: {scanType}</p>
      </div>

      {qrProcessor.message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            qrProcessor.messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {qrProcessor.message}
        </div>
      )}

      <button
        onClick={() => qrProcessor.handleClick()}
        disabled={qrProcessor.disabled}
        className={`w-full rounded-lg px-6 py-3 text-white transition-colors ${
          qrProcessor.isSuccess
            ? 'cursor-not-allowed bg-green-600'
            : qrProcessor.isError && qrProcessor.canRetry
              ? 'bg-red-600 hover:bg-red-700'
              : qrProcessor.disabled
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {qrProcessor.getButtonText('QR 코드 처리', 'QR 처리 중...')}
      </button>
    </div>
  )
}
