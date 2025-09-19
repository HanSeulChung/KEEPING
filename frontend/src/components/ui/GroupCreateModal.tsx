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
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div
        className="relative mx-4 h-[600px] w-[600px] overflow-hidden rounded-[10px] bg-white md:h-[80vh] md:max-h-[600px] md:w-[90vw] md:max-w-[600px]"
        style={{ boxShadow: '0px 4px 4px 0 rgba(0,0,0,0.25)' }}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between p-4">
          <div>
            <p className="mb-2 text-2xl font-bold text-black md:text-4xl">
              그룹 생성
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <svg
              width={36}
              height={36}
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 md:h-9 md:w-9"
            >
              <path
                d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z"
                stroke="#1E1E1E"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 구분선 */}
        <div className="mx-4 h-px w-full bg-gray-300"></div>

        {/* 그룹 생성 폼 */}
        <div className="space-y-6 p-4">
          {/* 모임 생성 제목 */}
          <div className="mb-4">
            <p className="text-sm font-bold text-black md:text-[13.6px]">
              모임 생성
            </p>
          </div>

          {/* 모임 이름 입력 */}
          <div className="space-y-2">
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="모임 이름"
              className="h-[42px] w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-black outline-none"
            />
          </div>

          {/* 모임 설명 입력 */}
          <div className="space-y-2">
            <textarea
              value={groupDescription}
              onChange={e => setGroupDescription(e.target.value)}
              placeholder="모임 설명"
              className="h-24 w-full resize-none rounded-md border border-gray-300 p-2 text-sm text-black outline-none"
              rows={3}
            />
          </div>

          {/* 모임 생성하기 버튼 */}
          <div className="pt-4">
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || !groupDescription.trim()}
              className={`h-10 w-full rounded-md text-sm font-bold transition-colors md:text-[13.6px] ${
                groupName.trim() && groupDescription.trim()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
              }`}
            >
              모임 생성하기
            </button>
          </div>
        </div>

        {/* 하단 구분선 및 로고 */}

        <div className="absolute right-4 bottom-16 left-4 h-px bg-gray-300"></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
          <p className="text-lg font-bold text-black md:text-[17px]">KEEPING</p>
        </div>
      </div>
    </div>
  )
}
