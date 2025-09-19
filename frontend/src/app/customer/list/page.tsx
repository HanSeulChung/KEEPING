'use client'
export const dynamic = 'force-dynamic'
import { StoreList } from '@/components/customer/store/StoreList'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ListContent() {
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') as 'food' | 'life') || 'food'
  const category = searchParams.get('category') || undefined
  return (
    <div className="pt-6">
      <StoreList type={type} initialCategory={category} />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ListContent />
    </Suspense>
  )
}
