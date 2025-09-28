'use client'

import { Modal } from '@/components/ui/Modal'
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
  onSave: (data: { chargeAmount: number; bonusPercentage: number }) => void
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

    if (formData.chargeAmount < 1000) {
      newErrors.chargeAmount = '충전 금액은 최소 1,000원 이상이어야 합니다'
    }

    // 수정 모드가 아닐 때만 보너스 퍼센트 검증
    if (
      mode === 'add' &&
      (formData.bonusPercentage < 1 || formData.bonusPercentage > 100)
    ) {
      newErrors.bonusPercentage = '보너스 퍼센트는 1~100% 사이여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // expectedTotalPoints는 API에 전송하지 않음 (백엔드에서 계산)
      const dataToSave = {
        chargeAmount: formData.chargeAmount,
        bonusPercentage: formData.bonusPercentage,
      }
      onSave(dataToSave)
      onClose()
    }
  }

  const handleInputChange = (field: keyof ChargeBonusData, value: string) => {
    // 수정 모드일 때 보너스 퍼센트는 변경 불가
    if (mode === 'edit' && field === 'bonusPercentage') {
      return
    }

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? '충전 보너스 수정' : '충전 보너스 추가'}
      height="h-[500px]"
      variant="owner"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 충전 금액 */}
        <div>
          <label className="font-nanum-square-round-eb mb-1 block text-sm leading-[140%] font-bold text-gray-700">
            충전 금액 (원)
          </label>
          <input
            type="number"
            min="1000"
            value={formData.chargeAmount || ''}
            onChange={e => handleInputChange('chargeAmount', e.target.value)}
            className={`font-nanum-square-round-eb w-full rounded-[10px] border px-3 py-2 ${
              errors.chargeAmount ? 'border-red-500' : 'border-gray-300'
            } focus:border-[#76d4ff] focus:outline-none`}
            placeholder="최소 1,000원 이상 입력하세요"
          />
          {errors.chargeAmount && (
            <p className="font-nanum-square-round-eb mt-1 text-xs leading-[140%] text-red-500">
              {errors.chargeAmount}
            </p>
          )}
        </div>

        {/* 보너스 퍼센트 */}
        <div>
          <label className="font-nanum-square-round-eb mb-1 block text-sm leading-[140%] font-bold text-gray-700">
            보너스 퍼센트 (%)
          </label>
          {mode === 'edit' ? (
            <div className="font-nanum-square-round-eb w-full rounded-[10px] border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600">
              {formData.bonusPercentage}%
            </div>
          ) : (
            <input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={formData.bonusPercentage || ''}
              onChange={e =>
                handleInputChange('bonusPercentage', e.target.value)
              }
              className={`font-nanum-square-round-eb w-full rounded-[10px] border px-3 py-2 ${
                errors.bonusPercentage ? 'border-red-500' : 'border-gray-300'
              } focus:border-[#76d4ff] focus:outline-none`}
              placeholder="1~100% 사이로 입력하세요"
            />
          )}
          {mode === 'edit' && (
            <p className="font-nanum-square-round-eb mt-1 text-xs leading-[140%] text-gray-500">
              보너스 퍼센트는 수정할 수 없습니다
            </p>
          )}
          {mode === 'add' && errors.bonusPercentage && (
            <p className="font-nanum-square-round-eb mt-1 text-xs leading-[140%] text-red-500">
              {errors.bonusPercentage}
            </p>
          )}
        </div>

        {/* 예상 총 포인트 (읽기 전용) */}
        <div>
          <label className="font-nanum-square-round-eb mb-1 block text-sm leading-[140%] font-bold text-gray-700">
            예상 총 포인트
          </label>
          <div className="font-nanum-square-round-eb w-full rounded-[10px] border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600">
            {Number(formData.expectedTotalPoints).toLocaleString()}P
          </div>
          <p className="font-nanum-square-round-eb mt-1 text-xs leading-[140%] text-gray-500">
            충전 금액 + 보너스로 자동 계산됩니다
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="font-nanum-square-round-eb rounded-[10px] bg-gray-200 px-4 py-2 leading-[140%] font-bold transition-colors hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            className="font-jalnan rounded-[10px] bg-[#76d4ff] px-4 py-2 leading-[140%] text-white transition-colors hover:bg-[#5bb3e6]"
          >
            {mode === 'edit' ? '수정' : '추가'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ChargeBonusModal
