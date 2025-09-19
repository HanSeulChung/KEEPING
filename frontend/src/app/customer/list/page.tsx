'use client'
<<<<<<< HEAD
import { StoreList } from '@/components/customer/store/StoreList'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') as 'food' | 'life') || 'food'
  const category = searchParams.get('category') || undefined

=======
export const dynamic = 'force-dynamic'
import { StoreList } from '@/components/customer/store/StoreList'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ListContent() {
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') as 'food' | 'life') || 'food'
  const category = searchParams.get('category') || undefined
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
  return (
    <div className="pt-6">
      <StoreList type={type} initialCategory={category} />
    </div>
  )
}
<<<<<<< HEAD
=======

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ListContent />
    </Suspense>
  )
}
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
