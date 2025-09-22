'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { GroupCreateModal } from '../ui/GroupCreateModal'
import FindGroup from './findGroup'

import { useUser } from '@/contexts/UserContext'
import { useGroupBundle, useGroups } from '@/hooks/useGroupWallet'

/** UI 전용 타입 */
interface WalletCard {
  id: number
  name: string
  amount: number
  isSelected?: boolean
}

interface Transaction {
  id: number
  type: 'charge' | 'usage'
  amount: number
  date: string
  by: string
}

const TAB_CONFIG = {
  history: '사용내역',
  share: '공유',
  withdrawal: '회수',
} as const

/** 지갑 카드 */
const WalletCard = ({
  card,
  onClick,
}: {
  card: WalletCard
  onClick: () => void
}) => (
  <div
    className={`relative h-44 w-44 cursor-pointer border border-black transition-colors md:h-40 md:w-40 ${
      card.isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50'
    }`}
    onClick={onClick}
  >
    <div className="absolute top-4 left-4 text-base font-normal text-black md:text-sm">
      {card.name}
    </div>
    <div className="absolute top-4 right-4 text-sm font-normal text-black md:text-xs">
      {card.id.toString().padStart(2, '0')}
    </div>
    <div className="absolute top-12 right-4 left-4 h-px bg-black"></div>
    <div className="absolute top-18 left-1/2 -translate-x-1/2 text-base font-extrabold text-black md:text-sm">
      {card.amount.toLocaleString()}원
    </div>
    <div className="absolute top-32 left-1/2 -translate-x-1/2 md:top-28">
      <div className="flex h-6 w-16 items-center justify-center border-2 border-blue-500 bg-white md:h-5 md:w-15">
        <span className="text-sm font-bold text-blue-500 md:text-xs">
          결제하기
        </span>
      </div>
    </div>
  </div>
)

/** 거래 내역 */
const TransactionItem = ({ transaction }: { transaction: Transaction }) => (
  <div className="relative h-16 w-full">
    <div
      className={`absolute top-4 left-4 flex h-6 w-13 items-center justify-center border text-sm font-extrabold ${
        transaction.type === 'charge'
          ? 'border-blue-500 text-blue-500'
          : 'border-red-500 text-red-500'
      }`}
    >
      {transaction.type === 'charge' ? '충전' : '사용'}
    </div>
    <div className="absolute top-4 left-20 text-sm font-extrabold text-black">
      {transaction.amount.toLocaleString()}원
    </div>
    <div className="absolute top-5 left-44 text-xs font-extrabold text-gray-400">
      {transaction.date}
    </div>
    <div className="absolute top-4 right-4 text-xs font-bold text-black">
      by {transaction.by}
    </div>
    <div className="absolute right-3 bottom-4 left-3 h-px bg-gray-300"></div>
  </div>
)

/** 메인 컴포넌트 */
export const GroupWallet = () => {
  const { user } = useUser()
  const { data: groups } = useGroups()

  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const gid = useMemo(
    () => selectedGroup ?? groups?.[0]?.groupId ?? null,
    [selectedGroup, groups]
  )

  const { group, members, transactions, cards } = useGroupBundle(gid)

  const [activeTab, setActiveTab] = useState<keyof typeof TAB_CONFIG>('history')
  const [hoveredMember, setHoveredMember] = useState<number | null>(null)
  const [isGroupCreateModalOpen, setIsGroupCreateModalOpen] = useState(false)
  const [isFindGroupOpen, setIsFindGroupOpen] = useState(false)

  // 멤버 보정: 백엔드에서 리더를 안 주는 경우 추가
  const displayMembers = useMemo(() => {
    if (!group) return []
    if (!members || members.length === 0) {
      return user
        ? [
            {
              customerId: user.userId,
              name: user.name,
              leader: true,
              profileImageUrl: user.imgUrl,
            },
          ]
        : []
    }
    return members
  }, [members, group, user])

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black md:text-xl">
            모임 지갑
          </h1>
          <button
            onClick={() => setIsFindGroupOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
          >
            <svg
              width={20}
              height={20}
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

        {/* 그룹 선택 */}
        <div className="mb-6 flex gap-4 overflow-x-auto">
          {groups?.map(g => (
            <button
              key={g.groupId}
              onClick={() => setSelectedGroup(g.groupId)}
              className={`h-20 w-20 rounded-full border ${
                gid === g.groupId ? 'bg-yellow-200' : 'bg-white'
              }`}
            >
              {g.groupName}
            </button>
          ))}
          <button
            onClick={() => setIsGroupCreateModalOpen(true)}
            className="flex h-20 w-20 items-center justify-center rounded-full border bg-gray-200"
          >
            +
          </button>
        </div>

        {/* 그룹 정보 */}
        {group && (
          <div className="mb-6">
            <h2 className="text-xl font-bold">{group.groupName}</h2>
            <p className="text-sm text-gray-600">{group.groupDescription}</p>
            <p className="text-xs text-gray-400">
              그룹 코드: {group.inviteCode}
            </p>
          </div>
        )}

        {/* 멤버 */}
        <div className="mb-6 flex gap-3 overflow-x-auto">
          {displayMembers.map(m => (
            <div key={m.customerId} className="relative">
              <Image
                src={m.profileImageUrl || '/default.png'}
                alt={m.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border"
              />
              {m.leader && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full border bg-yellow-400"></span>
              )}
              {hoveredMember === m.customerId && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white">
                  {m.name}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 카드 */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {cards?.map(c => (
            <WalletCard key={c.id} card={c} onClick={() => {}} />
          ))}
        </div>

        {/* 탭 */}
        <div className="mb-6 flex gap-2">
          {Object.entries(TAB_CONFIG).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as keyof typeof TAB_CONFIG)}
              className={`flex-1 border py-2 ${
                activeTab === key ? 'bg-gray-200' : 'bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭 내용 */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {transactions?.map(t => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </div>
        )}

        {activeTab === 'share' && (
          <div className="border p-4">공유하기 UI 자리</div>
        )}

        {activeTab === 'withdrawal' && (
          <div className="border p-4">회수하기 UI 자리</div>
        )}

        {/* 모달 */}
        <GroupCreateModal
          isOpen={isGroupCreateModalOpen}
          onClose={() => setIsGroupCreateModalOpen(false)}
          onCreateGroup={() => {}}
        />
        <FindGroup
          isOpen={isFindGroupOpen}
          onClose={() => setIsFindGroupOpen(false)}
        />
      </div>
    </div>
  )
}
