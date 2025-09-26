import AddressInput from '@/components/common/AddressInput'
import type { AddressData } from '@/types/address'
import { useState } from 'react'

interface StoreInfoEditModalProps {
  isOpen: boolean
  onClose: () => void
}

const StoreInformationEditModal = ({
  isOpen,
  onClose,
}: StoreInfoEditModalProps) => {
  const [addressData, setAddressData] = useState<AddressData>({
    zipCode: '',
    address: '',
    detailAddress: '',
  })

  const handleAddressChange = (newAddress: AddressData) => {
    setAddressData(newAddress)
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-['Tenada'] text-4xl font-extrabold text-black">
            매장 정보 수정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <div className="flex h-48 w-full items-center justify-center rounded-lg border border-gray-300 bg-gray-50">
            <button className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
              이미지 업로드
            </button>
          </div>
        </div>

        {/* 주소 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center">
            <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
              주소
            </span>
          </div>

          <AddressInput
            value={addressData}
            onChange={handleAddressChange}
            placeholder={{
              zipCode: '우편번호',
              address: '기본 주소',
              detailAddress: '상세 주소',
            }}
            className={{
              zipCodeInput: 'h-10 font-["Inter"] text-gray-800',
              searchButton: 'h-10 px-3 font-["Inter"] text-xs',
              addressInput: 'h-10 font-["Inter"] text-gray-800',
              detailAddressInput: 'h-10 font-["Inter"] text-gray-800',
            }}
          />
        </div>

        {/* 가게 소개 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center">
            <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
              가게 소개
            </span>
          </div>
          <textarea
            className="h-20 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-gray-400"
            placeholder="가게 소개 입력"
          />
        </div>

        {/* 업체명 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center">
            <span className="font-['Inter'] text-xs text-gray-500">업체명</span>
          </div>
          <input
            type="text"
            className="h-10 w-full rounded-md border border-gray-300 bg-white p-2 font-['Inter'] text-gray-400"
            placeholder="업체명 입력"
          />
        </div>

        {/* 업종 선택 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center">
            <span className="font-['Inter'] text-xs text-gray-500">업종</span>
          </div>
          <div className="flex h-10 items-center justify-between rounded-md border border-gray-300 p-2">
            <span className="font-['Inter'] text-black">업종 선택</span>
            <svg
              width={17}
              height={17}
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.4011 6.08102C11.5964 6.27628 11.5964 6.59286 11.4011 6.7881L8.73443 9.45477C8.53917 9.65003 8.22263 9.65003 8.02736 9.45477L5.36068 6.7881C5.16542 6.59286 5.16542 6.27628 5.36068 6.08102C5.55594 5.88576 5.87252 5.88576 6.06778 6.08102L8.3809 8.3941L10.694 6.08102C10.8893 5.88576 11.2058 5.88576 11.4011 6.08102Z"
                fill="black"
              />
            </svg>
          </div>
        </div>

        {/* 등록하기 버튼 */}
        <div className="flex justify-center">
          <button className="rounded bg-gray-800 px-6 py-2 font-['nanumsquare'] text-xs font-bold text-white">
            등록하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoreInformationEditModal
