'use client'

import { useState } from 'react'

interface UserRegisterFormProps {
  onNext?: () => void
}

export default function UserRegisterForm({ onNext }: UserRegisterFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="mt-4 rounded bg-gray-800 px-4 py-2 text-white"
      >
        KEEPING PASS로 본인 인증하기
      </button>

      {isModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">본인 인증</h2>
            <p className="mb-4">KEEPING PASS로 본인 인증을 진행합니다.</p>
            <div className="flex justify-end space-x-2">
              <button
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={() => {
                  // 본인 인증 로직 구현
                  setIsModalOpen(false)
                  onNext?.()
                }}
              >
                인증하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
