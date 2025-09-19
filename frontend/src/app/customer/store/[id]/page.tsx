'use client'
import { StoreDetailPage } from '@/components/customer/store/StoreDetail'
import { useParams } from 'next/navigation'

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <StoreDetailPage />
}
