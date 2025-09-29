'use client'

import Header from '@/components/common/Header'
import Navigation from '@/components/common/Navigation'
import PaymentApprovalModal from '@/components/common/PaymentApprovalModal'
import ToastContainer from '@/components/common/ToastContainer'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import SWRegister from '@/providers/SWRegister'
import { useSidebarStore } from '@/store/useSidebarStore'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import PwaProvider from '../providers/PwaProvider'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname()
  const { isOpen } = useSidebarStore()
  const { notifications } = useNotificationSystem()

  // 고객 전용 결제 승인 모달 상태
  const [customerPaymentModal, setCustomerPaymentModal] = useState<{
    isOpen: boolean
    data?: {
      intentPublicId?: string
      customerName?: string
      amount?: number
      storeName?: string
      items?: Array<{
        name: string
        quantity: number
        price: number
      }>
    }
  }>({ isOpen: false })

  // 네비게이션을 숨겨야 하는 페이지들 (로그인 전 페이지들)
  const hideNavigationPages = ['/', '/owner/login', '/customer/login']

  // customer 페이지들에서만 네비게이션 표시 (로그인/회원가입 페이지 제외)
  const shouldShowNavigation =
    pathname.startsWith('/customer') &&
    !hideNavigationPages.includes(pathname) &&
    !pathname.startsWith('/customer/register')

  // 고객 페이지인지 확인
  const isCustomerPage =
    pathname.startsWith('/customer') && !hideNavigationPages.includes(pathname)

  // 강화된 중복 방지 결제 승인 모달 이벤트 감지
  useEffect(() => {
    if (!isCustomerPage) return

    const handlePaymentModal = (event: CustomEvent) => {
      const intentId = event.detail?.intentPublicId || event.detail?.intentId
      console.log('🎯 결제 모달 이벤트 수신:', {
        intentId,
        detail: event.detail,
      })

      // 1. 이미 모달이 열려있으면 무시
      if (customerPaymentModal.isOpen) {
        console.log('🚫 결제 모달이 이미 열려있어 무시합니다')
        return
      }

      // 2. localStorage 글로벌 체크 - 중복 방지
      const isModalOpen = localStorage.getItem('paymentModalOpen')
      if (isModalOpen === 'true') {
        console.log('🚫 결제 모달이 이미 다른 곳에서 열려있어 무시합니다')
        return
      }

      // 3. 같은 결제 ID로 이미 처리된 경우 무시
      if (intentId) {
        const approvedPayments = JSON.parse(
          localStorage.getItem('approvedPayments') || '[]'
        )
        if (approvedPayments.includes(String(intentId))) {
          console.log('🚫 이미 승인된 결제라서 무시합니다:', intentId)
          return
        }
      }

      // 4. 최근 동일한 이벤트 무시 (3초 내 중복)
      const lastEventKey = localStorage.getItem('lastPaymentModalEvent')
      const lastEventTime = localStorage.getItem('lastPaymentModalTime')

      if (lastEventKey && lastEventTime && intentId) {
        const timeDiff = Date.now() - parseInt(lastEventTime)
        if (timeDiff < 3000 && lastEventKey === String(intentId)) {
          console.log('🚫 최근 동일한 결제 요청이라서 무시합니다:', intentId)
          return
        }
      }

      console.log('✅ 결제 모달 열기 승인됨')
      setCustomerPaymentModal({
        isOpen: true,
        data: event.detail,
      })

      // 중복 방지 플래그들 설정
      localStorage.setItem('paymentModalOpen', 'true')
      if (intentId) {
        localStorage.setItem('lastPaymentModalEvent', String(intentId))
        localStorage.setItem('lastPaymentModalTime', Date.now().toString())
      }
    }

    window.addEventListener(
      'showPaymentModal',
      handlePaymentModal as EventListener
    )

    return () => {
      window.removeEventListener(
        'showPaymentModal',
        handlePaymentModal as EventListener
      )
    }
  }, [isCustomerPage, customerPaymentModal.isOpen])

  // 폴백 로직 제거 - SSE 이벤트만 사용하여 중복 모달 방지

  return (
    <PwaProvider>
      {/* 헤더를 항상 표시 */}
      <Header />

      {/* 로그인 후 페이지에서만 네비게이션 표시 */}
      {shouldShowNavigation && <Navigation />}

      {/* 페이지별 컨텐츠 */}
      <main
        className={`min-h-screen ${shouldShowNavigation ? `pb-16 md:pb-0 ${isOpen ? 'md:ml-64' : 'md:ml-16'}` : ''}`}
      >
        {children}
      </main>

      {/* 토스트 알림 컨테이너 */}
      <ToastContainer />

      {/* 고객 전용 결제 승인 모달 - 고객 페이지에서만 표시 */}
      {isCustomerPage &&
        customerPaymentModal.isOpen &&
        customerPaymentModal.data && (
          <PaymentApprovalModal
            isOpen={customerPaymentModal.isOpen}
            onClose={() => {
              setCustomerPaymentModal({ isOpen: false })
              // 모달 닫힘 상태 저장
              localStorage.removeItem('paymentModalOpen')
            }}
            intentId={customerPaymentModal.data.intentPublicId}
            storeName={customerPaymentModal.data.storeName}
            amount={customerPaymentModal.data.amount}
            customerName={customerPaymentModal.data.customerName}
            items={customerPaymentModal.data.items}
          />
        )}

      <SWRegister />
    </PwaProvider>
  )
}
