'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { GroupCreateModal } from '../ui/GroupCreateModal'
import FindGroup from './findGroup'
import QRModal from './home/QRmodal'

import { buildURL } from '@/api/config'
import { useUser } from '@/contexts/UserContext'

const createGroup = async (groupData: {
  groupName: string
  groupDescription: string
}) => {
  try {
    const url = buildURL('/groups')

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

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({
        groupName: groupData.groupName,
        groupDescription: groupData.groupDescription,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('그룹 생성 실패:', error)
    throw error
  }
}

const fetchGroupInfo = async (groupId: number) => {
  try {
    const url = buildURL(`/groups/${groupId}`)

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

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log(`그룹 ${groupId} 정보 조회 응답:`, result)
    return result
  } catch (error) {
    console.error('그룹 정보 조회 실패:', error)
    throw error
  }
}

const fetchGroupMembers = async (groupId: number) => {
  try {
    const url = buildURL(`/groups/${groupId}/group-members`)

    console.log('그룹 멤버 조회 요청:', {
      url,
      groupId,
    })

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

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    console.log('그룹 멤버 조회 응답 상태:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('그룹 멤버 조회 실패 응답:', errorText)
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      )
    }

    const result = await response.json()
    console.log('그룹 멤버 조회 성공:', result)
    return result
  } catch (error) {
    console.error('그룹 멤버 조회 실패:', error)
    throw error
  }
}

const fetchGroupWalletBalance = async (groupId: number) => {
  try {
    const url = buildURL(`/wallets/groups/${groupId}/balance`)

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

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('그룹 지갑 잔액 조회 실패:', error)
    throw error
  }
}

const fetchGroupTransactionHistory = async (
  groupId: number,
  storeId: number,
  page: number = 0
) => {
  try {
    const url = buildURL(
      `/wallets/groups/${groupId}/stores/${storeId}/detail?page=${page}&size=10`
    )

    // Authorization 헤더 추가
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      } else {
        console.warn('accessToken이 없습니다. localStorage 확인 필요')
      }
    }

    console.log('그룹 거래 내역 조회 요청:', {
      url,
      groupId,
      storeId,
      page,
      hasAuthHeader: !!headers.Authorization,
    })

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    console.log('그룹 거래 내역 조회 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('그룹 거래 내역 조회 실패 상세:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      })
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      )
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('그룹 거래 내역 조회 실패:', error)
    throw error
  }
}

// 개인 지갑 잔액 조회 API 함수
const fetchIndividualBalance = async () => {
  try {
    const url = buildURL('/wallets/individual/balance')

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

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('개인 지갑 잔액 조회 실패:', error)
    throw error
  }
}

// 사용자가 속한 그룹 목록 조회 API 함수
const fetchUserGroups = async () => {
  try {
    const url = buildURL('/customers/me/groups')

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

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('사용자 그룹 목록 API 응답:', result)
    return result
  } catch (error) {
    console.error('사용자 그룹 목록 조회 실패:', error)
    throw error
  }
}

// 타입 정의
interface WalletCard {
  id: number
  name: string
  amount: number
  isSelected?: boolean
}

interface GroupMember {
  customerId: number
  customerName: string
  profileImage: string
  isLeader: boolean
}

interface GroupWalletCard {
  storeId: number
  storeName: string
  remainingPoints: number
  lastUpdatedAt: string
}

interface GroupWalletResponse {
  groupId: number
  walletId: number
  groupName: string
  storeBalances: {
    content: GroupWalletCard[]
    totalPages: number
    totalElements: number
    size: number
    number: number
    numberOfElements: number
    first: boolean
    last: boolean
    empty: boolean
  }
}

interface GroupTransaction {
  transactionId: number
  transactionType: string
  amount: number
  transactionUniqueNo: string
  createdAt: string
  customer: string
}

interface GroupTransactionResponse {
  storeId: number
  storeName: string
  currentBalance: number
  transactions: {
    content: GroupTransaction[]
    totalPages: number
    totalElements: number
    size: number
    number: number
    numberOfElements: number
    first: boolean
    last: boolean
    empty: boolean
  }
}

interface Transaction {
  id: number
  type: 'charge' | 'usage'
  amount: number
  date: string
  by: string
}

// 더미 데이터

