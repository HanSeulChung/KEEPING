'use client'
import { StoreList } from '@/components/customer/store/StoreList'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') as 'food' | 'life') || 'food'
  const category = searchParams.get('category') || undefined

  return (
    <div className="pt-6">
      <StoreList type={type} initialCategory={category} />
    </div>
  )
}
