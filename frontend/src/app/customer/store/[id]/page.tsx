'use client'
import { StoreDetailPage } from '@/components/customer/store/StoreDetail'
<<<<<<< HEAD

export default function Page({ params }: { params: { id: string } }) {
=======
import { useParams } from 'next/navigation'

export default function Page() {
  const { id } = useParams<{ id: string }>()
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
  return <StoreDetailPage />
}