const TAB_CONFIG = {
  history: '사용내역',
  withdrawal: '회수',
} as const

// 지갑 카드 컴포넌트 (MyWallet에서 가져옴)
const WalletCard = ({
  card,
  onClick,
  onPaymentClick,
}: {
  card: WalletCard
  onClick: () => void
  onPaymentClick?: () => void
}) => {
  return (
    <div
      className={`relative h-32 w-32 cursor-pointer border border-black transition-colors md:h-28 md:w-28 ${
        card.isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {/* 카드 이름 */}
      <div className="absolute top-2 left-2 text-xs font-normal text-black">
        {card.name}
      </div>

      {/* 카드 번호 */}
      <div className="absolute top-2 right-2 text-xs font-normal text-black">
        {card.id.toString().padStart(2, '0')}
      </div>

      {/* 선 */}
      <div className="absolute top-8 right-2 left-2 h-px bg-black"></div>

      {/* 금액 */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-xs font-extrabold whitespace-nowrap text-black">
        {card.amount.toLocaleString()}원
      </div>

      {/* 결제하기 버튼 */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2">
        <button
          className="flex h-5 w-12 items-center justify-center border border-blue-500 bg-white hover:bg-blue-50"
          onClick={e => {
            e.stopPropagation()
            onPaymentClick?.()
          }}
        >
          <span className="text-xs font-bold text-blue-500">결제하기</span>
        </button>
      </div>
    </div>
  )
}

// 거래 내역 아이템 컴포넌트 (MyWallet에서 가져와서 수정)
const TransactionItem = ({
  transaction,
  cardName,
}: {
  transaction: Transaction
  cardName: string
}) => {
  return (
    <div className="relative h-16 w-full">
      {/* 충전/사용 라벨 */}
      <div
        className={`absolute top-4 left-4 flex h-6 w-13 items-center justify-center border text-sm font-extrabold ${
          transaction.type === 'charge'
            ? 'border-blue-500 text-blue-500'
            : 'border-red-500 text-red-500'
        }`}
      >
        {transaction.type === 'charge' ? '충전' : '사용'}
      </div>

      {/* 금액 */}
      <div className="absolute top-4 left-20 text-sm font-extrabold text-black">
        {transaction.amount.toLocaleString()}원
      </div>

      {/* 날짜 */}
      <div className="absolute top-5 left-44 text-xs font-extrabold text-gray-400">
        {transaction.date}
      </div>

      {/* by 사용자 */}
      <div className="absolute top-4 right-4 text-xs font-bold text-black">
        by {transaction.by}
      </div>

      {/* 구분선 */}
      <div className="absolute right-3 bottom-4 left-3 h-px bg-gray-300"></div>
    </div>
  )
}

// 충전 옵션 아이템 컴포넌트 (MyWallet에서 가져옴)
interface ChargeOptionProps {
  discount: string
  points: string
  isSelected?: boolean
  onClick?: () => void
}

const ChargeOption = ({
  discount,
  points,
  isSelected = false,
  onClick,
}: ChargeOptionProps) => {
  return (
    <div
      className={`flex h-[59px] w-full cursor-pointer items-center justify-between border border-black px-5 transition-colors ${
        isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-yellow-50'
      }`}
      onClick={onClick}
    >
      <span className="text-sm font-bold text-red-500">{discount}</span>
      <span className="text-sm font-bold text-black">{points}</span>
    </div>
  )
}

// 공유 모달 컴포넌트
const ShareModal = ({
  isOpen,
  onClose,
  selectedCard,
  individualBalance,
  selectedGroup,
  individualWalletId,
  groupInfo,
}: {
  isOpen: boolean
  onClose: () => void
  selectedCard: WalletCard | null
  individualBalance: any[]
  selectedGroup: number
  individualWalletId: number
  groupInfo: {
    groupId: number
    groupName: string
    groupDescription: string
    groupCode: string
    walletId: number
  } | null
}) => {
  const [shareAmount, setShareAmount] = useState<string>('')
  const [selectedIndividualCard, setSelectedIndividualCard] =
    useState<any>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // 첫 번째 개인 카드를 기본 선택으로 설정
  useEffect(() => {
    if (individualBalance.length > 0 && !selectedIndividualCard) {
      setSelectedIndividualCard(individualBalance[0])
    }
  }, [individualBalance, selectedIndividualCard])

  if (!isOpen) return null

  const myPoints = selectedIndividualCard?.remainingPoints || 0 // 선택된 개인 카드의 remainingPoints

  const handleShareAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 입력 가능
    setShareAmount(value)
  }

  // UUID v4 생성 함수
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

  // 공유 API 호출
  const handleShare = async () => {
    if (!selectedCard || !selectedIndividualCard || !shareAmount) return

    console.log('공유 API 호출 정보:', {
      selectedGroup,
      selectedCard: selectedCard,
      selectedIndividualCard: selectedIndividualCard,
      shareAmount,
      individualWalletId: individualWalletId,
      groupWalletId: groupInfo?.walletId,
    })

    setIsSharing(true)
    try {
      const url = buildURL(
        `/wallets/groups/${selectedGroup}/stores/${selectedIndividualCard.storeId}`
      )
      const idempotencyKey = generateUUID()

      const requestBody = {
        individualWalletId: individualWalletId, // 개인 지갑 ID
        groupWalletId: groupInfo?.walletId || 0, // 그룹 지갑 ID
        shareAmount: parseInt(shareAmount),
      }

      // Authorization 헤더 추가
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

      const requestOptions = {
        method: 'POST',
        credentials: 'include' as RequestCredentials,
        headers,
        body: JSON.stringify(requestBody),
      }

      console.log('=== 공유 API 요청 정보 ===')
      console.log('URL:', url)
      console.log('Method:', 'POST')
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      })
      console.log('Credentials:', 'include')
      console.log('Request Body:', requestBody)
      console.log('Full Request Options:', requestOptions)

      const response = await fetch(url, requestOptions)

      console.log('=== API 응답 정보 ===')
      console.log('Response Status:', response.status)
      console.log('Response OK:', response.ok)
      console.log(
        'Response Headers:',
        Object.fromEntries(response.headers.entries())
      )

      if (!response.ok) {
        console.log('❌ API 요청 실패')
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ 공유 성공 - 응답 데이터:', result)

      // 성공 시 모달 닫기
      onClose()
    } catch (error) {
      console.log('❌ 공유 실패 - 에러 상세 정보:')
      console.error('Error:', error)
      console.error(
        'Error message:',
        error instanceof Error ? error.message : String(error)
      )
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'No stack trace'
      )
      alert('공유에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">포인트 공유</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-gray-600">
            그룹 카드: {selectedCard?.name || '기본 카드'}
          </p>

          {/* 개인 카드 선택 드롭다운 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              공유할 개인 카드 선택
            </label>
            <select
              value={selectedIndividualCard?.storeId || ''}
              onChange={e => {
                const selected = individualBalance.find(
                  balance => balance.storeId === parseInt(e.target.value)
                )
                setSelectedIndividualCard(selected)
              }}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">카드를 선택해주세요</option>
              {individualBalance.map(balance => (
                <option key={balance.storeId} value={balance.storeId}>
                  {balance.storeName} (잔액:{' '}
                  {balance.remainingPoints.toLocaleString()}원)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 내 보유 포인트 */}
        <div className="mb-6 flex items-center gap-4">
          <p className="text-base font-bold text-black md:text-sm">
            내 보유 포인트
          </p>
          <div className="relative">
            <Image
              src="/wallet/inputbox.svg"
              alt="입력 박스"
              width={200}
              height={40}
              className="h-[40px] w-[200px]"
            />
            <p className="absolute top-[12px] right-[20px] text-base font-bold text-black md:text-sm">
              {myPoints.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 공유할 포인트 */}
        <div className="mb-6 flex items-center gap-4">
          <p className="text-base font-bold text-black md:text-sm">
            공유할 포인트
          </p>
          <div className="relative">
            <Image
              src="/wallet/inputbox.svg"
              alt="입력 박스"
              width={200}
              height={40}
              className="h-[40px] w-[200px]"
            />
            <input
              type="text"
              value={shareAmount}
              onChange={handleShareAmountChange}
              placeholder="0"
              className="absolute top-[12px] right-[20px] w-[120px] border-none bg-transparent text-right text-base font-bold text-black outline-none md:text-sm"
            />
          </div>
        </div>

        {/* 공유하기 버튼 */}
        <button
          className="flex h-10 w-full cursor-pointer items-center justify-center border border-black bg-black transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={handleShare}
          disabled={
            !shareAmount ||
            parseInt(shareAmount) <= 0 ||
            parseInt(shareAmount) > myPoints ||
            !selectedIndividualCard ||
            isSharing
          }
        >
          <span className="text-sm font-bold text-white">
            {isSharing ? '공유 중...' : '공유하기'}
          </span>
        </button>
      </div>
    </div>
  )
}

// 회수 섹션 컴포넌트 (환불 섹션과 유사)
const WithdrawalSection = ({
  selectedCard,
}: {
  selectedCard: WalletCard | undefined
}) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('')
  const availableAmount = selectedCard?.amount || 0 // 회수 가능 금액

  const handleWithdrawalAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 입력 가능
    setWithdrawalAmount(value)
  }

  if (!selectedCard) {
    return (
      <div className="w-full text-center text-gray-500">
        카드를 선택해주세요.
      </div>
    )
  }

  return (
    <div className="w-full">
      <p className="mb-6 text-lg font-bold text-black md:text-[15px]">
        "{selectedCard.name}" 포인트 회수하기
      </p>

      <div className="mb-6 flex items-center gap-4">
        <p className="text-base font-bold text-black md:text-sm">
          회수 가능 금액
        </p>
        <div className="relative">
          <Image
            src="/wallet/inputbox.svg"
            alt="입력 박스"
            width={200}
            height={40}
            className="h-[40px] w-[200px]"
          />
          <p className="absolute top-[12px] right-[20px] text-base font-bold text-black md:text-sm">
            {availableAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <p className="text-base font-bold text-black md:text-sm">
          회수할 포인트
        </p>
        <div className="relative">
          <Image
            src="/wallet/inputbox.svg"
            alt="입력 박스"
            width={200}
            height={40}
            className="h-[40px] w-[200px]"
          />
          <input
            type="text"
            value={withdrawalAmount}
            onChange={handleWithdrawalAmountChange}
            placeholder="0"
            className="absolute top-[12px] right-[20px] w-[120px] border-none bg-transparent text-right text-base font-bold text-black outline-none md:text-sm"
          />
        </div>
      </div>

      <button className="flex h-10 w-full items-center justify-center border border-black bg-black">
        <span className="text-sm font-bold text-white">회수하기</span>
      </button>
    </div>
  )
}

// 페이지네이션 컴포넌트
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(0, currentPage - 2)
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400"
      >
        ←
      </button>

      {/* 페이지 번호들 */}
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex h-8 w-8 items-center justify-center rounded border text-sm ${
            currentPage === page
              ? 'border-black bg-black text-white'
              : 'border-gray-300 bg-white text-black hover:bg-gray-50'
          }`}
        >
          {page + 1}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400"
      >
        →
      </button>
    </div>
  )
}

