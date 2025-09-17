'use client'
import { useState } from 'react'

interface GroupCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGroup: (groupName: string, groupDescription: string) => void
}

export const GroupCreateModal = ({ isOpen, onClose, onCreateGroup }: GroupCreateModalProps) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-[600px] h-[600px] md:w-[90vw] md:h-[80vh] md:max-w-[600px] md:max-h-[600px] relative overflow-hidden rounded-[10px] bg-white mx-4"
        style={{ boxShadow: "0px 4px 4px 0 rgba(0,0,0,0.25)" }}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-start p-4">
          <div>
            <p className="text-2xl md:text-4xl font-bold text-black mb-2">
              그룹 생성
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              width={36}
              height={36}
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 md:w-9 md:h-9"
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
        <div className="w-full h-px bg-gray-300 mx-4"></div>

        {/* 그룹 생성 폼 */}
        <div className="p-4 space-y-6">
          {/* 모임 생성 제목 */}
          <div className="mb-4">
            <p className="text-sm md:text-[13.6px] font-bold text-black">
              모임 생성
            </p>
          </div>

          {/* 모임 이름 입력 */}
          <div className="space-y-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="모임 이름"
              className="w-full h-[42px] p-2 rounded-md bg-white border border-gray-300 text-sm text-black outline-none"
            />
          </div>

          {/* 모임 설명 입력 */}
          <div className="space-y-2">
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="모임 설명"
              className="w-full h-24 p-2 rounded-md border border-gray-300 text-sm text-black outline-none resize-none"
              rows={3}
            />
          </div>

          {/* 모임 생성하기 버튼 */}
          <div className="pt-4">
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || !groupDescription.trim()}
              className={`w-full h-10 rounded-md text-sm md:text-[13.6px] font-bold transition-colors ${
                groupName.trim() && groupDescription.trim()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              모임 생성하기
            </button>
          </div>
        </div>

        {/* 하단 구분선 및 로고 */}
        <div className="absolute bottom-16 left-4 right-4 h-px bg-gray-300"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-lg md:text-[17px] font-bold text-black">
            KEEPING
          </p>
        </div>
      </div>
    </div>
  )
}
