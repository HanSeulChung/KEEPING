'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { GroupCreateModal } from '../ui/GroupCreateModal'
import FindGroup from './findGroup'
import QRModal from './home/QRmodal'
import PointManagementModal from './PointManagementModal'

import { buildURL } from '@/api/config'
import { useUser } from '@/contexts/UserContext'

// 타입 정의
interface Group {
  id: number
  name: string
  isSelected?: boolean
  isLeader?: boolean
  memberCount?: number
  totalPoints?: number
}

interface GroupCard {
  id: number
  name: string
  amount: number
  isSelected?: boolean
  storeId?: number
}

interface GroupTransactionDisplay {
  id: number
  type:
    | 'use'
    | 'charge'
    | 'transfer-in'
    | 'transfer-out'
    | 'share'
    | 'collect'
    | 'cancel-charge'
    | 'cancel-use'
    | 'unknown'
  amount: number
  date: string
  memberName?: string
  groupName?: string
}

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

// 회수 가능 금액 조회 API 함수
const fetchAvailableReclaimAmount = async (
  walletId: number,
  storeId: number
) => {
  try {
    const url = buildURL(
      `/wallets/${walletId}/stores/${storeId}/points/available`
    )

    // Authorization 헤더 추가
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      console.log('회수 가능 금액 조회 - 토큰 확인:', {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length,
        tokenStart: accessToken?.substring(0, 20) + '...',
      })
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      } else {
        console.warn('회수 가능 금액 조회 - 토큰이 없습니다!')
      }
    }

    console.log('회수 가능 금액 조회 요청:', {
      url,
      method: 'GET',
      headers,
      walletId,
      storeId,
      fullUrl: url,
    })

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    })

    console.log('회수 가능 금액 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('회수 가능 금액 API 에러 응답:', errorText)
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      )
    }

    const result = await response.json()
    console.log('회수 가능 금액 API 응답 데이터:', result)
    return result
  } catch (error) {
    console.error('회수 가능 금액 조회 실패:', error)
    throw error
  }
}

