'use client'

import { useOwnerRegisterStore } from '@/store/useOwnerRegisterStore'
import { useState } from 'react'

export default function StoreRegisterForm({ onBack }: { onBack: () => void }) {
  const {
    category,
    address,
    description,
    accountNumber,
    storeImgUrl,
    setRegister,
    resetRegister,
  } = useOwnerRegisterStore()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { [key: string]: string } = {}
    if (!category) newErrors.category = '업종은 필수입니다.'
    if (!address) newErrors.address = '주소는 필수입니다.'
    if (!description) newErrors.description = '매장 소개는 필수입니다.'
    if (!accountNumber) newErrors.accountNumber = '정산 계좌는 필수입니다.'
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    const body = useOwnerRegisterStore.getState()

    try {
      const res = await fetch('/api/owner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        alert('회원가입 성공!')
        resetRegister()
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error(err)
      alert('서버 오류가 발생했습니다.')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-display mb-6 text-2xl font-bold">
        2/2 <br />
        매장 등록
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="업종"
          value={category}
          onChange={e => setRegister({ category: e.target.value })}
          className={`rounded border p-2 ${errors.category ? 'border-red-500' : ''}`}
        />
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category}</p>
        )}

        <input
          type="text"
          placeholder="주소"
          value={address}
          onChange={e => setRegister({ address: e.target.value })}
          className={`rounded border p-2 ${errors.address ? 'border-red-500' : ''}`}
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address}</p>
        )}

        <textarea
          placeholder="매장 소개"
          value={description}
          onChange={e => setRegister({ description: e.target.value })}
          className={`rounded border p-2 ${errors.description ? 'border-red-500' : ''}`}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}

        <input
          type="text"
          placeholder="정산 계좌번호"
          value={accountNumber}
          onChange={e => setRegister({ accountNumber: e.target.value })}
          className={`rounded border p-2 ${errors.accountNumber ? 'border-red-500' : ''}`}
        />
        {errors.accountNumber && (
          <p className="text-sm text-red-500">{errors.accountNumber}</p>
        )}

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded border px-4 py-2"
          >
            이전
          </button>
          <button
            type="submit"
            className="rounded bg-gray-800 px-4 py-2 text-white"
          >
            제출
          </button>
        </div>
      </form>
    </main>
  )
}
