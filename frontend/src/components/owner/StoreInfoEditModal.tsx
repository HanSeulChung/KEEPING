import React from 'react';

interface StoreInfoEditModalProps {
  isOpen: boolean
  onClose: () => void
}

const StoreInformationEditModal = ({ isOpen, onClose }: StoreInfoEditModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-['Tenada'] font-extrabold text-black">매장 정보 수정</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <div className="w-full h-48 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
            <button className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg">
              이미지 업로드
            </button>
          </div>
        </div>

        {/* 주소 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg">
              주소
            </span>
          </div>
          
          {/* 우편번호 */}
          <div className="flex mb-2">
            <input 
              type="text" 
              className="flex-1 p-2 h-10 rounded-l-md border border-gray-300 bg-white text-gray-400 font-['Inter']"
              placeholder="우편번호"
            />
            <button className="px-3 py-2 h-10 rounded-r-md bg-gray-800 text-white text-xs font-['Inter']">
              검색
            </button>
          </div>
          
          {/* 기본 주소 */}
          <input 
            type="text" 
            className="w-full p-2 h-10 rounded-md border border-gray-300 bg-white text-gray-400 font-['Inter']"
            placeholder="기본 주소"
          />
        </div>

        {/* 가게 소개 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg">
              가게 소개
            </span>
          </div>
          <textarea 
            className="w-full h-20 p-2 border border-gray-300 rounded-md text-gray-400 font-['Inter']"
            placeholder="가게 소개 입력"
          />
        </div>

        {/* 업체명 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-gray-500 font-['Inter'] text-xs">업체명</span>
          </div>
          <input 
            type="text" 
            className="w-full p-2 h-10 rounded-md border border-gray-300 bg-white text-gray-400 font-['Inter']"
            placeholder="업체명 입력"
          />
        </div>

        {/* 업종 선택 */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="text-gray-500 font-['Inter'] text-xs">업종</span>
          </div>
          <div className="flex justify-between items-center p-2 h-10 rounded-md border border-gray-300">
            <span className="text-black font-['Inter']">업종 선택</span>
            <svg width={17} height={17} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.4011 6.08102C11.5964 6.27628 11.5964 6.59286 11.4011 6.7881L8.73443 9.45477C8.53917 9.65003 8.22263 9.65003 8.02736 9.45477L5.36068 6.7881C5.16542 6.59286 5.16542 6.27628 5.36068 6.08102C5.55594 5.88576 5.87252 5.88576 6.06778 6.08102L8.3809 8.3941L10.694 6.08102C10.8893 5.88576 11.2058 5.88576 11.4011 6.08102Z" fill="black" />
            </svg>
          </div>
        </div>

        {/* 등록하기 버튼 */}
        <div className="flex justify-center">
          <button className="px-6 py-2 rounded bg-gray-800 text-white text-xs font-['nanumsquare'] font-bold">
            등록하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoreInformationEditModal
