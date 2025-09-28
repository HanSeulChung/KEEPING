'use client'

import apiClient from '@/api/axios'
import { deleteChargeBonus, updateChargeBonus } from '@/api/storeApi'
import ChargeBonusModal from '@/components/owner/ChargeBonusModal'
import { Alert } from '@/components/ui/Alert'
import { useEffect, useState } from 'react'

interface ChargeBonusData {
  id?: number | string
  chargeBonusId?: number | string
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
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(
    null
  )

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
                console.log('아이템의 ID 필드들:', {
                  id: item.id,
                  chargeBonusId: item.chargeBonusId,
                  charge_bonus_id: item.charge_bonus_id,
                  모든키: Object.keys(item),
                })

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
        console.log('수정 전 데이터 개수:', chargeBonusData.length)
        console.log('수정 후 데이터 개수:', validData.length)
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
    console.log(
      '삭제 함수 호출됨 - chargeBonusId:',
      chargeBonusId,
      'storeId:',
      storeId
    )
    if (!storeId || !chargeBonusId) {
      console.log(
        '삭제 조건 실패 - storeId:',
        storeId,
        'chargeBonusId:',
        chargeBonusId
      )
      return
    }

    const bonusToDelete = chargeBonusData.find(
      bonus => Number(bonus.id) === chargeBonusId
    )
    const message = bonusToDelete
      ? `${Number(bonusToDelete.chargeAmount).toLocaleString()}원 결제 시 +${bonusToDelete.bonusPercentage}% 보너스 설정을 삭제하시겠습니까?`
      : '정말로 이 충전 보너스를 삭제하시겠습니까?'

    setConfirmMessage(message)
    setConfirmCallback(() => async () => {
      try {
        console.log(
          '충전 보너스 삭제 시작 - ID:',
          chargeBonusId,
          'Store ID:',
          storeId
        )
        const response = await deleteChargeBonus(
          parseInt(storeId),
          chargeBonusId
        )

        if (response.success) {
          console.log('충전 보너스 삭제 성공:', response)
          setAlertMessage('충전 보너스가 삭제되었습니다.')
          setAlertType('success')
          setShowAlert(true)
          fetchChargeBonusData() // 목록 새로고침
        } else {
          console.error('충전 보너스 삭제 실패:', response)
          setAlertMessage(`삭제 실패: ${response.message}`)
          setAlertType('error')
          setShowAlert(true)
        }
      } catch (error) {
        console.error('충전 보너스 삭제 실패:', error)
        setAlertMessage('충전 보너스 삭제 중 오류가 발생했습니다.')
        setAlertType('error')
        setShowAlert(true)
      }
    })
    setShowConfirm(true)
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
        // 수정 - expectedTotalPoints는 백엔드에서 계산됨
        console.log('충전 보너스 수정 요청 데이터:', data)
        console.log('수정할 충전 보너스 ID:', editingChargeBonus.id)
        console.log('스토어 ID:', storeId)
        const response = await updateChargeBonus(
          parseInt(storeId),
          Number(editingChargeBonus.id),
          data
        )

