'use client'
// 사업자 등록 폼
import { useOwnerRegisterStore } from '@/store/useOwnerRegisterStore'
import { useState } from 'react'

export default function BusinessRegisterForm({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { businessNumber, openDate, ceoName, setRegister } =
    useOwnerRegisterStore()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}
    if (!businessNumber)
      newErrors.businessNumber = '사업자 등록번호는 필수입니다.'
    if (!openDate) newErrors.openDate = '개업일자는 필수입니다.'
    if (!ceoName) newErrors.ceoName = '대표자 이름은 필수입니다.'
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return
    onNext() //
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="사업자 등록번호"
        value={businessNumber}
        onChange={e => setRegister({ businessNumber: e.target.value })}
        className={`rounded border p-2 ${errors.businessNumber ? 'border-red-500' : ''}`}
      />
      {errors.businessNumber && (
        <p className="text-sm text-red-500">{errors.businessNumber}</p>
      )}

      <input
        type="text"
        placeholder="개업일자 (YYYY-MM-DD)"
        value={openDate}
        onChange={e => setRegister({ openDate: e.target.value })}
        className={`rounded border p-2 ${errors.openDate ? 'border-red-500' : ''}`}
      />
      {errors.openDate && (
        <p className="text-sm text-red-500">{errors.openDate}</p>
      )}

      <input
        type="text"
        placeholder="대표자 이름"
        value={ceoName}
        onChange={e => setRegister({ ceoName: e.target.value })}
        className={`rounded border p-2 ${errors.ceoName ? 'border-red-500' : ''}`}
      />
      {errors.ceoName && (
        <p className="text-sm text-red-500">{errors.ceoName}</p>
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
          다음
        </button>
      </div>
    </form>
  )
}
