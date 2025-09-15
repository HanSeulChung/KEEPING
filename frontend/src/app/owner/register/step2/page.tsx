'use client'

import BusinessRegisterForm from '@/components/owner/BusinessRegisterForm'
import { useRouter } from 'next/navigation'

export default function Step2Page() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-display mb-6 text-2xl font-bold">
        1/2
        <br />
        사업자 인증
      </h1>
      <BusinessRegisterForm
        onNext={() => router.push('/owner/register/step3')}
        onBack={() => router.push('/owner/register/step1')}
      />
    </main>
  )
}
