'use client'

import apiClient from '@/api/axios'
import { deleteChargeBonus, updateChargeBonus } from '@/api/storeApi'
import { useEffect, useState } from 'react'
import ChargeBonusModal from './ChargeBonusModal'

interface ChargeBonusData {
  id?: number | string
  chargeAmount: number
  bonusPercentage: number
  expectedTotalPoints: number
}

interface ChargeBonusManagementProps {
  storeId: string
}

export default function ChargeBonusManagement({
  storeId,
}: ChargeBonusManagementProps) {
  const [chargeBonusData, setChargeBonusData] = useState<ChargeBonusData[]>([])
  const [loading, setLoading] = useState(false)
  const [showChargeBonusModal, setShowChargeBonusModal] = useState(false)
  const [editingChargeBonus, setEditingChargeBonus] =
    useState<ChargeBonusData | null>(null)

  // 충전 보너스 데이터 조회
  const fetchChargeBonusData = async () => {
    if (!storeId) return

    setLoading(true)
    try {
      console.log('충전 보너스 조회 시작 - storeId:', storeId)
      const response = await apiClient.get(
        `/owners/stores/${storeId}/charge-bonus`
      )
      console.log('충전 보너스 조회 응답:', response.data)

      if (response.data.success) {
        const data = response.data.data || []
        console.log('원본 충전 보너스 데이터:', data)

        const validData = Array.isArray(data)
          ? data
              .map(item => {
                console.log('개별 아이템:', item)

                // 데이터 정규화 및 포인트 계산
                const chargeAmount = Number(item.chargeAmount) || 0
                const bonusPercentage = Number(item.bonusPercentage) || 0
                const expectedTotalPoints =
                  chargeAmount + (chargeAmount * bonusPercentage) / 100

                console.log('계산된 값들:', {
                  chargeAmount,
                  bonusPercentage,
                  expectedTotalPoints,
                })

                return {
                  ...item,
                  chargeAmount,
                  bonusPercentage,
                  expectedTotalPoints,
                }
              })
              .filter(
                item =>
                  item && typeof item === 'object' && item.chargeAmount > 0
              )
          : []

        console.log('최종 처리된 데이터:', validData)
        setChargeBonusData(validData)
      } else {
        console.error('충전 보너스 조회 실패:', response.data.message)
        setChargeBonusData([])
      }
    } catch (error: any) {
      console.error('충전 보너스 데이터 조회 실패:', error)
      setChargeBonusData([])
    } finally {
      setLoading(false)
    }
  }

  // 충전 보너스 삭제
  const handleDeleteChargeBonus = async (chargeBonusId: number) => {
    if (!storeId || !chargeBonusId) return

    const bonusToDelete = chargeBonusData.find(
      bonus => Number(bonus.id) === chargeBonusId
    )
    const confirmMessage = bonusToDelete
      ? `${Number(bonusToDelete.chargeAmount).toLocaleString()}원 결제 시 +${bonusToDelete.bonusPercentage}% 보너스 설정을 삭제하시겠습니까?`
      : '정말로 이 충전 보너스를 삭제하시겠습니까?'

    if (confirm(confirmMessage)) {
      try {
        const response = await deleteChargeBonus(
          parseInt(storeId),
          chargeBonusId
        )

        if (response.success) {
          alert('충전 보너스가 삭제되었습니다.')
          fetchChargeBonusData() // 목록 새로고침
        } else {
          alert(`삭제 실패: ${response.message}`)
        }
      } catch (error) {
        console.error('충전 보너스 삭제 실패:', error)
        alert('충전 보너스 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  // 충전 보너스 수정
  const handleEditChargeBonus = (chargeBonus: ChargeBonusData) => {
    setEditingChargeBonus(chargeBonus)
    setShowChargeBonusModal(true)
  }

  // 충전 보너스 저장 (추가/수정)
  const handleSaveChargeBonus = async (data: {
    chargeAmount: number
    bonusPercentage: number
  }) => {
    try {
      if (editingChargeBonus && editingChargeBonus.id) {
        // 수정
        const response = await updateChargeBonus(
          parseInt(storeId),
          Number(editingChargeBonus.id),
          data
        )

        if (response.success) {
          alert('충전 보너스가 수정되었습니다.')
          setShowChargeBonusModal(false)
          setEditingChargeBonus(null)
          fetchChargeBonusData()
        } else {
          alert(`수정 실패: ${response.message}`)
        }
      } else {
        // 추가 - 기존 로직 사용
        const response = await apiClient.post(
          `/owners/stores/${storeId}/charge-bonus`,
          data
        )

        if (response.data.success) {
          alert('충전 보너스가 추가되었습니다.')
          setShowChargeBonusModal(false)
          fetchChargeBonusData()
        } else {
          alert(`추가 실패: ${response.data.message}`)
        }
      }
    } catch (error: any) {
      console.error('충전 보너스 저장 실패:', error)
      alert('충전 보너스 저장 중 오류가 발생했습니다.')
    }
  }

  useEffect(() => {
    if (storeId) {
      fetchChargeBonusData()
    }
  }, [storeId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="font-['nanumsquare'] text-lg">
          충전 보너스 로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 설명 섹션 */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 font-['nanumsquare'] text-lg font-bold">
          충전 보너스 설정
        </h3>
        <p className="font-['nanumsquare'] text-sm text-gray-600">
          고객이 일정 금액을 결제하면 추가 포인트를 제공하는 보너스를 설정할 수
          있습니다.
          <br />
          예: 10,000원 결제 시 +10% 보너스 = 11,000 포인트 지급
        </p>
      </div>

      {/* 충전 보너스 추가 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingChargeBonus(null)
            setShowChargeBonusModal(true)
          }}
          className="rounded-lg bg-black px-6 py-3 font-['nanumsquare'] font-bold text-white transition-colors hover:bg-gray-800"
        >
          충전 보너스 추가
        </button>
      </div>

      {/* 충전 보너스 목록 */}
      <div className="space-y-3">
        {chargeBonusData.map(bonus => (
          <div
            key={bonus.id}
            className="flex items-center justify-between border-2 border-black bg-white p-4"
          >
            <div className="flex items-center gap-8">
              <div className="font-['nanumsquare'] text-lg font-bold text-black">
                {(Number(bonus.chargeAmount) || 0).toLocaleString()}원 결제
              </div>
              <div className="font-['nanumsquare'] text-lg font-bold text-blue-600">
                +{Number(bonus.bonusPercentage) || 0}% 보너스
              </div>
              <div className="font-['nanumsquare'] text-lg font-bold text-green-600">
                = {(Number(bonus.expectedTotalPoints) || 0).toLocaleString()}{' '}
                포인트
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditChargeBonus(bonus)}
                className="rounded-md border border-black px-4 py-2 font-['nanumsquare'] font-bold transition-colors hover:bg-gray-100"
              >
                변경하기
              </button>
              <button
                onClick={() => handleDeleteChargeBonus(Number(bonus.id))}
                className="rounded-md border border-red-500 px-4 py-2 font-['nanumsquare'] font-bold text-red-500 transition-colors hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 충전 보너스가 없을 때 */}
      {chargeBonusData.length === 0 && (
        <div className="py-12 text-center">
          <p className="mb-4 text-gray-500">등록된 충전 보너스가 없습니다.</p>
          <button
            onClick={() => {
              setEditingChargeBonus(null)
              setShowChargeBonusModal(true)
            }}
            className="rounded-lg bg-black px-6 py-3 font-['nanumsquare'] font-bold text-white"
          >
            첫 번째 충전 보너스 추가하기
          </button>
        </div>
      )}

      {/* 충전 보너스 모달 */}
      <ChargeBonusModal
        isOpen={showChargeBonusModal}
        onClose={() => {
          setShowChargeBonusModal(false)
          setEditingChargeBonus(null)
        }}
        onSave={handleSaveChargeBonus}
        editData={editingChargeBonus}
        mode={editingChargeBonus ? 'edit' : 'add'}
      />
    </div>
  )
}
