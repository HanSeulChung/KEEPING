'use client'

import { useEffect, useState } from 'react'

// 결제 상태 타입 정의
interface PaymentIntent {
  intentId: string
  intentPublicId: string
  storeInfo: {
    storeName: string
    amount: number
    customerName?: string
    items?: Array<{
      menuName: string
      unitPrice: number
      quantity: number
      totalPrice: number
    }>
  }
  timestamp: number
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED'
}

// LocalStorage 키 상수
const STORAGE_KEYS = {
  PENDING_PAYMENT: 'pendingPayment',
  PAYMENT_HISTORY: 'paymentHistory'
} as const

/**
 * 고객용 결제 상태 관리 훅
 * - 현재 진행 중인 결제 관리
 * - LocalStorage 백업 및 복구
 * - 만료된 결제 정리
 */
export const usePaymentState = () => {
  const [currentPayment, setCurrentPayment] = useState<PaymentIntent | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 페이지 로드 시 진행 중인 결제 복구
  useEffect(() => {
    const restorePendingPayment = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.PENDING_PAYMENT)
        if (stored) {
          const payment = JSON.parse(stored) as PaymentIntent

          // 3분 이상 된 결제는 만료 처리
          const isExpired = Date.now() - payment.timestamp > 3 * 60 * 1000

          if (isExpired) {
            localStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENT)
          } else {
            setCurrentPayment(payment)
          }
        }
      } catch (error) {
        console.error('진행 중인 결제 복구 실패:', error)
        localStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENT)
      }
    }

    restorePendingPayment()
  }, [])

  // 새로운 결제 의도 저장
  const setPaymentIntent = (
    intentPublicId: string,
    storeInfo: PaymentIntent['storeInfo'],
    intentId?: string
  ) => {
    const payment: PaymentIntent = {
      intentId: intentId || intentPublicId, // intentId가 없으면 intentPublicId 사용
      intentPublicId,
      storeInfo,
      timestamp: Date.now(),
      status: 'PENDING'
    }

    // 메모리에 저장
    setCurrentPayment(payment)

    // LocalStorage에 백업
    try {
      localStorage.setItem(STORAGE_KEYS.PENDING_PAYMENT, JSON.stringify(payment))
    } catch (error) {
      console.error('결제 정보 저장 실패:', error)
    }
  }

  // 결제 상태 업데이트
  const updatePaymentStatus = (status: PaymentIntent['status']) => {
    if (currentPayment) {
      const updatedPayment = { ...currentPayment, status }
      setCurrentPayment(updatedPayment)

      try {
        if (status === 'PENDING') {
          // PENDING 상태는 계속 저장
          localStorage.setItem(STORAGE_KEYS.PENDING_PAYMENT, JSON.stringify(updatedPayment))
        } else {
          // 완료된 결제는 히스토리로 이동
          moveToHistory(updatedPayment)
        }
      } catch (error) {
        console.error('결제 상태 업데이트 실패:', error)
      }
    }
  }

  // 결제 정보 정리 (완료/취소 후)
  const clearPaymentIntent = () => {
    setCurrentPayment(null)
    try {
      localStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENT)
    } catch (error) {
      console.error('결제 정보 정리 실패:', error)
    }
  }

  // 히스토리로 이동
  const moveToHistory = (payment: PaymentIntent) => {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY) || '[]')
      history.push(payment)

      // 최대 50개까지만 보관
      if (history.length > 50) {
        history.splice(0, history.length - 50)
      }

      localStorage.setItem(STORAGE_KEYS.PAYMENT_HISTORY, JSON.stringify(history))
      localStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENT)
    } catch (error) {
      console.error('히스토리 저장 실패:', error)
    }
  }

  // 만료된 결제 정리
  const cleanupExpiredPayments = () => {
    try {
      // 진행 중인 결제 만료 체크
      if (currentPayment) {
        const isExpired = Date.now() - currentPayment.timestamp > 3 * 60 * 1000
        if (isExpired) {
          updatePaymentStatus('EXPIRED')
          clearPaymentIntent()
        }
      }

      // 히스토리에서 오래된 항목 제거 (7일)
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY) || '[]')
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const cleaned = history.filter((payment: PaymentIntent) => payment.timestamp > weekAgo)

      if (cleaned.length !== history.length) {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_HISTORY, JSON.stringify(cleaned))
      }
    } catch (error) {
      console.error('만료된 결제 정리 실패:', error)
    }
  }

  // 결제 히스토리 조회
  const getPaymentHistory = (): PaymentIntent[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY) || '[]')
    } catch (error) {
      console.error('결제 히스토리 조회 실패:', error)
      return []
    }
  }

  // 정기적인 정리 작업 (5분마다)
  useEffect(() => {
    const interval = setInterval(cleanupExpiredPayments, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [currentPayment])

  return {
    // 상태
    currentPayment,
    isLoading,

    // 액션
    setPaymentIntent,
    updatePaymentStatus,
    clearPaymentIntent,
    cleanupExpiredPayments,

    // 조회
    getPaymentHistory,

    // 유틸리티
    hasCurrentPayment: !!currentPayment,
    isPaymentExpired: currentPayment
      ? Date.now() - currentPayment.timestamp > 3 * 60 * 1000
      : false
  }
}

export default usePaymentState