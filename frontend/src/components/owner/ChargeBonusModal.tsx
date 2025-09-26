'use client'

import { useEffect, useState } from 'react'

interface ChargeBonusData {
  id?: number | string
  chargeAmount: number
  bonusPercentage: number
  expectedTotalPoints: number
}

interface ChargeBonusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ChargeBonusData) => void
  editData?: ChargeBonusData | null
  mode: 'add' | 'edit'
}

const ChargeBonusModal = ({
  isOpen,
  onClose,
  onSave,
  editData,
  mode,
}: ChargeBonusModalProps) => {
  const [formData, setFormData] = useState<ChargeBonusData>({
    chargeAmount: 0,
    bonusPercentage: 0,
    expectedTotalPoints: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 모달이 열릴 때 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData)
      } else {
        setFormData({
          chargeAmount: 0,
          bonusPercentage: 0,
          expectedTotalPoints: 0,
        })
      }
      setErrors({})
    }
  }, [isOpen, editData])

  // 예상 총 포인트 자동 계산
  useEffect(() => {
    const chargeAmount = Number(formData.chargeAmount) || 0
    const bonusPercentage = Number(formData.bonusPercentage) || 0
    const calculatedPoints =
      chargeAmount + (chargeAmount * bonusPercentage) / 100

    console.log('포인트 계산:', {
      chargeAmount,
      bonusPercentage,
      calculatedPoints,
    })

    setFormData(prev => ({
      ...prev,
      expectedTotalPoints: Math.round(calculatedPoints),
    }))
  }, [formData.chargeAmount, formData.bonusPercentage])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.chargeAmount <= 0) {
      newErrors.chargeAmount = '충전 금액은 0보다 커야 합니다'
    }

    if (formData.bonusPercentage < 0 || formData.bonusPercentage > 100) {
      newErrors.bonusPercentage = '보너스 퍼센트는 0~100 사이여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const handleInputChange = (field: keyof ChargeBonusData, value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData(prev => ({
      ...prev,
      [field]: numValue,
    }))

    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-6 font-['nanumsquare'] text-xl font-bold">
          {mode === 'edit' ? '충전 보너스 수정' : '충전 보너스 추가'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 충전 금액 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              충전 금액 (원)
            </label>
            <input
              type="number"
              value={formData.chargeAmount || ''}
              onChange={e => handleInputChange('chargeAmount', e.target.value)}
              className={`w-full rounded-md border px-3 py-2 ${
                errors.chargeAmount ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:outline-none`}
              placeholder="충전 금액을 입력하세요"
            />
            {errors.chargeAmount && (
              <p className="mt-1 text-xs text-red-500">{errors.chargeAmount}</p>
            )}
          </div>

          {/* 보너스 퍼센트 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              보너스 퍼센트 (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.bonusPercentage || ''}
              onChange={e =>
                handleInputChange('bonusPercentage', e.target.value)
              }
              className={`w-full rounded-md border px-3 py-2 ${
                errors.bonusPercentage ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:outline-none`}
              placeholder="보너스 퍼센트를 입력하세요"
            />
            {errors.bonusPercentage && (
              <p className="mt-1 text-xs text-red-500">
                {errors.bonusPercentage}
              </p>
            )}
          </div>

          {/* 예상 총 포인트 (읽기 전용) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              예상 총 포인트
            </label>
            <div className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600">
              {Number(formData.expectedTotalPoints).toLocaleString()}P
            </div>
            <p className="mt-1 text-xs text-gray-500">
              충전 금액 + 보너스로 자동 계산됩니다
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-300 px-4 py-2 font-['nanumsquare'] font-bold hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 font-['nanumsquare'] font-bold text-white hover:bg-gray-800"
            >
              {mode === 'edit' ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChargeBonusModal
