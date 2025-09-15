'use client'

import UserRegisterForm from '@/components/owner/UserRegisterForm'
import { useRouter } from 'next/navigation'

export default function Step1Page() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-display mb-6 text-center text-2xl font-bold">
        사용자 등록
      </h1>
      <UserRegisterForm onNext={() => router.push('/owner/register/step2')} />
    </main>
  )
}
