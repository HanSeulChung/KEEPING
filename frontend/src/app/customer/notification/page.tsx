'use client'
import CustomerNotificationPage from '@/components/customer/CustomerNotificationPage'
import { Suspense } from 'react'

export default function CustomerNotificationPageRoute() {
  return (
    <Suspense fallback={<div />}>
      <CustomerNotificationPage />
    </Suspense>
  )
}
