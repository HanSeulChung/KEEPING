'use client'

import Header from '@/components/common/Header'
import Navigation from '@/components/common/Navigation'
import PaymentApprovalModal from '@/components/common/PaymentApprovalModal'
import ToastContainer from '@/components/common/ToastContainer'
import { useNotificationSystem } from '@/hooks/useNotificationSystem'
import SWRegister from '@/providers/SWRegister'
import { useSidebarStore } from '@/store/useSidebarStore'
import { usePathname } from 'next/navigation'
import React from 'react'
import PwaProvider from '../providers/PwaProvider'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname()
  const { isOpen } = useSidebarStore()

  // 알림 시스템 훅 (전역 결제 승인 모달용)
  const { paymentApprovalModal, hidePaymentApprovalModal } =
    useNotificationSystem()

  // 네비게이션을 숨겨야 하는 페이지들 (로그인 전 페이지들)
  const hideNavigationPages = ['/', '/owner/login', '/customer/login']

  // customer 페이지들에서만 네비게이션 표시 (로그인/회원가입 페이지 제외)
  const shouldShowNavigation =
    pathname.startsWith('/customer') &&
    !hideNavigationPages.includes(pathname) &&
    !pathname.startsWith('/customer/register')

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

      {/* 전역 결제 승인 모달 - 고객이 어느 페이지에 있든 표시 */}
      {paymentApprovalModal.isOpen && paymentApprovalModal.data && (
        <PaymentApprovalModal
          isOpen={paymentApprovalModal.isOpen}
          onClose={hidePaymentApprovalModal}
          intentId={paymentApprovalModal.data.intentPublicId}
          storeName={paymentApprovalModal.data.storeName}
          amount={paymentApprovalModal.data.amount}
          customerName={paymentApprovalModal.data.customerName}
        />
      )}

      <SWRegister />
    </PwaProvider>
  )
}