        if (response.success) {
          console.log('충전 보너스 수정 성공:', response)
          setAlertMessage('충전 보너스가 수정되었습니다.')
          setAlertType('success')
          setShowAlert(true)
          setShowChargeBonusModal(false)
          setEditingChargeBonus(null)
          fetchChargeBonusData()
        } else {
          console.error('충전 보너스 수정 실패:', response)
          setAlertMessage(`수정 실패: ${response.message}`)
          setAlertType('error')
          setShowAlert(true)
        }
      } else {
        // 추가 - expectedTotalPoints는 백엔드에서 계산됨
        console.log('충전 보너스 추가 요청 데이터:', data)
        const response = await apiClient.post(
          `/owners/stores/${storeId}/charge-bonus`,
          data
        )

        if (response.data.success) {
          setAlertMessage('충전 보너스가 추가되었습니다.')
          setAlertType('success')
          setShowAlert(true)
          setShowChargeBonusModal(false)
          fetchChargeBonusData()
        } else {
          setAlertMessage(`추가 실패: ${response.data.message}`)
          setAlertType('error')
          setShowAlert(true)
        }
      }
    } catch (error: any) {
      console.error('충전 보너스 저장 실패:', error)
      setAlertMessage('충전 보너스 저장 중 오류가 발생했습니다.')
      setAlertType('error')
      setShowAlert(true)
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
        <div className="font-nanum-square-round-eb text-lg leading-[140%]">
          충전 보너스 로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 설명 섹션 */}
      <div className="rounded-[15px] bg-gray-50 p-4">
        <h3 className="font-jalnan mb-2 text-lg leading-[140%] text-[#76d4ff]">
          충전 보너스 설정
        </h3>
        <p className="font-nanum-square-round-eb text-sm leading-[140%] text-gray-600">
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
          className="font-jalnan rounded-[10px] bg-[#76d4ff] px-6 py-3 leading-[140%] text-white transition-colors hover:bg-[#5bb3e6]"
        >
          충전 보너스 추가
        </button>
      </div>

      {/* 충전 보너스 목록 */}
      <div className="space-y-3 pb-8">
        {chargeBonusData.map(bonus => (
          <div
            key={bonus.id}
            className="rounded-[20px] border border-[#76d4ff] bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-[10px] bg-[#76d4ff] px-3 py-1">
                  <div className="font-jalnan text-sm leading-[140%] text-white">
                    {(Number(bonus.chargeAmount) || 0).toLocaleString()}원
                  </div>
                </div>
                <div className="rounded-[8px] bg-blue-50 px-2 py-1">
                  <span className="font-jalnan text-sm leading-[140%] text-[#76d4ff]">
                    +{Number(bonus.bonusPercentage) || 0}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-jalnan text-lg leading-[140%] text-[#76d4ff]">
                  {(Number(bonus.expectedTotalPoints) || 0).toLocaleString()}P
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleEditChargeBonus(bonus)}
                className="font-nanum-square-round-eb rounded-[8px] border border-[#76d4ff] px-3 py-1.5 text-sm leading-[140%] font-bold text-[#76d4ff] transition-colors hover:bg-blue-50"
              >
                변경하기
              </button>
              <button
                onClick={() => {
                  console.log(
                    '삭제 버튼 클릭 - bonus.id:',
                    bonus.id,
                    'bonus.chargeBonusId:',
                    bonus.chargeBonusId,
                    '타입:',
                    typeof bonus.id
                  )
                  const idToUse = bonus.chargeBonusId || bonus.id
                  console.log('사용할 ID:', idToUse)
                  handleDeleteChargeBonus(Number(idToUse))
                }}
                className="font-nanum-square-round-eb rounded-[8px] border border-red-500 px-3 py-1.5 text-sm leading-[140%] font-bold text-red-500 transition-colors hover:bg-red-50"
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
          <p className="font-nanum-square-round-eb mb-4 text-gray-500">
            등록된 충전 보너스가 없습니다.
          </p>
          <button
            onClick={() => {
              setEditingChargeBonus(null)
              setShowChargeBonusModal(true)
            }}
            className="font-jalnan rounded-[10px] bg-[#76d4ff] px-6 py-3 leading-[140%] text-white transition-colors hover:bg-[#5bb3e6]"
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

      {/* Alert 모달 */}
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
        type={alertType}
        onConfirm={() => setShowAlert(false)}
        title="알림"
        variant="owner"
      />

      {/* Confirm 모달 */}
      <Alert
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        message={confirmMessage}
        type="error"
        onConfirm={() => {
          if (confirmCallback) {
            confirmCallback()
          }
          setShowConfirm(false)
        }}
        title="확인"
        variant="owner"
      />
    </div>
  )
}