// 그룹원 목록 모달 컴포넌트
const MemberListModal = ({
  isOpen,
  onClose,
  members,
  loading,
}: {
  isOpen: boolean
  onClose: () => void
  members: GroupMember[]
  loading: boolean
}) => {
  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative h-[500px] w-[400px] rounded-lg border border-black bg-white p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-600"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* 제목 */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-black">그룹원 목록</h2>
        </div>

        {/* 멤버 목록 */}
        <div className="max-h-[350px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">멤버 로딩 중...</div>
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-3">
              {members.map(member => (
                <div
                  key={member.customerId}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <div className="relative">
                    <Image
                      src={member.profileImage || '/customer.png'}
                      alt={member.customerName}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    {member.isLeader && (
                      <div className="absolute -top-1 -right-1 h-4 w-4">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M10 0L12.5 4H18L14.5 7L16 12L10 9L4 12L5.5 7L2 4H7.5L10 0Z"
                            fill="#FFD700"
                            stroke="#FFA500"
                            strokeWidth="0.5"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-black">
                        {member.customerName}
                      </span>
                      {member.isLeader && (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          리더
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">멤버가 없습니다</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export const GroupWallet = () => {
  const { user } = useUser()
  const [selectedCard, setSelectedCard] = useState<number>(2)
  const [activeTab, setActiveTab] = useState<keyof typeof TAB_CONFIG>('history')
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [userGroupIds, setUserGroupIds] = useState<number[]>([])
  const [groupNames, setGroupNames] = useState<Record<number, string>>({})
  const [hoveredMember, setHoveredMember] = useState<number | null>(null)
  const [isGroupCreateModalOpen, setIsGroupCreateModalOpen] = useState(false)
  const [isFindGroupOpen, setIsFindGroupOpen] = useState(false)
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [isMemberListModalOpen, setIsMemberListModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedCardForShare, setSelectedCardForShare] =
    useState<WalletCard | null>(null)
  const [groupWalletCards, setGroupWalletCards] = useState<GroupWalletCard[]>(
    []
  )
  const [walletLoading, setWalletLoading] = useState(false)
  const [transactions, setTransactions] = useState<GroupTransaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [individualBalance, setIndividualBalance] = useState<any[]>([])
  const [individualWalletId, setIndividualWalletId] = useState<number>(0)
  const [groupInfo, setGroupInfo] = useState<{
    groupId: number
    groupName: string
    groupDescription: string
    groupCode: string
    walletId: number
  } | null>(null)
  const [loading, setLoading] = useState(false)

  // 사용자 그룹 목록 로드 함수
  const loadUserGroups = async () => {
    try {
      const result = await fetchUserGroups()
      if (result.success && result.data && result.data.groupIds) {
        setUserGroupIds(result.data.groupIds)

        // 각 그룹의 상세 정보를 가져와서 이름 저장
        const groupNamePromises = result.data.groupIds.map(
          async (groupId: number) => {
            try {
              const groupInfo = await fetchGroupInfo(groupId)
              if (groupInfo.success && groupInfo.data) {
                // 다양한 필드명에서 그룹 이름 찾기
                const groupName =
                  groupInfo.data.groupName ||
                  groupInfo.data.name ||
                  groupInfo.data.title ||
                  `그룹 ${groupId}`
                console.log(`그룹 ${groupId} 이름:`, groupName)
                return { id: groupId, name: groupName }
              }
            } catch (error) {
              console.error(`그룹 ${groupId} 정보 조회 실패:`, error)
            }
            return { id: groupId, name: `그룹 ${groupId}` }
          }
        )

        const groupNamesData = await Promise.all(groupNamePromises)
        const namesMap: Record<number, string> = {}
        groupNamesData.forEach(({ id, name }) => {
          namesMap[id] = name
        })
        setGroupNames(namesMap)

        // 첫 번째 그룹을 기본 선택으로 설정
        if (result.data.groupIds.length > 0) {
          const firstGroupId = result.data.groupIds[0]
          setSelectedGroup(firstGroupId)
          handleGroupSelect(firstGroupId)
        }
      }
    } catch (error) {
      console.error('사용자 그룹 목록 로드 실패:', error)
    }
  }

  // 컴포넌트 마운트 시 사용자 그룹 목록과 개인 지갑 잔액 로드
  useEffect(() => {
    loadUserGroups()
    fetchIndividualBalanceData()
  }, [])

  // 카드나 탭이 변경될 때 거래 내역 조회
  useEffect(() => {
    if (activeTab === 'history' && selectedCard && selectedGroup !== null) {
      fetchTransactions(selectedGroup, selectedCard, 0) // 첫 페이지로 리셋
    }
  }, [selectedCard, activeTab, selectedGroup])

  // 선택된 그룹이 변경될 때 멤버 조회
  useEffect(() => {
    if (selectedGroup !== null) {
      fetchMembers(selectedGroup)
    }
  }, [selectedGroup])

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId)
    // 카드 선택 시 해당 카드의 거래 내역 조회
    if (activeTab === 'history' && selectedGroup !== null) {
      fetchTransactions(selectedGroup, cardId, 0) // 첫 페이지로 리셋
    }
  }

  const handlePageChange = (page: number) => {
    if (activeTab === 'history' && selectedCard && selectedGroup !== null) {
      fetchTransactions(selectedGroup, selectedCard, page)
    }
  }

  // 공유 모달 열기
  const handleShareClick = (card: WalletCard) => {
    setSelectedCardForShare(card)
    setIsShareModalOpen(true)
  }

  // 공유 모달 닫기
  const handleShareModalClose = () => {
    setIsShareModalOpen(false)
    setSelectedCardForShare(null)
  }

  const fetchMembers = async (groupId: number) => {
    console.log('fetchMembers 호출됨:', { groupId, user })

    setMembersLoading(true)
    try {
      const result = await fetchGroupMembers(groupId)
      if (result.success && result.data) {
        setGroupMembers(result.data)
      }
    } catch (error) {
      console.error('그룹 멤버 조회 실패:', error)
    } finally {
      setMembersLoading(false)
    }
  }

  const fetchWalletCards = async (groupId: number) => {
    setWalletLoading(true)
    try {
      const result = await fetchGroupWalletBalance(groupId)
      if (result.success && result.data) {
        setGroupWalletCards(result.data.storeBalances.content)
      }
    } catch (error) {
      console.error('그룹 지갑 카드 조회 실패:', error)
    } finally {
      setWalletLoading(false)
    }
  }

  const fetchTransactions = async (
    groupId: number,
    storeId: number,
    page: number = 0
  ) => {
    setTransactionsLoading(true)
    try {
      const result = await fetchGroupTransactionHistory(groupId, storeId, page)
      if (result.success && result.data) {
        setTransactions(result.data.transactions.content)
        setCurrentPage(result.data.transactions.number)
        setTotalPages(result.data.transactions.totalPages)
      }
    } catch (error) {
      console.error('그룹 거래 내역 조회 실패:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  // 개인 지갑 잔액 가져오기
  const fetchIndividualBalanceData = async () => {
    try {
      const result = await fetchIndividualBalance()
      if (result.success && result.data) {
        setIndividualBalance(result.data.storeBalances.content)
        setIndividualWalletId(result.data.walletId) // 개인 지갑 ID 저장
      }
    } catch (error) {
      console.error('개인 지갑 잔액 조회 실패:', error)
    }
  }

  const handleGroupSelect = async (groupId: number) => {
    setSelectedGroup(groupId)
    setLoading(true)

    try {
      const result = await fetchGroupInfo(groupId)
      if (result.success && result.data) {
        setGroupInfo(result.data)
      }
      // 그룹 멤버와 지갑 카드도 함께 조회
      await Promise.all([fetchMembers(groupId), fetchWalletCards(groupId)])
    } catch (error) {
      console.error('그룹 정보 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (
    groupName: string,
    groupDescription: string
  ) => {
    try {
      const result = await createGroup({
        groupName: groupName,
        groupDescription: groupDescription,
      })

      console.log('그룹 생성 성공:', result)

      // 성공 시 그룹 목록 업데이트 또는 페이지 새로고침
      // 실제로는 상태를 업데이트하거나 다시 fetch해야 함

      // 모달 닫기
      setIsGroupCreateModalOpen(false)

      // 성공 알림 (선택사항)
      alert('그룹이 성공적으로 생성되었습니다!')
    } catch (error) {
      console.error('그룹 생성 에러:', error)

      // 에러 처리
      alert('그룹 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const copyGroupCode = async () => {
    if (groupInfo?.groupCode) {
      try {
        await navigator.clipboard.writeText(groupInfo.groupCode)
        alert('그룹 코드가 복사되었습니다!')
      } catch (error) {
        console.error('복사 실패:', error)
        alert('복사에 실패했습니다.')
      }
    }
  }

  // API 데이터를 카드 형태로 변환
  const cardsWithSelection = groupWalletCards.map(card => ({
    id: card.storeId,
    name: card.storeName,
    amount: card.remainingPoints,
    isSelected: card.storeId === selectedCard,
  }))

  // 그룹 데이터 (사용자가 속한 그룹 + 추가 버튼)
  const groups = [
    ...userGroupIds.map(groupId => ({
      id: groupId,
      name: groupNames[groupId] || `그룹 ${groupId}`,
      isSelected: selectedGroup === groupId,
    })),
    { id: -1, name: '+', isAddButton: true as const },
  ]

  // 모임원 데이터

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h1
            className="text-xl font-bold text-black md:text-lg"
            style={{ fontFamily: 'Tenada' }}
          >
            모임 지갑
          </h1>

          {/* 검색 버튼 */}
          <button
            onClick={() => setIsFindGroupOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-600"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>

        {/* 그룹 선택 원형 버튼들 */}
        <div className="mb-4 w-full">
          <div className="scrollbar-hide overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
              {groups.map(group => (
                <div key={group.id} className="flex-shrink-0">
                  {'isAddButton' in group && group.isAddButton ? (
                    <div
                      className="flex h-[70px] w-[70px] cursor-pointer items-center justify-center rounded-full border border-black bg-[#D8D8D8] transition-colors hover:bg-[#C8C8C8] md:h-[60px] md:w-[60px]"
                      onClick={() => setIsGroupCreateModalOpen(true)}
                    >
                      <span className="text-sm font-bold text-black md:text-xs">
                        +
                      </span>
                    </div>
                  ) : (
                    <div
                      className="relative h-[70px] w-[70px] cursor-pointer transition-colors md:h-[60px] md:w-[60px]"
                      onClick={() => handleGroupSelect(group.id)}
                    >
                      <svg
                        width="70"
                        height="70"
                        viewBox="0 0 90 91"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="group h-[70px] w-[70px] md:h-[60px] md:w-[60px]"
                      >
                        <path
                          d="M44.9902 1.09766C69.5669 1.09766 89.4902 21.021 89.4902 45.5977C89.4902 70.1743 69.5669 90.0977 44.9902 90.0977C20.4136 90.0977 0.490234 70.1743 0.490234 45.5977C0.490234 21.021 20.4136 1.09766 44.9902 1.09766Z"
                          stroke="black"
                        />
                        <path
                          d="M48.4902 2.59766C72.9832 2.59766 89.4902 24.9291 89.4902 49.5977C89.4902 74.0881 68.1619 89.5977 43.4902 89.5977C31.1698 89.5977 21.0539 85.7208 14.0205 78.8105C6.98839 71.9013 2.99023 61.913 2.99023 49.5977C2.99023 25.0002 23.9339 2.59766 48.4902 2.59766Z"
                          fill={
                            selectedGroup === group.id ? '#FFDB69' : 'white'
                          }
                          stroke="black"
                          className="transition-colors group-hover:fill-[#FFDB69]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-black md:text-xs">
                          {group.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 그룹 정보 섹션 */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[80px] w-[60px] items-center justify-center md:h-[70px] md:w-[50px]">
              <Image
                src="/wallet/groupIntro.svg"
                alt="Group character"
                width={60}
                height={80}
                className="h-[80px] w-[60px] md:h-[70px] md:w-[50px]"
              />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-xl font-bold text-black md:text-lg">
                  {loading ? '로딩중...' : groupInfo?.groupName || 'A509'}
                </h2>
                {/* 그룹원 목록 버튼 */}
                <button
                  onClick={() => setIsMemberListModalOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                  title="그룹원 목록"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-600"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </button>
              </div>

              {/* 그룹 코드 */}
              {groupInfo?.groupCode && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    그룹 코드: {groupInfo.groupCode}
                  </span>
                  <button
                    onClick={copyGroupCode}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-400 bg-white hover:bg-gray-50"
                    title="그룹 코드 복사"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-600"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              )}

              {/* 그룹 설명 */}
              <div className="flex h-[50px] w-full items-center justify-center rounded-[15px] bg-yellow-50 md:h-[40px]">
                <p className="text-center text-sm text-black md:text-xs">
                  {loading
                    ? '로딩중...'
                    : groupInfo?.groupDescription ||
                      'SSAFY 특화 프로젝트 A509 입니다 ~'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 지갑 카드 캐러셀 */}
        <div className="mb-6 w-full">
          <div className="scrollbar-hide overflow-x-auto">
            <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
              {walletLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-gray-500">카드 로딩 중...</div>
                </div>
              ) : cardsWithSelection.length > 0 ? (
                cardsWithSelection.map(card => (
                  <WalletCard
                    key={card.id}
                    card={card}
                    onClick={() => handleCardSelect(card.id)}
                    onPaymentClick={() => setIsQRModalOpen(true)}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-gray-500">
                    등록된 카드가 없습니다
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="relative mb-4 h-12 w-full">
          {Object.entries(TAB_CONFIG).map(([tabKey, tabLabel], index) => (
            <div key={tabKey} className="relative">
              <button
                onClick={() => {
                  setActiveTab(tabKey as keyof typeof TAB_CONFIG)
                  // 사용내역 탭으로 변경 시 거래 내역 조회
                  if (
                    tabKey === 'history' &&
                    selectedCard &&
                    selectedGroup !== null
                  ) {
                    fetchTransactions(selectedGroup, selectedCard, 0) // 첫 페이지로 리셋
                  }
                }}
                className={`absolute h-8 w-20 border border-black text-xs font-normal transition-colors ${
                  activeTab === tabKey
                    ? 'bg-[#efefef] text-black'
                    : 'bg-white text-black hover:bg-[#efefef]'
                }`}
                style={{
                  left: `${5 + index * 85}px`,
                  top: '8px',
                }}
              >
                <div className="flex h-full items-center justify-center">
                  {tabLabel}
                </div>
              </button>
            </div>
          ))}

          {/* 공유 버튼 (회수 버튼 옆) */}
          <div className="relative">
            <button
              onClick={() =>
                handleShareClick(
                  cardsWithSelection.find(card => card.isSelected) ||
                    cardsWithSelection[0] || {
                      id: 0,
                      name: '기본 카드',
                      amount: 0,
                    }
                )
              }
              className="absolute h-8 w-20 border border-blue-500 bg-blue-500 text-xs font-normal text-white transition-colors hover:bg-blue-600"
              style={{
                left: `${5 + Object.keys(TAB_CONFIG).length * 85}px`,
                top: '8px',
              }}
            >
              <div className="flex h-full items-center justify-center">
                공유
              </div>
            </button>
          </div>
        </div>

        {/* 탭 내용 */}
        {activeTab === 'history' && (
          <div className="mb-6">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">
                  거래 내역 로딩 중...
                </div>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map(transaction => (
                <TransactionItem
                  key={transaction.transactionId}
                  transaction={{
                    id: transaction.transactionId,
                    type:
                      transaction.transactionType === 'CHARGE'
                        ? 'charge'
                        : 'usage',
                    amount: transaction.amount,
                    date: new Date(transaction.createdAt).toLocaleDateString(
                      'ko-KR'
                    ),
                    by: transaction.customer,
                  }}
                  cardName={
                    cardsWithSelection.find(card => card.isSelected)?.name ||
                    cardsWithSelection[0]?.name ||
                    'QR'
                  }
                />
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">
                  거래 내역이 없습니다
                </div>
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 - 사용내역 탭에서만 표시 */}
        {activeTab === 'history' && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {activeTab === 'withdrawal' && cardsWithSelection.length > 0 && (
          <div className="mb-4">
            <WithdrawalSection
              selectedCard={
                cardsWithSelection.find(card => card.isSelected) ||
                cardsWithSelection[0]
              }
            />
          </div>
        )}

        {activeTab === 'withdrawal' && cardsWithSelection.length === 0 && (
          <div className="mb-4 text-center text-gray-500">
            사용 가능한 카드가 없습니다.
          </div>
        )}

        {/* 그룹 생성 모달 */}
        <GroupCreateModal
          isOpen={isGroupCreateModalOpen}
          onClose={() => setIsGroupCreateModalOpen(false)}
          onCreateGroup={handleCreateGroup}
        />

        {/* 그룹 검색 모달 */}
        <FindGroup
          isOpen={isFindGroupOpen}
          onClose={() => setIsFindGroupOpen(false)}
        />

        {/* QR 결제 모달 */}
        <QRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          cardName={
            groupWalletCards.find(card => card.storeId === selectedCard)
              ?.storeName || 'QR'
          }
          cardId={selectedCard}
        />

        {/* 공유 모달 */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={handleShareModalClose}
          selectedCard={selectedCardForShare}
          individualBalance={individualBalance}
          selectedGroup={selectedGroup || 0}
          individualWalletId={individualWalletId}
          groupInfo={groupInfo}
        />

        {/* 그룹원 목록 모달 */}
        <MemberListModal
          isOpen={isMemberListModalOpen}
          onClose={() => setIsMemberListModalOpen(false)}
          members={groupMembers}
          loading={membersLoading}
        />
      </div>
    </div>
  )
}
