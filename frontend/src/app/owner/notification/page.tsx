<<<<<<< HEAD
import NotificationPage from '@/components/owner/NotificationPage'

export default function NotificationPageRoute() {
  return <NotificationPage />
=======
'use client'
import NotificationPage from '@/components/owner/NotificationPage'
import { Suspense } from 'react'

export default function NotificationPageRoute() {
  return (
    <Suspense fallback={<div />}>
      <NotificationPage />
    </Suspense>
  )
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
}
