'use client'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  height?: string
  width?: string
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'h-[360px]',
  width = 'w-[412px]',
}: ModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`relative ${height} ${width} rounded-[30px] bg-[#fbf9f5]`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4">
          <div className="font-jalnan text-xl leading-[140%] text-[#ffc800]">
            {title}
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

        {/* 모달 내용 */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
