'use client'
import { useState } from 'react'
import { Modal } from './Modal'

interface GroupCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGroup: (groupName: string, groupDescription: string) => void
}

export const GroupCreateModal = ({
  isOpen,
  onClose,
  onCreateGroup,
}: GroupCreateModalProps) => {
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')

  const handleCreateGroup = () => {
    if (groupName.trim() && groupDescription.trim()) {
      onCreateGroup(groupName.trim(), groupDescription.trim())
      setGroupName('')
      setGroupDescription('')
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="그룹 생성"
      height="h-[360px]"
    >
      {/* 모임 이름 입력 */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="모임 이름"
            className="font-nanum-square-round-eb w-full rounded-[28px] border border-[#fdda60] px-5 py-3 text-gray-800 placeholder-[#fdda60] focus:outline-none"
          />
        </div>
      </div>

      {/* 모임 설명 입력 */}
      <div className="mb-6">
        <div className="relative">
          <textarea
            value={groupDescription}
            onChange={e => setGroupDescription(e.target.value)}
            placeholder="모임 설명"
            className="font-nanum-square-round-eb w-full resize-none rounded-[28px] border border-[#fdda60] px-5 py-3 text-gray-800 placeholder-[#fdda60] focus:outline-none"
            rows={3}
          />
        </div>
      </div>

      {/* 모임 생성하기 버튼 */}
      <div>
        <button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || !groupDescription.trim()}
          className={`font-jalnan w-full rounded-[10px] px-4 py-3 text-white transition-colors ${
            groupName.trim() && groupDescription.trim()
              ? 'bg-[#fdda60] hover:bg-[#f4d03f]'
              : 'cursor-not-allowed bg-gray-400'
          }`}
        >
          모임 생성하기
        </button>
      </div>
    </Modal>
  )
}
