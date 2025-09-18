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
