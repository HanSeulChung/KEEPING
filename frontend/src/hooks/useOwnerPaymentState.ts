'use client'

import { useEffect, useState } from 'react'

// 점주용 결제 상태 타입 정의
interface OwnerPaymentIntent {
  intentId: string
  intentPublicId: string
  customerId: number
  customerName: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'COMPLETED' | 'CANCELED'
  createdAt: string
  expiresAt: string
  approvedAt?: string
  declinedAt?: string
  canceledAt?: string
  completedAt?: string
  items: Array<{
    menuId: number
    name: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }>
  timestamp: number // 로컬 저장용
}

// LocalStorage 키 상수
const STORAGE_KEYS = {
  ACTIVE_PAYMENTS: 'ownerActivePayments',
  PAYMENT_HISTORY: 'ownerPaymentHistory'
} as const

/**
 * 점주용 결제 상태 관리 훅
 * - 활성 결제 목록 관리
 * - 결제 상태 추적
 * - LocalStorage 백업 및 복구
 * - 완료된 결제 정리
 */
export const useOwnerPaymentState = () => {
  const [activePayments, setActivePayments] = useState<OwnerPaymentIntent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 페이지 로드 시 활성 결제 목록 복구
  useEffect(() => {
    const restoreActivePayments = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_PAYMENTS)
        if (stored) {
          const payments = JSON.parse(stored) as OwnerPaymentIntent[]

          // 만료된 결제들 필터링 (24시간 이상 된 것)
          const now = Date.now()
          const validPayments = payments.filter(payment => {
            const isRecent = now - payment.timestamp < 24 * 60 * 60 * 1000 // 24시간
            return isRecent && (payment.status === 'PENDING' || payment.status === 'APPROVED')
          })

          setActivePayments(validPayments)

          // 유효하지 않은 결제들이 있다면 스토리지 업데이트
          if (validPayments.length !== payments.length) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_PAYMENTS, JSON.stringify(validPayments))
          }
        }
      } catch (error) {
        console.error('활성 결제 목록 복구 실패:', error)
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PAYMENTS)
      }
    }

    restoreActivePayments()
  }, [])

  // 새로운 결제 의도 추가
  const addPaymentIntent = (paymentData: Omit<OwnerPaymentIntent, 'timestamp'>) => {
    const payment: OwnerPaymentIntent = {
      ...paymentData,
      timestamp: Date.now()
    }

    // 메모리에 추가
    setActivePayments(prev => {
      // 중복 체크 (intentId 또는 intentPublicId 기준)
      const exists = prev.some(p =>
        p.intentId === payment.intentId ||
        p.intentPublicId === payment.intentPublicId
      )

      if (exists) {
        console.log('이미 존재하는 결제 의도:', payment.intentId)
        return prev
      }

      const updated = [payment, ...prev]

      // LocalStorage에 백업
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PAYMENTS, JSON.stringify(updated))
      } catch (error) {
        console.error('활성 결제 목록 저장 실패:', error)
      }

      return updated
    })

    console.log('💰 새로운 결제 의도 추가됨:', {
      intentId: payment.intentId,
      customerName: payment.customerName,
      amount: payment.amount
    })
  }

  // 결제 상태 업데이트
  const updatePaymentStatus = (
    intentId: string,
    status: OwnerPaymentIntent['status'],
    additionalData?: Partial<OwnerPaymentIntent>
  ) => {
    setActivePayments(prev => {
      const updated = prev.map(payment => {
        if (payment.intentId === intentId || payment.intentPublicId === intentId) {
          const updatedPayment = {
            ...payment,
            status,
            ...additionalData,
            timestamp: Date.now() // 업데이트 시간 갱신
          }

          // 완료된 결제는 히스토리로 이동
          if (status === 'COMPLETED' || status === 'CANCELED' || status === 'DECLINED') {
            moveToHistory(updatedPayment)
          }

          return updatedPayment
        }
        return payment
      })

      // 완료된 결제들 제거
      const activeOnly = updated.filter(payment =>
        payment.status === 'PENDING' || payment.status === 'APPROVED'
      )

      // LocalStorage 업데이트
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PAYMENTS, JSON.stringify(activeOnly))
      } catch (error) {
        console.error('결제 상태 업데이트 실패:', error)
      }

      return activeOnly
    })
  }

  // 특정 결제 조회
  const getPayment = (intentId: string): OwnerPaymentIntent | null => {
    return activePayments.find(payment =>
      payment.intentId === intentId || payment.intentPublicId === intentId
    ) || null
  }

  // 고객별 활성 결제 조회
  const getPaymentsByCustomer = (customerId: number): OwnerPaymentIntent[] => {
    return activePayments.filter(payment => payment.customerId === customerId)
  }

  // 상태별 결제 조회
  const getPaymentsByStatus = (status: OwnerPaymentIntent['status']): OwnerPaymentIntent[] => {
    return activePayments.filter(payment => payment.status === status)
  }

  // 결제 제거 (강제 삭제)
  const removePayment = (intentId: string) => {
    setActivePayments(prev => {
      const updated = prev.filter(payment =>
        payment.intentId !== intentId && payment.intentPublicId !== intentId
      )

      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PAYMENTS, JSON.stringify(updated))
      } catch (error) {
        console.error('결제 제거 실패:', error)
      }

      return updated
    })
  }

  // 히스토리로 이동
  const moveToHistory = (payment: OwnerPaymentIntent) => {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY) || '[]')
      history.push(payment)

      // 최대 100개까지만 보관
      if (history.length > 100) {
        history.splice(0, history.length - 100)
      }

      localStorage.setItem(STORAGE_KEYS.PAYMENT_HISTORY, JSON.stringify(history))
    } catch (error) {
      console.error('히스토리 저장 실패:', error)
    }
  }

  // 만료된 결제 정리
  const cleanupExpiredPayments = () => {
    setActivePayments(prev => {
      const now = Date.now()
      const cleaned = prev.filter(payment => {
        // 24시간 이상 된 결제는 만료 처리
        const isExpired = now - payment.timestamp > 24 * 60 * 60 * 1000

        if (isExpired) {
          // 만료된 결제는 히스토리로 이동
          moveToHistory({
            ...payment,
            status: 'EXPIRED'
          })
          return false
        }

        return true
      })

      if (cleaned.length !== prev.length) {
        try {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_PAYMENTS, JSON.stringify(cleaned))
        } catch (error) {
          console.error('만료된 결제 정리 실패:', error)
        }
      }

      return cleaned
    })

    // 히스토리에서 오래된 항목 제거 (30일)
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY) || '[]')
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      const cleaned = history.filter((payment: OwnerPaymentIntent) => payment.timestamp > monthAgo)

      if (cleaned.length !== history.length) {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_HISTORY, JSON.stringify(cleaned))
      }
    } catch (error) {
      console.error('히스토리 정리 실패:', error)
    }
  }

  // 결제 히스토리 조회
  const getPaymentHistory = (): OwnerPaymentIntent[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY) || '[]')
    } catch (error) {
      console.error('결제 히스토리 조회 실패:', error)
      return []
    }
  }

  // 통계 계산
  const getStatistics = () => {
    const pending = activePayments.filter(p => p.status === 'PENDING').length
    const approved = activePayments.filter(p => p.status === 'APPROVED').length
    const totalAmount = activePayments.reduce((sum, p) => sum + p.amount, 0)

    return {
      totalActive: activePayments.length,
      pending,
      approved,
      totalAmount
    }
  }

  // 정기적인 정리 작업 (10분마다)
  useEffect(() => {
    const interval = setInterval(cleanupExpiredPayments, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    // 상태
    activePayments,
    isLoading,

    // 액션
    addPaymentIntent,
    updatePaymentStatus,
    removePayment,
    cleanupExpiredPayments,

    // 조회
    getPayment,
    getPaymentsByCustomer,
    getPaymentsByStatus,
    getPaymentHistory,
    getStatistics,

    // 유틸리티
    hasActivePayments: activePayments.length > 0,
    pendingCount: activePayments.filter(p => p.status === 'PENDING').length,
    approvedCount: activePayments.filter(p => p.status === 'APPROVED').length
  }
}

export default useOwnerPaymentState