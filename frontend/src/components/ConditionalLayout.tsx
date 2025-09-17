'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/common/Header'
import SWRegister from '@/providers/SWRegister'
import MSWProvider from '../providers/MSWProvider'
import AuthProvider from '../providers/AuthProvider'
import PwaProvider from '../providers/PwaProvider'
import NotificationTestButton from '@/components/NotificationTestButton'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Calendar 페이지에서는 헤더를 숨김
  const isCalendarPage = pathname === '/owner/calendar'
  
  return (
    <MSWProvider>
      <AuthProvider>
        <PwaProvider>
          {/* Calendar 페이지가 아닐 때만 헤더 표시 */}
          {!isCalendarPage && <Header />}

          {/* 페이지별 컨텐츠 */}
          <main className="min-h-screen">{children}</main>
          <SWRegister />
          
          {/* 개발용 테스트 버튼 */}
          <NotificationTestButton />
        </PwaProvider>
      </AuthProvider>
    </MSWProvider>
  )
}
