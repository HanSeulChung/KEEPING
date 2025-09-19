'use client'
import NotificationPage from '@/components/owner/NotificationPage'
import { Suspense } from 'react'

export default function NotificationPageRoute() {
  return (
    <Suspense fallback={<div />}>
      <NotificationPage />
    </Suspense>
  )
}
