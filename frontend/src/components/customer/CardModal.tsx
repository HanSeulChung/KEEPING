'use client'

import { buildURL } from '@/api/config'
import { useEffect, useState } from 'react'

interface StoreBalance {
  storeId: number
  storeName: string
  remainingPoints: number
  lastUpdatedAt: string
}

interface PersonalWallet {
  customerId: number
  walletId: number
  storeBalances: StoreBalance[]
}

interface GroupWallet {
  groupId: number
  walletId: number
  groupName: string
  storeBalances: StoreBalance[]
}

interface WalletData {
  personalWallet: PersonalWallet
  groupWallets: GroupWallet[]
}

interface CardModalProps {
  isOpen: boolean
  onClose: () => void
  onCardClick?: (card: {
    storeId: number
    storeName: string
    walletId: number
  }) => void
}

const CardModal = ({ isOpen, onClose, onCardClick }: CardModalProps) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<{
    personal: boolean
    groups: { [groupId: number]: boolean }
  }>({
    personal: false,
    groups: {},
  })

  // API 호출
  const fetchWalletData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Authorization 헤더 추가
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(buildURL('/wallets/both/balance'), {
        method: 'GET',
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setWalletData(data.data)
      } else {
        throw new Error(data.message || '데이터를 가져오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('지갑 데이터 가져오기 실패:', err)
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchWalletData()
    }
  }, [isOpen])

  const toggleSection = (type: 'personal' | 'group', groupId?: number) => {
    if (type === 'personal') {
      setExpandedSections(prev => ({
        ...prev,
        personal: !prev.personal,
      }))
    } else if (type === 'group' && groupId !== undefined) {
      setExpandedSections(prev => ({
        ...prev,
        groups: {
          ...prev.groups,
          [groupId]: !prev.groups[groupId],
        },
      }))
    }
  }

  const getCardColor = (index: number) => {
    const colors = [
      'bg-[#FF6F6F]',
      'bg-[#FF8B68]',
      'bg-[#FFD23C]',
      'bg-[#A4E846]',
      'bg-[#6CAEFF]',
      'bg-[#E174FF]',
    ]
    return colors[index % colors.length]
  }

  const formatPoints = (points: number) => {
    return points.toLocaleString()
  }

  const handleCardClick = (store: StoreBalance, walletId: number) => {
    if (onCardClick) {
      onCardClick({
        storeId: store.storeId,
        storeName: store.storeName,
        walletId: walletId,
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className={`h-[560px] w-[412px] rounded-tl-[30px] rounded-tr-[30px] bg-[#fbf9f5] transition-all duration-500 ease-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{
          marginBottom: '4.5rem', // 하단 탭 높이만큼 여백 추가
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="font-jalnan text-xl leading-[140%] text-[#ffc800]">
            내 카드
          </div>
          <button
            onClick={onClose}
            className="text-[#ffc800] hover:text-[#ffc800]/80"
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

        {/* 상단 바 - 제목과 X 버튼 아래 */}
        <div className="flex justify-center px-6 pt-4">
          <div className="h-[0.1875rem] w-full bg-[#ffc800]" />
        </div>

        {/* 콘텐츠 */}
        <div className="h-[calc(100%-120px)] overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#ffc800]"></div>
                <p className="font-nanum-square-round-eb text-gray-600">
                  로딩 중...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="font-nanum-square-round-eb mb-4 text-red-600">
                  {error}
                </p>
                <button
                  onClick={fetchWalletData}
                  className="font-nanum-square-round-eb rounded-lg bg-[#ffc800] px-4 py-2 text-white"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 개인 카드 섹션 - 카드가 있을 때만 표시 */}
              {(walletData?.personalWallet.storeBalances?.length ?? 0) > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('personal')}
                    className="flex w-full items-center justify-between py-2"
                  >
                    <div className="flex items-center">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`mr-2 transition-transform ${
                          expandedSections.personal ? 'rotate-180' : ''
                        }`}
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="#99A1AF"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-nanum-square-round-eb text-[.9375rem] font-extrabold text-[#99a1af]">
                        개인 카드
                      </span>
                    </div>
                  </button>

                  {/* 개인 카드 목록 */}
                  {expandedSections.personal && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {walletData?.personalWallet.storeBalances.map(
                        (store, index) => (
                          <div
                            key={store.storeId}
                            onClick={() =>
                              handleCardClick(
                                store,
                                walletData.personalWallet.walletId
                              )
                            }
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-[0.625rem] pt-[1.3125rem] pr-[1.1875rem] pb-5 pl-[1.1875rem] transition-transform hover:scale-105 ${getCardColor(index)}`}
                          >
                            <div className="font-nanum-square-round-eb text-[.9375rem] leading-[140%] font-extrabold text-white">
                              {store.storeName}
                            </div>
                            <div className="font-nanum-square-round-eb text-[.9375rem] leading-[140%] font-extrabold text-white">
                              {formatPoints(store.remainingPoints)} P
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 그룹 카드 섹션들 - 카드가 있는 그룹만 표시 */}
              {walletData?.groupWallets
                .filter(group => group.storeBalances.length > 0)
                .map(group => (
                  <div key={group.groupId}>
                    <button
                      onClick={() => toggleSection('group', group.groupId)}
                      className="flex w-full items-center justify-between py-2"
                    >
                      <div className="flex items-center">
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`mr-2 transition-transform ${
                            expandedSections.groups[group.groupId]
                              ? 'rotate-180'
                              : ''
                          }`}
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="#99A1AF"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="font-nanum-square-round-eb text-[.9375rem] font-extrabold text-[#99a1af]">
                          {group.groupName}
                        </span>
                      </div>
                    </button>

                    {/* 그룹 카드 목록 */}
                    {expandedSections.groups[group.groupId] && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {group.storeBalances.map((store, index) => (
                          <div
                            key={store.storeId}
                            onClick={() =>
                              handleCardClick(store, group.walletId)
                            }
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-[0.625rem] pt-[1.3125rem] pr-[1.1875rem] pb-5 pl-[1.1875rem] transition-transform hover:scale-105 ${getCardColor(index)}`}
                          >
                            <div className="font-nanum-square-round-eb text-[.9375rem] leading-[140%] font-extrabold text-white">
                              {store.storeName}
                            </div>
                            <div className="font-nanum-square-round-eb text-[.9375rem] leading-[140%] font-extrabold text-white">
                              {formatPoints(store.remainingPoints)} P
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {/* 모든 카드가 없을 때만 표시 */}
              {(walletData?.personalWallet.storeBalances?.length ?? 0) === 0 &&
                !walletData?.groupWallets.some(
                  group => group.storeBalances.length > 0
                ) && (
                  <div className="py-8 text-center">
                    <p className="font-nanum-square-round-eb text-gray-500">
                      카드가 없습니다.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardModal
