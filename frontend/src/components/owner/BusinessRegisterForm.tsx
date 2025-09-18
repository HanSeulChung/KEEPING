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
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}
    if (!businessNumber)
      newErrors.businessNumber = '사업자 등록번호는 필수입니다.'
    if (!openDate) newErrors.openDate = '개업일자는 필수입니다.'
    if (!ceoName) newErrors.ceoName = '대표자 이름은 필수입니다.'
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    // 사업자 등록 확인 API 호출
    setIsVerifying(true)
    try {
      const response = await fetch('/api/business/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessNumber,
          openDate,
          ceoName
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.isValid) {
          alert('사업자 등록 확인이 완료되었습니다.')
          onNext()
        } else {
          alert('사업자 등록 정보가 올바르지 않습니다. 다시 확인해주세요.')
        }
      } else {
        alert('사업자 등록 확인 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('사업자 등록 확인 오류:', error)
      alert('사업자 등록 확인 중 오류가 발생했습니다.')
    } finally {
      setIsVerifying(false)
    }
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
          disabled={isVerifying}
          className="rounded bg-gray-800 px-4 py-2 text-white disabled:opacity-50"
        >
          {isVerifying ? '확인 중...' : '다음'}
        </button>
      </div>
    </form>
  )
}
