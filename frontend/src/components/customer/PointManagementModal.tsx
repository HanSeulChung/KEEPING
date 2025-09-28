'use client'
import { buildURL } from '@/api/config'
import { Alert } from '@/components/ui/Alert'
import React, { useEffect, useState } from 'react'

interface PointManagementModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  groupId: number
  groupWalletId: number
  individualWalletId: number
  individualBalance: any[]
  onShareSuccess?: () => void
  onReclaimSuccess?: () => void
}

interface StoreOption {
  storeId: number
  storeName: string
  remainingPoints: number
}

const PointManagementModal: React.FC<PointManagementModalProps> = ({
  isOpen,
  onClose,
  groupName,
  groupId,
  groupWalletId,
  individualWalletId,
  individualBalance,
  onShareSuccess,
  onReclaimSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'reclaim'>('share')
  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null)
  const [shareAmount, setShareAmount] = useState<string>('')
  const [reclaimAmount, setReclaimAmount] = useState<string>('')
  const [availableReclaimAmount, setAvailableReclaimAmount] =
    useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isReclaiming, setIsReclaiming] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')

  // 첫 번째 개인 카드를 기본 선택으로 설정
  useEffect(() => {
    console.log('PointManagementModal - individualBalance:', individualBalance)
    console.log(
      'PointManagementModal - individualBalance length:',
      individualBalance?.length
    )
    if (individualBalance && individualBalance.length > 0 && !selectedStore) {
      setSelectedStore(individualBalance[0])
      console.log(
        'PointManagementModal - selectedStore 설정:',
        individualBalance[0]
      )
    }
  }, [individualBalance, selectedStore])

  // 탭 변경 시 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setShareAmount('')
      setReclaimAmount('')
      setAvailableReclaimAmount(0)
      setIsAlertOpen(false)
      setAlertMessage('')
    }
  }, [isOpen, activeTab])

  // 선택된 스토어 변경 시 회수 가능 금액 조회
  useEffect(() => {
    if (activeTab === 'reclaim' && selectedStore) {
      fetchAvailableReclaimAmount(selectedStore.storeId)
    }
  }, [activeTab, selectedStore])

  const fetchAvailableReclaimAmount = async (storeId: number) => {
    try {
      const url = buildURL(
        `/wallets/${groupWalletId}/stores/${storeId}/points/available`
      )

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success && result.data) {
        setAvailableReclaimAmount(result.data.available || 0)
      } else {
        setAvailableReclaimAmount(0)
      }
    } catch (error) {
      console.error('회수 가능 금액 조회 실패:', error)
      setAvailableReclaimAmount(0)
    }
  }

  const handleShareAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setShareAmount(value)
  }

  const handleReclaimAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setReclaimAmount(value)
  }

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
  }

  const handleShare = async () => {
    if (!selectedStore || !shareAmount) return

    setIsSharing(true)
    try {
      const url = buildURL(
        `/wallets/groups/${groupId}/stores/${selectedStore.storeId}`
      )
      const idempotencyKey = generateUUID()

      const requestBody = {
        individualWalletId: individualWalletId,
        groupWalletId: groupWalletId,
        shareAmount: parseInt(shareAmount),
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('공유 성공:', result)

      setAlertMessage('포인트 공유가 완료되었습니다!')
      setAlertType('success')
      setIsAlertOpen(true)
      onShareSuccess?.()
    } catch (error) {
      console.error('공유 실패:', error)
      setAlertMessage('포인트 공유에 실패했습니다. 다시 시도해주세요.')
      setAlertType('error')
      setIsAlertOpen(true)
    } finally {
      setIsSharing(false)
    }
  }

  const handleReclaim = async () => {
    if (!selectedStore || !reclaimAmount) return

    setIsReclaiming(true)
    try {
      const url = buildURL(
        `/wallets/groups/${groupId}/stores/${selectedStore.storeId}/reclaim`
      )
      const idempotencyKey = generateUUID()

      const requestBody = {
        individualWalletId: individualWalletId,
        groupWalletId: groupWalletId,
        shareAmount: parseInt(reclaimAmount),
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('회수 성공:', result)

      setAlertMessage('포인트 회수가 완료되었습니다!')
      setAlertType('success')
      setIsAlertOpen(true)
      onReclaimSuccess?.()
    } catch (error) {
      console.error('회수 실패:', error)
      setAlertMessage('포인트 회수에 실패했습니다. 다시 시도해주세요.')
      setAlertType('error')
      setIsAlertOpen(true)
    } finally {
      setIsReclaiming(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative h-[440px] w-[412px] rounded-[30px] bg-[#fbf9f5]">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6">
          <div className="font-jalnan text-xl leading-[140%]">
            <span className="text-[#ffc800]">{groupName}</span> 포인트 관리
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center"
          >
            <svg
              width={36}
              height={36}
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z"
                stroke="#FFC800"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 구분선 */}
        <div className="h-[3px] w-full bg-[#ffc800]" />

        {/* 탭 네비게이션 */}
        <div className="flex w-[12.6875rem] items-end px-6 pt-6">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center justify-center rounded-tl-lg rounded-tr-lg px-3 py-1 ${
              activeTab === 'share'
                ? 'bg-[#fdda60] text-white'
                : 'border-t border-r border-b border-l border-[#fdda60] bg-white text-[#fdda60]'
            }`}
          >
            <div className="font-jalnan text-xl leading-[140%]">공유</div>
          </button>
          <button
            onClick={() => setActiveTab('reclaim')}
            className={`flex items-center justify-center rounded-tl-lg rounded-tr-lg px-3 py-1 ${
              activeTab === 'reclaim'
                ? 'bg-[#fdda60] text-white'
                : 'border-t border-r border-b border-l border-[#fdda60] bg-white text-[#fdda60]'
            }`}
          >
            <div className="font-jalnan text-xl leading-[140%]">회수</div>
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 pt-6">
          {activeTab === 'share' ? (
            /* 공유 탭 */
            <div className="space-y-4">
              {/* 가게 선택 */}
              <div>
                <div className="mb-2 text-sm text-gray-500">
                  포인트를 공유할 가게를 선택해주세요.
                </div>
                <div className="flex w-[280px] items-center justify-end rounded-full border-[3px] border-[#fdda60] py-2 pr-2 pl-7">
                  <select
                    value={selectedStore?.storeId || ''}
                    onChange={e => {
                      const selected = individualBalance?.find(
                        balance => balance.storeId === parseInt(e.target.value)
                      )
                      setSelectedStore(selected)
                    }}
                    className="flex-1 border-none bg-transparent font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-bold text-[#ffc800] outline-none"
                  >
                    <option value="">가게를 선택해주세요</option>
                    {individualBalance && individualBalance.length > 0 ? (
                      individualBalance.map(balance => (
                        <option key={balance.storeId} value={balance.storeId}>
                          {balance.storeName} (잔액:{' '}
                          {balance.remainingPoints.toLocaleString()}P)
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        사용 가능한 가게가 없습니다
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {/* 공유할 포인트 입력 */}
              <div>
                <div className="mb-2 text-sm text-gray-500">
                  공유할 포인트를 입력해주세요.
                </div>
                <div className="flex w-[280px] items-center justify-end rounded-full border-[3px] border-[#fdda60] py-2 pr-2 pl-7">
                  <input
                    type="text"
                    value={shareAmount}
                    onChange={handleShareAmountChange}
                    placeholder="0"
                    className="flex-1 border-none bg-transparent text-right font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-bold text-black outline-none"
                  />
                  <span className="ml-2 font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-bold text-[#ffc800]">
                    P
                  </span>
                </div>
              </div>

              {/* 공유하기 버튼 */}
              <button
                onClick={handleShare}
                disabled={
                  !selectedStore ||
                  !shareAmount ||
                  parseInt(shareAmount) <= 0 ||
                  isSharing
                }
                className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#fdda60] disabled:bg-gray-300"
              >
                <div className="font-jalnan text-xl leading-[140%] text-white">
                  {isSharing ? '공유 중...' : '공유하기'}
                </div>
              </button>
            </div>
          ) : (
            /* 회수 탭 */
            <div className="space-y-4">
              {/* 가게 선택 */}
              <div>
                <div className="mb-2 text-sm text-gray-500">
                  포인트를 회수할 가게를 선택해주세요.
                </div>
                <div className="flex w-[280px] items-center justify-end rounded-full border-[3px] border-[#fdda60] py-2 pr-2 pl-7">
                  <select
                    value={selectedStore?.storeId || ''}
                    onChange={e => {
                      const selected = individualBalance?.find(
                        balance => balance.storeId === parseInt(e.target.value)
                      )
                      setSelectedStore(selected)
                    }}
                    className="flex-1 border-none bg-transparent font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-bold text-[#ffc800] outline-none"
                  >
                    <option value="">가게를 선택해주세요</option>
                    {individualBalance && individualBalance.length > 0 ? (
                      individualBalance.map(balance => (
                        <option key={balance.storeId} value={balance.storeId}>
                          {balance.storeName} (회수 가능 포인트:{' '}
                          {availableReclaimAmount.toLocaleString()}P)
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        사용 가능한 가게가 없습니다
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {/* 회수할 포인트 입력 */}
              <div>
                <div className="mb-2 text-sm text-gray-500">
                  회수할 포인트를 입력해주세요.
                </div>
                <div className="flex w-[280px] items-center justify-end rounded-full border-[3px] border-[#fdda60] py-2 pr-2 pl-7">
                  <input
                    type="text"
                    value={reclaimAmount}
                    onChange={handleReclaimAmountChange}
                    placeholder="0"
                    className="flex-1 border-none bg-transparent text-right font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-bold text-black outline-none"
                  />
                  <span className="ml-2 font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-bold text-[#ffc800]">
                    P
                  </span>
                </div>
              </div>

              {/* 회수하기 버튼 */}
              <button
                onClick={handleReclaim}
                disabled={
                  !selectedStore ||
                  !reclaimAmount ||
                  parseInt(reclaimAmount) <= 0 ||
                  isReclaiming
                }
                className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#fdda60] disabled:bg-gray-300"
              >
                <div className="font-jalnan text-xl leading-[140%] text-white">
                  {isReclaiming ? '회수 중...' : '회수하기'}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert 모달 */}
      <Alert
        isOpen={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false)
          // 성공 시에만 모달 닫기 후 새로고침
          if (alertType === 'success') {
            onClose()
            window.location.reload()
          }
        }}
        onConfirm={() => {
          setIsAlertOpen(false)
          // 성공 시에만 모달 닫기 후 새로고침
          if (alertType === 'success') {
            onClose()
            window.location.reload()
          }
        }}
        title=""
        message={alertMessage}
        type={alertType}
      />
    </div>
  )
}

export default PointManagementModal
