'use client'

import StoreRegisterForm from '@/components/owner/StoreRegisterForm'
import { useRouter } from 'next/navigation'

export default function Step3Page() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-display mb-6 text-2xl font-bold">
        2/2 <br />
        매장 등록
      </h1>
      <StoreRegisterForm onBack={() => router.push('/owner/register/step2')} />
    </main>
  )
}
