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

  // 실시간 결제 승인 모달 이벤트 감지
  useEffect(() => {
    if (!isCustomerPage) return

    const handlePaymentModal = (event: CustomEvent) => {
      console.log('🎯 결제 모달 이벤트 수신:', event.detail)

      if (!customerPaymentModal.isOpen) {
        setCustomerPaymentModal({
          isOpen: true,
          data: event.detail,
        })
        // 모달 열림 상태 저장
        localStorage.setItem('paymentModalOpen', 'true')
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

  // 기존 알림 기반 모달 표시 (폴백용)
  useEffect(() => {
    if (!isCustomerPage || customerPaymentModal.isOpen) return

    const latestPaymentRequest = notifications
      .filter(n => n.type === 'PAYMENT_REQUEST' && !n.isRead)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]

    if (latestPaymentRequest) {
      const notificationTime = new Date(
        latestPaymentRequest.timestamp
      ).getTime()
      const currentTime = Date.now()
      const timeDiff = currentTime - notificationTime
      const isPaymentValid = timeDiff <= 10 * 60 * 1000 // 10분

      if (isPaymentValid) {
        setCustomerPaymentModal({
          isOpen: true,
          data: {
            intentPublicId:
              latestPaymentRequest.data?.intentId ||
              latestPaymentRequest.data?.intentPublicId,
            customerName: latestPaymentRequest.data?.customerName || '고객',
            amount: latestPaymentRequest.data?.amount || 0,
            storeName: latestPaymentRequest.data?.storeName || '매장',
            items: latestPaymentRequest.data?.items || [],
          },
        })
      }
    }
  }, [notifications, isCustomerPage, customerPaymentModal.isOpen])

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
