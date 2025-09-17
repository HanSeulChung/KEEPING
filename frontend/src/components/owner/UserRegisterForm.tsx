'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRegisterFormProps, AuthForm } from '@/types'

export default function UserRegisterForm({ onNext }: UserRegisterFormProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthCompleted, setIsAuthCompleted] = useState(false)
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: '',
    residentNumber: '',
    phoneNumber: ''
  })

  const handlePassAuth = () => {
    // KEEPING PASS 앱으로 이동 (실제로는 딥링크 사용)
    // 여기서는 시뮬레이션으로 모달 표시
    setIsModalOpen(true)
  }

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    setIsModalOpen(false)
    setIsAuthCompleted(true)
  }

  const handleFormChange = (field: keyof AuthForm, value: string) => {
    setAuthForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNextStep = () => {
    onNext?.()
  }

  const handleAuthButtonClick = () => {
    setIsAuthModalOpen(true)
  }

  return (
    <div>
      {!isAuthCompleted ? (
        <button
          type="button"
          onClick={handlePassAuth}
          className="mt-4 rounded bg-gray-800 px-4 py-2 text-white"
        >
          KEEPING PASS로 본인 인증하기
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">인증이 완료되었습니다!</p>
          </div>
          <button
            type="button"
            onClick={handleNextStep}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            다음 단계로
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md h-[600px] relative bg-white rounded-lg shadow-lg overflow-hidden">
            {/* KEEPING PASS 로고 */}
            <div className="absolute left-6 top-8 text-black text-2xl font-extrabold font-['Tenada']">
              KEEPING PASS
            </div>
            
            {/* 닫기 버튼 */}
            <button
              className="absolute right-4 top-4 w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center hover:bg-gray-100 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <span className="text-gray-800 text-sm font-bold">×</span>
            </button>
            
            <div className="absolute left-6 top-16 text-black text-sm font-normal">
              간편 본인확인 정보 등록
            </div>
            
            <div className="absolute left-6 right-6 top-20 border-t border-gray-300"></div>
            
            {/* 본문 영역 - 인증 폼 */}
            <div className="absolute left-6 right-6 top-24 bottom-20 bg-white overflow-y-auto">
              <div className="space-y-4 p-4">
                <div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">이름</label>
                  </div>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이름을 입력해 주세요."
                  />
                </div>
                
                <div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">주민등록번호</label>
                  </div>
                  <input
                    type="text"
                    value={authForm.residentNumber}
                    onChange={(e) => handleFormChange('residentNumber', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="생년월일 6자리 - ●●●●●●●"
                    maxLength={8}
                  />
                </div>
                
                <div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2 mb-2">
                    <label className="text-sm font-medium text-gray-700">전화번호</label>
                  </div>
                  <input
                    type="text"
                    value={authForm.phoneNumber}
                    onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="010-1234-5678"
                    maxLength={13}
                  />
                </div>
              </div>
            </div>
            
            {/* 인증하기 버튼 */}
            <div className="absolute left-6 right-6 bottom-16">
              <button
                className="w-full py-3 bg-black rounded-lg text-white font-medium hover:bg-gray-800 transition-colors"
                onClick={handleAuthButtonClick}
              >
                인증하기
              </button>
            </div>
            
            {/* KEEPING 브랜드명 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-4 text-black text-sm font-extrabold font-['Tenada']">
              KEEPING
            </div>
          </div>
        </div>
      )}

      {/* 두 번째 모달 - 실제 인증 화면 */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md h-[600px] relative bg-white rounded-lg shadow-lg overflow-hidden">
            {/* KEEPING PASS 로고 */}
            <div className="absolute left-6 top-8 text-black text-2xl font-extrabold font-['Tenada']">
              KEEPING PASS
            </div>
            
            <button
              className="absolute right-4 top-4 w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center hover:bg-gray-100 transition-colors"
              onClick={() => setIsAuthModalOpen(false)}
            >
              <span className="text-gray-800 text-sm font-bold">×</span>
            </button>
            
            <div className="absolute left-6 top-16 text-black text-sm font-normal">
              간편 본인확인 정보 등록
            </div>
            
            <div className="absolute left-6 right-6 top-20 border-t border-gray-300"></div>
            

            <div className="absolute left-6 right-6 top-24 bottom-20 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">인증이 완료되었습니다!</h3>
                <p className="text-sm text-gray-600">본인확인이 성공적으로 완료되었습니다.</p>
              </div>
            </div>
            
            {/* 인증하기 버튼 */}
            <div className="absolute left-6 right-6 bottom-16">
              <button
                className="w-full py-3 bg-black rounded-lg text-white font-medium hover:bg-gray-800 transition-colors"
                onClick={handleAuthSuccess}
              >
                인증하기
              </button>
            </div>
            
            {/* KEEPING 브랜드명 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-4 text-black text-sm font-extrabold font-['Tenada']">
              KEEPING
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
