'use client'
import { useState } from 'react'

interface GroupCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGroup: (groupName: string, groupDescription: string) => void
}

<<<<<<< HEAD
export const GroupCreateModal = ({
  isOpen,
  onClose,
  onCreateGroup,
}: GroupCreateModalProps) => {
=======
export const GroupCreateModal = ({ isOpen, onClose, onCreateGroup }: GroupCreateModalProps) => {
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
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
<<<<<<< HEAD
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div
        className="relative mx-4 h-[600px] w-[600px] overflow-hidden rounded-[10px] bg-white md:h-[80vh] md:max-h-[600px] md:w-[90vw] md:max-w-[600px]"
        style={{ boxShadow: '0px 4px 4px 0 rgba(0,0,0,0.25)' }}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between p-4">
          <div>
            <p className="mb-2 text-2xl font-bold text-black md:text-4xl">
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-[600px] h-[600px] md:w-[90vw] md:h-[80vh] md:max-w-[600px] md:max-h-[600px] relative overflow-hidden rounded-[10px] bg-white mx-4"
        style={{ boxShadow: "0px 4px 4px 0 rgba(0,0,0,0.25)" }}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-start p-4">
          <div>
            <p className="text-2xl md:text-4xl font-bold text-black mb-2">
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
              그룹 생성
            </p>
          </div>
          <button
            onClick={onClose}
<<<<<<< HEAD
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
=======
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
          >
            <svg
              width={36}
              height={36}
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
<<<<<<< HEAD
              className="h-6 w-6 md:h-9 md:w-9"
=======
              className="w-6 h-6 md:w-9 md:h-9"
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
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
<<<<<<< HEAD
        <div className="mx-4 h-px w-full bg-gray-300"></div>

        {/* 그룹 생성 폼 */}
        <div className="space-y-6 p-4">
          {/* 모임 생성 제목 */}
          <div className="mb-4">
            <p className="text-sm font-bold text-black md:text-[13.6px]">
=======
        <div className="w-full h-px bg-gray-300 mx-4"></div>

        {/* 그룹 생성 폼 */}
        <div className="p-4 space-y-6">
          {/* 모임 생성 제목 */}
          <div className="mb-4">
            <p className="text-sm md:text-[13.6px] font-bold text-black">
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
              모임 생성
            </p>
          </div>

          {/* 모임 이름 입력 */}
          <div className="space-y-2">
            <input
              type="text"
              value={groupName}
<<<<<<< HEAD
              onChange={e => setGroupName(e.target.value)}
              placeholder="모임 이름"
              className="h-[42px] w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-black outline-none"
=======
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="모임 이름"
              className="w-full h-[42px] p-2 rounded-md bg-white border border-gray-300 text-sm text-black outline-none"
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
            />
          </div>

          {/* 모임 설명 입력 */}
          <div className="space-y-2">
            <textarea
              value={groupDescription}
<<<<<<< HEAD
              onChange={e => setGroupDescription(e.target.value)}
              placeholder="모임 설명"
              className="h-24 w-full resize-none rounded-md border border-gray-300 p-2 text-sm text-black outline-none"
=======
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="모임 설명"
              className="w-full h-24 p-2 rounded-md border border-gray-300 text-sm text-black outline-none resize-none"
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
              rows={3}
            />
          </div>

          {/* 모임 생성하기 버튼 */}
          <div className="pt-4">
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || !groupDescription.trim()}
<<<<<<< HEAD
              className={`h-10 w-full rounded-md text-sm font-bold transition-colors md:text-[13.6px] ${
                groupName.trim() && groupDescription.trim()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500'
=======
              className={`w-full h-10 rounded-md text-sm md:text-[13.6px] font-bold transition-colors ${
                groupName.trim() && groupDescription.trim()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
              }`}
            >
              모임 생성하기
            </button>
          </div>
        </div>

        {/* 하단 구분선 및 로고 */}
<<<<<<< HEAD
        <div className="absolute right-4 bottom-16 left-4 h-px bg-gray-300"></div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
          <p className="text-lg font-bold text-black md:text-[17px]">KEEPING</p>
=======
        <div className="absolute bottom-16 left-4 right-4 h-px bg-gray-300"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-lg md:text-[17px] font-bold text-black">
            KEEPING
          </p>
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
        </div>
      </div>
    </div>
  )
}
