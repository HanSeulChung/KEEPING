<<<<<<< HEAD
import StoreManage from '@/components/owner/StoreManage'

export default function StoreManagePage() {
  return <StoreManage />
}
=======
'use client'
import StoreManage from '@/components/owner/StoreManage'
import { Suspense } from 'react'

export default function StoreManagePage() {
  return (
    <Suspense fallback={<div />}>
      <StoreManage />
    </Suspense>
  )
}
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
