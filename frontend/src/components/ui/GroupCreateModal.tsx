'use client'
import { useState } from 'react'

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

  if (!isOpen) return null

  const handleCreateGroup = () => {
    if (groupName.trim() && groupDescription.trim()) {
      onCreateGroup(groupName.trim(), groupDescription.trim())
      setGroupName('')
      setGroupDescription('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative h-[622px] w-[412px] rounded-[30px] bg-[#fbf9f5]">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4">
          <div className="font-['Jalnan2TTF'] text-xl leading-[140%] text-[#ffc800]">
            그룹 생성
          </div>
          <button onClick={onClose}>
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

        {/* 노란색 구분선 */}
        <div className="h-[3px] w-full bg-[#ffc800]" />

        {/* 그룹 생성 폼 */}
        <div className="p-4">
          {/* 모임 이름 입력 */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="모임 이름"
                className="w-full rounded-[28px] border border-[#fdda60] px-5 py-3 text-[#fdda60] placeholder-[#fdda60] focus:outline-none"
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
                className="w-full resize-none rounded-[28px] border border-[#fdda60] px-5 py-3 text-[#fdda60] placeholder-[#fdda60] focus:outline-none"
                rows={3}
              />
            </div>
          </div>

          {/* 모임 생성하기 버튼 */}
          <div>
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || !groupDescription.trim()}
              className={`w-full rounded-[10px] px-4 py-3 font-['Jalnan2TTF'] text-white transition-colors ${
                groupName.trim() && groupDescription.trim()
                  ? 'bg-[#fdda60] hover:bg-[#f4d03f]'
                  : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              모임 생성하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