// 회수 API 함수
const reclaimAmount = async (
  groupId: number,
  storeId: number,
  individualWalletId: number,
  groupWalletId: number,
  shareAmount: number
) => {
  try {
    const url = buildURL(`/wallets/groups/${groupId}/stores/${storeId}/reclaim`)

    // UUID 생성 (IdempotencyKey용)
    const idempotencyKey = crypto.randomUUID()

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

    const requestBody = {
      individualWalletId,
      groupWalletId,
      shareAmount,
    }

    console.log('회수 요청:', { url, idempotencyKey, requestBody })

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        console.error('회수 API 에러 응답:', errorData)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        console.error('에러 응답 파싱 실패:', e)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('회수 API 응답:', result)
    return result
  } catch (error) {
    console.error('회수 실패:', error)
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
  type:
    | 'charge'
    | 'use'
    | 'transfer-in'
    | 'transfer-out'
    | 'cancel-charge'
    | 'cancel-use'
    | 'unknown'
  amount: number
  date: string
  by: string
}

// 더미 데이터

const TAB_CONFIG = {
  history: '사용내역',
  withdrawal: '회수',
} as const

// 거래 타입별 색상 및 라벨 정의
const getTransactionDisplayInfo = (transactionType: string) => {
  switch (transactionType) {
    case 'CHARGE':
      return { type: 'charge', label: '충전', color: 'blue' }
    case 'USE':
      return { type: 'use', label: '사용', color: 'red' }
    case 'TRANSFER_IN':
      return { type: 'transfer-in', label: '공유', color: 'green' }
    case 'TRANSFER_OUT':
      return { type: 'transfer-out', label: '회수', color: 'purple' }
    case 'CANCEL_CHARGE':
      return { type: 'cancel-charge', label: '충전취소', color: 'orange' }
    case 'CANCEL_USE':
      return { type: 'cancel-use', label: '사용취소', color: 'yellow' }
    default:
      return { type: 'unknown', label: '알 수 없음', color: 'gray' }
  }
}

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

// 거래 타입별 스타일 함수
const getTransactionTypeStyle = (type: string) => {
  switch (type) {
    case 'charge':
      return 'border-blue-500 text-blue-500'
    case 'use':
      return 'border-red-500 text-red-500'
    case 'transfer-in':
      return 'border-green-500 text-green-500'
    case 'transfer-out':
      return 'border-purple-500 text-purple-500'
    case 'cancel-charge':
      return 'border-orange-500 text-orange-500'
    case 'cancel-use':
      return 'border-yellow-500 text-yellow-500'
    default:
      return 'border-gray-500 text-gray-500'
  }
}

// 거래 타입별 라벨 함수
const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case 'charge':
      return '충전'
    case 'use':
      return '사용'
    case 'transfer-in':
      return '공유'
    case 'transfer-out':
      return '회수'
    case 'cancel-charge':
      return '충전취소'
    case 'cancel-use':
      return '사용취소'
    default:
      return '알 수 없음'
  }
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
      {/* 거래 타입 라벨 */}
      <div
        className={`absolute top-4 left-4 flex h-6 w-13 items-center justify-center border text-sm font-extrabold ${getTransactionTypeStyle(transaction.type)}`}
      >
        {getTransactionTypeLabel(transaction.type)}
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
    if (
      individualBalance &&
      individualBalance.length > 0 &&
      !selectedIndividualCard
    ) {
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

      // 페이지 새로고침으로 카드 정보 업데이트
      window.location.reload()
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
          {/* 개인 카드 선택 드롭다운 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              공유할 개인 카드 선택
            </label>
            <select
              value={selectedIndividualCard?.storeId || ''}
              onChange={e => {
                const selected = individualBalance?.find(
                  balance => balance.storeId === parseInt(e.target.value)
                )
                setSelectedIndividualCard(selected)
              }}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">카드를 선택해주세요</option>
              {individualBalance?.map(balance => (
                <option key={balance.storeId} value={balance.storeId}>
                  {balance.storeName} (잔액:{' '}
                  {balance.remainingPoints.toLocaleString()}원)
                </option>
              )) || []}
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

// 회수 섹션 컴포넌트
const WithdrawalSection = ({
  selectedCard,
  availableReclaimAmount,
  reclaimAmountInput,
  setReclaimAmountInput,
  handleReclaim,
  isReclaiming,
  reclaimLoading,
}: {
  selectedCard: WalletCard | undefined
  availableReclaimAmount: number
  reclaimAmountInput: string
  setReclaimAmountInput: (value: string) => void
  handleReclaim: () => void
  isReclaiming: boolean
  reclaimLoading: boolean
}) => {
  const handleReclaimAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 입력 가능
    setReclaimAmountInput(value)
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
            {availableReclaimAmount.toLocaleString()}
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
            value={reclaimAmountInput}
            onChange={handleReclaimAmountChange}
            placeholder="0"
            className="absolute top-[12px] right-[20px] w-[120px] border-none bg-transparent text-right text-base font-bold text-black outline-none md:text-sm"
            disabled={reclaimLoading}
          />
        </div>
      </div>

      <button
        onClick={handleReclaim}
        disabled={reclaimLoading || isReclaiming}
        className="flex h-10 w-full items-center justify-center border border-black bg-black disabled:bg-gray-400"
      >
        <span className="text-sm font-bold text-white">
          {reclaimLoading || isReclaiming ? '회수 중...' : '회수하기'}
        </span>
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
          ) : members && members.length > 0 ? (
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
  const [isPointManagementModalOpen, setIsPointManagementModalOpen] =
    useState(false)
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

  // 회수 관련 상태
  const [availableReclaimAmount, setAvailableReclaimAmount] =
    useState<number>(0)
  const [reclaimAmountInput, setReclaimAmountInput] = useState<string>('')
  const [isReclaiming, setIsReclaiming] = useState(false)
  const [reclaimLoading, setReclaimLoading] = useState(false)

  // 현재 사용자가 리더인지 확인하는 상태
  const [isCurrentUserLeader, setIsCurrentUserLeader] = useState(false)
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false)

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

  // individualBalance 상태 변경 디버깅
  useEffect(() => {
    console.log('individualBalance 상태 변경:', individualBalance)
  }, [individualBalance])

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

  // 사용자 정보가 로드되면 리더 여부 다시 확인
  useEffect(() => {
    if (user && groupMembers.length > 0) {
      const currentUserMember = groupMembers.find(
        (member: GroupMember) =>
          member.customerId === user.userId || member.customerName === user.name
      )
      console.log('사용자 정보 로드 후 리더 확인:', currentUserMember?.isLeader)
      setIsCurrentUserLeader(currentUserMember?.isLeader || false)
    }
  }, [user, groupMembers])

  // 카드가 로드되면 첫 번째 카드 자동 선택 및 회수 가능 금액 조회
  useEffect(() => {
    if (groupWalletCards && groupWalletCards.length > 0) {
      const firstCard = groupWalletCards[0]
      if (firstCard && selectedCard !== firstCard.storeId) {
        setSelectedCard(firstCard.storeId)
        // 첫 번째 카드 선택 시 회수 가능 금액 조회
        if (groupInfo && groupInfo.walletId) {
          fetchAvailableReclaimAmountData(groupInfo.walletId, firstCard.storeId)
        }
      }
    }
  }, [groupWalletCards, groupInfo])

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId)
    // 카드 선택 시 해당 카드의 거래 내역 조회
    if (activeTab === 'history' && selectedGroup !== null) {
      fetchTransactions(selectedGroup, cardId, 0) // 첫 페이지로 리셋
    }
    // 카드 선택 시 해당 카드의 회수 가능 금액 조회
    if (groupInfo && groupInfo.walletId) {
      fetchAvailableReclaimAmountData(groupInfo.walletId, cardId)
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
      console.log('그룹 멤버 API 응답:', result) // 디버깅용 로그

      if (result.success && result.data) {
        const members = Array.isArray(result.data) ? result.data : []
        setGroupMembers(members)

        // 현재 사용자가 리더인지 확인
        const currentUser = user
        console.log('현재 사용자 정보:', currentUser)
        console.log('그룹 멤버 목록:', members)

        if (currentUser) {
          const currentUserMember = members.find(
            (member: GroupMember) =>
              member.customerId === currentUser.userId ||
              member.customerName === currentUser.name
          )

          console.log('찾은 현재 사용자 멤버:', currentUserMember)
          console.log('리더 여부:', currentUserMember?.isLeader)

          setIsCurrentUserLeader(currentUserMember?.isLeader || false)
        } else {
          console.log('사용자 정보가 아직 로드되지 않음')
          setIsCurrentUserLeader(false)
        }
      } else {
        console.warn('그룹 멤버 데이터가 없습니다:', result)
        setGroupMembers([])
        setIsCurrentUserLeader(false)
      }
    } catch (error) {
      console.error('그룹 멤버 조회 실패:', error)
      setGroupMembers([])
    } finally {
      setMembersLoading(false)
    }
  }

  const fetchWalletCards = async (groupId: number) => {
    setWalletLoading(true)
    try {
      const result = await fetchGroupWalletBalance(groupId)
      console.log('그룹 지갑 카드 API 응답:', result) // 디버깅용 로그

      if (result.success && result.data) {
        // walletId 추출하여 groupInfo 업데이트
        if (result.data.walletId && groupInfo) {
          setGroupInfo(prev =>
            prev ? { ...prev, walletId: result.data.walletId } : null
          )
          console.log('그룹 walletId 업데이트:', result.data.walletId)
        }

        // 백엔드에서 페이징을 제거했다면 직접 배열을 반환할 것
        const storeBalances =
          result.data.storeBalances?.content || result.data.storeBalances || []
        console.log('처리된 그룹 지갑 storeBalances:', storeBalances) // 디버깅용
        setGroupWalletCards(Array.isArray(storeBalances) ? storeBalances : [])
      } else {
        console.warn('그룹 지갑 카드 데이터가 없습니다:', result)
        setGroupWalletCards([])
      }
    } catch (error) {
      console.error('그룹 지갑 카드 조회 실패:', error)
      setGroupWalletCards([])
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
      console.log('거래 내역 API 응답:', result) // 디버깅용 로그

      if (result.success && result.data) {
        // 백엔드에서 페이징을 제거했다면 직접 배열을 반환할 것
        const transactions =
          result.data.transactions?.content || result.data.transactions || []
        console.log('처리된 거래 내역:', transactions) // 디버깅용
        setTransactions(Array.isArray(transactions) ? transactions : [])
        // 페이징이 제거되었다면 페이지 관련 상태는 기본값으로 설정
        setCurrentPage(result.data.transactions?.number || 0)
        setTotalPages(result.data.transactions?.totalPages || 1)
      } else {
        console.warn('거래 내역 데이터가 없습니다:', result)
        setTransactions([])
        setCurrentPage(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('그룹 거래 내역 조회 실패:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  // 회수 가능 금액 조회
  const fetchAvailableReclaimAmountData = async (
    walletId: number,
    storeId: number
  ) => {
    try {
      const result = await fetchAvailableReclaimAmount(walletId, storeId)
      console.log('회수 가능 금액 조회 결과:', result)

      if (result.success && result.data) {
        setAvailableReclaimAmount(result.data.available || 0)
      } else {
        console.warn('회수 가능 금액 데이터가 없습니다:', result)
        setAvailableReclaimAmount(0)
      }
    } catch (error) {
      console.error('회수 가능 금액 조회 실패:', error)
      // 임시로 기본값 설정 (백엔드 API가 구현되지 않은 경우)
      console.log(
        '회수 가능 금액 API가 구현되지 않았습니다. 기본값 0으로 설정합니다.'
      )
      setAvailableReclaimAmount(0)
    }
  }

  // 개인 지갑 잔액 가져오기
  const fetchIndividualBalanceData = async () => {
    try {
      const result = await fetchIndividualBalance()
      console.log('개인 지갑 잔액 API 응답:', result) // 디버깅용 로그

      if (result.success && result.data) {
        // 백엔드에서 페이징을 제거했으므로 직접 배열을 반환
        const storeBalances = result.data.storeBalances || []
        console.log('처리된 storeBalances:', storeBalances) // 디버깅용
        console.log(
          'storeBalances 타입:',
          typeof storeBalances,
          '길이:',
          storeBalances?.length
        ) // 디버깅용
        setIndividualBalance(Array.isArray(storeBalances) ? storeBalances : [])
        setIndividualWalletId(result.data.walletId || 0) // 개인 지갑 ID 저장
        console.log('individualBalance 상태 설정 완료') // 디버깅용
      } else {
        console.warn('개인 지갑 잔액 데이터가 없습니다:', result)
        setIndividualBalance([])
        setIndividualWalletId(0)
      }
    } catch (error) {
      console.error('개인 지갑 잔액 조회 실패:', error)
      setIndividualBalance([])
      setIndividualWalletId(0)
    }
  }

  // 회수 실행 함수
  const handleReclaim = async () => {
    if (!selectedGroup || !selectedCard || !individualWalletId || !groupInfo) {
      alert('필수 정보가 누락되었습니다.')
      return
    }

    const amount = parseFloat(reclaimAmountInput)
    if (!amount || amount <= 0) {
      alert('올바른 금액을 입력해주세요.')
      return
    }

    if (amount > availableReclaimAmount) {
      alert('회수 가능 금액을 초과했습니다.')
      return
    }

    setIsReclaiming(true)
    setReclaimLoading(true)

    // 요청 간격 추가 (500ms)
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      console.log('회수 실행 - 파라미터 확인:', {
        selectedGroup,
        selectedCard,
        individualWalletId,
        groupWalletId: groupInfo.walletId,
        amount,
        groupInfo,
      })

      const result = await reclaimAmount(
        selectedGroup,
        selectedCard,
        individualWalletId,
        groupInfo.walletId,
        amount
      )

      if (result.success) {
        alert('회수가 완료되었습니다.')
        setReclaimAmountInput('')
        // 데이터 새로고침
        await Promise.all([
          fetchIndividualBalanceData(),
          fetchWalletCards(selectedGroup),
          fetchAvailableReclaimAmountData(groupInfo.walletId, selectedCard),
        ])
      } else {
        alert(
          `회수 실패: ${result.message || '알 수 없는 오류가 발생했습니다.'}`
        )
      }
    } catch (error) {
      console.error('회수 처리 중 오류:', error)
      alert('회수 처리 중 오류가 발생했습니다.')
    } finally {
      setIsReclaiming(false)
      setReclaimLoading(false)
    }
  }

  // 그룹 탈퇴 함수
  const handleLeaveGroup = async () => {
    if (!selectedGroup) {
      alert('그룹 정보가 없습니다.')
      return
    }

    const confirmMessage = `정말로 이 그룹에서 탈퇴하시겠습니까?`
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const url = buildURL(`/groups/${selectedGroup}/group-member`)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      console.log('그룹 탈퇴 요청:', {
        url,
        method: 'DELETE',
        headers,
        groupId: selectedGroup,
      })

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })

      console.log('그룹 탈퇴 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `그룹 탈퇴에 실패했습니다. (${response.status})`

        try {
          const errorData = await response.json()
          console.log('그룹 탈퇴 에러 응답:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log('그룹 탈퇴 에러 텍스트:', errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }

        console.log('그룹 탈퇴 실패 - 최종 에러 메시지:', errorMessage)
        alert(errorMessage)
        return
      }

      const result = await response.json()
      console.log('그룹 탈퇴 성공 응답:', result)

      alert('그룹에서 성공적으로 탈퇴했습니다.')

      // 그룹 목록 새로고침
      await loadUserGroups()

      // 페이지 새로고침으로 UI 업데이트
      window.location.reload()
    } catch (error) {
      console.error('그룹 탈퇴 실패:', error)
      alert('그룹 탈퇴 중 오류가 발생했습니다.')
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
      // 그룹 멤버, 지갑 카드 조회
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

      // 모달 닫기
      setIsGroupCreateModalOpen(false)

      // 성공 알림
      alert('그룹이 성공적으로 생성되었습니다!')

      // 페이지 새로고침으로 그룹 목록 업데이트
      window.location.reload()
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
  const cardsWithSelection = (groupWalletCards || []).map(card => ({
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
    <div className="min-h-screen w-full pb-20">
      {/* 헤더 */}
      <div className="flex w-full items-center bg-[#fddb5f] px-4 py-3">
        <svg
          width={24}
          height={24}
          viewBox="0 0 40 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 27V24.375C0 23.1806 0.611111 22.2083 1.83333 21.4583C3.05556 20.7083 4.66667 20.3333 6.66667 20.3333C7.02778 20.3333 7.375 20.3403 7.70833 20.3542C8.04167 20.3681 8.36111 20.4028 8.66667 20.4583C8.27778 21.0417 7.98611 21.6528 7.79167 22.2917C7.59722 22.9306 7.5 23.5972 7.5 24.2917V27H0ZM10 27V24.2917C10 23.4028 10.2431 22.5903 10.7292 21.8542C11.2153 21.1181 11.9028 20.4722 12.7917 19.9167C13.6806 19.3611 14.7431 18.9444 15.9792 18.6667C17.2153 18.3889 18.5556 18.25 20 18.25C21.4722 18.25 22.8264 18.3889 24.0625 18.6667C25.2986 18.9444 26.3611 19.3611 27.25 19.9167C28.1389 20.4722 28.8194 21.1181 29.2917 21.8542C29.7639 22.5903 30 23.4028 30 24.2917V27H10ZM32.5 27V24.2917C32.5 23.5694 32.4097 22.8889 32.2292 22.25C32.0486 21.6111 31.7778 21.0139 31.4167 20.4583C31.7222 20.4028 32.0347 20.3681 32.3542 20.3542C32.6736 20.3403 33 20.3333 33.3333 20.3333C35.3333 20.3333 36.9444 20.7014 38.1667 21.4375C39.3889 22.1736 40 23.1528 40 24.375V27H32.5ZM13.5417 23.6667H26.5C26.2222 23.1111 25.4514 22.625 24.1875 22.2083C22.9236 21.7917 21.5278 21.5833 20 21.5833C18.4722 21.5833 17.0764 21.7917 15.8125 22.2083C14.5486 22.625 13.7917 23.1111 13.5417 23.6667ZM6.66667 18.6667C5.75 18.6667 4.96528 18.3403 4.3125 17.6875C3.65972 17.0347 3.33333 16.25 3.33333 15.3333C3.33333 14.3889 3.65972 13.5972 4.3125 12.9583C4.96528 12.3194 5.75 12 6.66667 12C7.61111 12 8.40278 12.3194 9.04167 12.9583C9.68056 13.5972 10 14.3889 10 15.3333C10 16.25 9.68056 17.0347 9.04167 17.6875C8.40278 18.3403 7.61111 18.6667 6.66667 18.6667ZM33.3333 18.6667C32.4167 18.6667 31.6319 18.3403 30.9792 17.6875C30.3264 17.0347 30 16.25 30 15.3333C30 14.3889 30.3264 13.5972 30.9792 12.9583C31.6319 12.3194 32.4167 12 33.3333 12C34.2778 12 35.0694 12.3194 35.7083 12.9583C36.3472 13.5972 36.6667 14.3889 36.6667 15.3333C36.6667 16.25 36.3472 17.0347 35.7083 17.6875C35.0694 18.3403 34.2778 18.6667 33.3333 18.6667ZM20 17C18.6111 17 17.4306 16.5139 16.4583 15.5417C15.4861 14.5694 15 13.3889 15 12C15 10.5833 15.4861 9.39583 16.4583 8.4375C17.4306 7.47917 18.6111 7 20 7C21.4167 7 22.6042 7.47917 23.5625 8.4375C24.5208 9.39583 25 10.5833 25 12C25 13.3889 24.5208 14.5694 23.5625 15.5417C22.6042 16.5139 21.4167 17 20 17ZM20 13.6667C20.4722 13.6667 20.8681 13.5069 21.1875 13.1875C21.5069 12.8681 21.6667 12.4722 21.6667 12C21.6667 11.5278 21.5069 11.1319 21.1875 10.8125C20.8681 10.4931 20.4722 10.3333 20 10.3333C19.5278 10.3333 19.1319 10.4931 18.8125 10.8125C18.4931 11.1319 18.3333 11.5278 18.3333 12C18.3333 12.4722 18.4931 12.8681 18.8125 13.1875C19.1319 13.5069 19.5278 13.6667 20 13.6667Z"
            fill="white"
          />
        </svg>
        <div className="ml-2 font-['Jalnan2TTF'] text-lg leading-[140%] text-white">
          그룹 지갑
        </div>
      </div>

      {/* 검색 및 추가 버튼 */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* 검색 버튼 */}
        <button
          onClick={() => setIsFindGroupOpen(true)}
          className="flex h-[31px] w-[42px] items-center justify-center rounded-[10px] bg-[#ccc]"
        >
          <svg
            width={17}
            height={17}
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.875 14.875L11.7938 11.7938M13.4583 7.79167C13.4583 10.9213 10.9213 13.4583 7.79167 13.4583C4.66205 13.4583 2.125 10.9213 2.125 7.79167C2.125 4.66205 4.66205 2.125 7.79167 2.125C10.9213 2.125 13.4583 4.66205 13.4583 7.79167Z"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 그룹 리스트 */}
        <div className="flex gap-2">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => {
                if ('isAddButton' in group && group.isAddButton) {
                  setIsGroupCreateModalOpen(true)
                } else {
                  handleGroupSelect(group.id)
                }
              }}
              className={`flex h-[25px] items-center justify-center rounded-[10px] border-2 px-3 transition-colors ${
                selectedGroup === group.id
                  ? 'border-[#fddb5f] bg-[#fddb5f] text-white'
                  : 'border-[#ccc] bg-white text-[#ccc]'
              }`}
            >
              <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold">
                {'isAddButton' in group && group.isAddButton ? '+' : group.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 그룹 선택 상태에 따른 내용 표시 */}
      {selectedGroup === null ? (
        /* 그룹이 선택되지 않았을 때 */
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 text-lg text-gray-500">
              모임을 생성하거나 모임을 선택해주세요
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsGroupCreateModalOpen(true)}
                className="rounded-lg bg-[#fdda60] px-6 py-3 font-['Jalnan2TTF'] text-white"
              >
                모임 생성
              </button>
              <button
                onClick={() => setIsFindGroupOpen(true)}
                className="rounded-lg border-2 border-[#fdda60] px-6 py-3 font-['Jalnan2TTF'] text-[#fdda60]"
              >
                모임 찾기
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 그룹이 선택되었을 때 */
        <>
          {/* 그룹명 및 드롭다운 */}
          <div className="mb-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-['Jalnan2TTF'] text-xl leading-[140%] text-[#99a1af]">
                  {groupInfo?.groupName || '눈농팀'}
                </div>
                <button
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  className="flex items-center justify-center"
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="#99a1af"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* 그룹 코드 및 복사 버튼 */}
              <div className="flex items-center gap-2">
                <div className="font-['NanumSquareRound'] text-sm font-medium text-gray-500">
                  그룹 코드: {groupInfo?.groupCode || selectedGroup}
                </div>
                <button
                  onClick={copyGroupCode}
                  className="flex items-center justify-center rounded-lg bg-[#ffc800] px-2 py-1"
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 드롭다운 메뉴 */}
            {isGroupDropdownOpen && (
              <div className="mt-2 space-y-2">
                <button
                  onClick={() => {
                    setIsMemberListModalOpen(true)
                    setIsGroupDropdownOpen(false)
                  }}
                  className="flex h-[25px] w-full items-center justify-center rounded-[10px] border-2 border-[#ccc] bg-white px-3"
                >
                  <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold text-[#ccc]">
                    멤버 보기
                  </div>
                  <div className="ml-1 font-['NanumSquareRoundEB'] text-xl leading-[140%] font-bold text-white">
                    +
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsPointManagementModalOpen(true)
                    setIsGroupDropdownOpen(false)
                  }}
                  className="flex h-[25px] w-full items-center justify-center rounded-[10px] border-2 border-[#ccc] bg-white px-3"
                >
                  <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold text-[#ccc]">
                    포인트 관리
                  </div>
                  <div className="ml-1 font-['NanumSquareRoundEB'] text-xl leading-[140%] font-bold text-white">
                    +
                  </div>
                </button>

                {isCurrentUserLeader ? (
                  <button
                    onClick={() => {
                      window.location.href = `/customer/groupSettings?groupId=${selectedGroup}`
                      setIsGroupDropdownOpen(false)
                    }}
                    className="flex h-[25px] w-full items-center justify-center rounded-[10px] border-2 border-[#ccc] bg-white px-3"
                  >
                    <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold text-[#ccc]">
                      그룹 설정
                    </div>
                    <div className="ml-1 font-['NanumSquareRoundEB'] text-xl leading-[140%] font-bold text-white">
                      +
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleLeaveGroup()
                      setIsGroupDropdownOpen(false)
                    }}
                    className="flex h-[25px] w-full items-center justify-center rounded-[10px] border-2 border-[#ccc] bg-white px-3"
                  >
                    <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold text-[#ccc]">
                      그룹 나가기
                    </div>
                    <div className="ml-1 font-['NanumSquareRoundEB'] text-xl leading-[140%] font-bold text-white">
                      +
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 지갑 카드 캐러셀 */}
          <div className="px-4 py-6">
            <div className="scrollbar-hide overflow-x-auto">
              <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
                {walletLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-gray-500">카드 로딩 중...</div>
                  </div>
                ) : cardsWithSelection.length > 0 ? (
                  cardsWithSelection.map(card => (
                    <GroupWalletCard
                      key={card.id}
                      card={card}
                      onClick={() => handleCardSelect(card.id)}
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

          {/* 사용내역 탭 */}
          <div className="mb-6 px-4">
            <div className="flex w-52 items-start">
              <button
                onClick={() => setActiveTab('history')}
                className="flex items-center justify-center rounded-tl-lg rounded-tr-lg bg-[#fdda60] px-3 py-1 text-white"
              >
                <div className="font-['Jalnan2TTF'] text-xl leading-[140%]">
                  사용내역
                </div>
              </button>
            </div>
          </div>

          {/* 사용내역 내용 */}
          <div className="mb-6 px-4">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">거래 내역을 불러오는 중...</div>
              </div>
            ) : transactions && transactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">거래 내역이 없습니다.</div>
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction, index) => {
                  const displayInfo = getTransactionDisplayInfo(
                    transaction.transactionType
                  )
                  return (
                    <div key={transaction.transactionId}>
                      <GroupTransactionItem
                        transaction={{
                          id: transaction.transactionId,
                          type: displayInfo.type as GroupTransactionDisplay['type'],
                          amount: transaction.amount,
                          date: new Date(
                            transaction.createdAt
                          ).toLocaleDateString('ko-KR'),
                          memberName: transaction.customer,
                          groupName: groupInfo?.groupName,
                        }}
                      />
                      {index < transactions.length - 1 && (
                        <div className="my-2 h-[3px] w-full bg-neutral-100" />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        </>
      )}

      {/* 모달들 */}
      <GroupCreateModal
        isOpen={isGroupCreateModalOpen}
        onClose={() => setIsGroupCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      <FindGroup
        isOpen={isFindGroupOpen}
        onClose={() => setIsFindGroupOpen(false)}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        cardName={
          (groupWalletCards || []).find(card => card.storeId === selectedCard)
            ?.storeName || 'QR'
        }
        cardId={selectedCard}
        walletId={groupInfo?.walletId}
      />

      <MemberListModal
        isOpen={isMemberListModalOpen}
        onClose={() => setIsMemberListModalOpen(false)}
        members={groupMembers}
        loading={membersLoading}
      />

      <PointManagementModal
        isOpen={isPointManagementModalOpen}
        onClose={() => setIsPointManagementModalOpen(false)}
        groupName={groupInfo?.groupName || '그룹'}
        groupId={selectedGroup || 0}
        groupWalletId={groupInfo?.walletId || 0}
        individualWalletId={individualWalletId}
        individualBalance={individualBalance}
        onShareSuccess={() => {
          // 공유 성공 시 데이터 새로고침
          if (selectedGroup) {
            fetchWalletCards(selectedGroup)
            fetchIndividualBalanceData()
          }
        }}
        onReclaimSuccess={() => {
          // 회수 성공 시 데이터 새로고침
          if (selectedGroup) {
            fetchWalletCards(selectedGroup)
            fetchIndividualBalanceData()
          }
        }}
      />
    </div>
  )
}

// 그룹 지갑 카드 컴포넌트
const GroupWalletCard = ({
  card,
  onClick,
}: {
  card: GroupCard
  onClick: () => void
}) => {
  const getCardColor = (index: number) => {
    const colors = ['#ff6f6f', '#ff8b68', '#ffd23c']
    return colors[index % colors.length]
  }

  const cardColor = getCardColor(card.id - 1)

  return (
    <div
      className={`inline-flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 pt-[21px] pr-[19px] pb-5 pl-[19px] transition-colors ${
        card.isSelected ? 'bg-white' : 'bg-white hover:bg-gray-50'
      }`}
      style={{
        borderColor: cardColor,
        backgroundColor: card.isSelected ? cardColor : 'white',
      }}
      onClick={onClick}
    >
      <div
        className="text-[15px] leading-[140%] font-extrabold"
        style={{ color: card.isSelected ? 'white' : cardColor }}
      >
        {card.name}
      </div>
      <div
        className="text-[15px] leading-[140%] font-extrabold"
        style={{ color: card.isSelected ? 'white' : cardColor }}
      >
        {card.amount.toLocaleString()} P
      </div>
    </div>
  )
}

// 그룹 거래 내역 아이템 컴포넌트
const GroupTransactionItem = ({
  transaction,
}: {
  transaction: GroupTransactionDisplay
}) => {
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'use':
        return '#ff6f6f'
      case 'charge':
        return '#6caeff'
      case 'transfer-in':
        return '#a4e846'
      case 'transfer-out':
        return '#e174ff'
      case 'share':
        return '#a4e846'
      case 'collect':
        return '#e174ff'
      default:
        return '#ff6f6f'
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'use':
        return '사용'
      case 'charge':
        return '충전'
      case 'transfer-in':
        return '공유'
      case 'transfer-out':
        return '회수'
      case 'share':
        return '공유'
      case 'collect':
        return '회수'
      default:
        return '알 수 없음'
    }
  }

  const transactionColor = getTransactionColor(transaction.type)

  return (
    <div className="mb-4 flex w-full items-center justify-between">
      {/* 거래 타입 라벨 */}
      <div
        className="inline-flex flex-col items-center justify-center rounded-[10px] border-[3px] pt-[11px] pr-2 pb-2 pl-[9px] text-white"
        style={{
          borderColor: transactionColor,
          backgroundColor: transactionColor,
        }}
      >
        <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold">
          {getTransactionLabel(transaction.type)}
        </div>
      </div>

      {/* 금액 */}
      <div className="font-['NanumSquareRoundEB'] text-xl leading-[140%] font-extrabold text-gray-500">
        {transaction.amount.toLocaleString()}P
      </div>

      {/* 멤버명 또는 그룹명 */}
      {transaction.memberName && (
        <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold text-[#ffc800]">
          {transaction.memberName}
        </div>
      )}

      {/* 날짜 */}
      <div className="font-['NanumSquareRoundEB'] text-[15px] leading-[140%] font-extrabold text-[#ccc]">
        {transaction.date}
      </div>
    </div>
  )
}

export default GroupWallet
