import { StoreRequestDto } from '@/api/storeApi'
import AddressInput from '@/components/common/AddressInput'
import { useStoreManagement } from '@/hooks/useStoreManagement'
import { formatAddress } from '@/lib/addressUtils'
import type { AddressData } from '@/types/address'
import React, { useCallback, useEffect, useState } from 'react'

interface StoreRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const StoreRegisterModal = ({
  isOpen,
  onClose,
  onSuccess,
}: StoreRegisterModalProps) => {
  const { loading, error, createNewStore, clearError } = useStoreManagement()
  const [formData, setFormData] = useState<StoreRequestDto>({
    storeName: '',
    description: '',
    address: '',
    phoneNumber: '',
    category: '',
    taxIdNumber: '',
    bankAccount: '',
    imgFile: undefined as unknown as File,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [addressData, setAddressData] = useState<AddressData>({
    zipCode: '',
    address: '',
    detailAddress: '',
  })

  // 클라이언트 사이드에서만 실행되도록 설정
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleReset = useCallback(() => {
    setFormData({
      storeName: '',
      description: '',
      address: '',
      phoneNumber: '',
      category: '',
      taxIdNumber: '',
      bankAccount: '',
      imgFile: undefined as unknown as File,
    })
    setSelectedImage(null)
    setAddressData({
      zipCode: '',
      address: '',
      detailAddress: '',
    })
  }, [])

  // 모달이 열릴 때 폼 초기화 (클라이언트에서만 실행)
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      handleReset()
    }
  }, [isOpen, handleReset])

  if (!isOpen) return null

  const handleInputChange = (field: keyof StoreRequestDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // 주소 변경 핸들러
  const handleAddressChange = (newAddress: AddressData) => {
    setAddressData(newAddress)

    // formData의 address 필드를 전체 주소로 업데이트
    setFormData(prev => ({
      ...prev,
      address: formatAddress(newAddress, { includeZipCode: false }),
    }))
  }

  // 이미지 삭제 핸들러
  const handleImageRemove = () => {
    setSelectedImage(null)
    setFormData(prev => ({
      ...prev,
      imgFile: undefined as unknown as File,
    }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedImage(file)
      setFormData(prev => ({
        ...prev,
        imgFile: file,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedImage) {
      alert('이미지를 먼저 선택해주세요.')
      return
    }

    if (
      !formData.storeName ||
      !formData.description ||
      !formData.address ||
      !formData.phoneNumber ||
      !formData.category ||
      !formData.bankAccount
    ) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    const result = await createNewStore(formData)
    if (result) {
      alert('가게가 성공적으로 등록되었습니다!')
      onClose()
      onSuccess?.()
      handleReset()
    }
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-['Tenada'] text-4xl font-extrabold text-black">
            매장 등록
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
          <div className="group relative h-48 w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
            {selectedImage ? (
              <div className="flex h-full w-full items-center justify-center p-4">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="미리보기"
                  className="max-h-full max-w-full rounded border border-gray-200 object-contain"
                />
                {/* 마우스 호버 시 삭제 버튼 */}
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-lg font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600"
                >
                  ×
                </button>
                {/* 마우스 호버 시 교체 버튼 */}
                <label className="absolute right-2 bottom-2 cursor-pointer rounded bg-blue-500 px-3 py-1 text-xs font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-blue-600">
                  교체
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <label className="cursor-pointer rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black transition-colors hover:bg-gray-100">
                  이미지 업로드
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          {selectedImage && (
            <div className="mt-2 text-sm text-gray-600">
              선택된 이미지: 1개 (마우스를 올리면 삭제/교체 가능)
            </div>
          )}
        </div>

        {/* 매장 이름 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center">
            <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
              매장 이름
            </span>
          </div>
          <input
            type="text"
            className="h-10 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
            placeholder="매장 이름을 입력하세요"
            value={formData.storeName}
            onChange={e => handleInputChange('storeName', e.target.value)}
          />
        </div>

        {/* 매장 번호 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center">
            <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
              매장 번호
            </span>
          </div>
          <input
            type="tel"
            className="h-10 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
            placeholder="매장 전화번호를 입력하세요 (예: 02-1234-5678)"
            value={formData.phoneNumber}
            onChange={e => handleInputChange('phoneNumber', e.target.value)}
          />
        </div>

        {/* 계좌번호 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center">
            <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
              계좌번호
            </span>
          </div>
          <input
            type="text"
            className="h-10 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
            placeholder="계좌번호를 입력하세요 (예: 123-456-789012)"
            value={formData.bankAccount}
            onChange={e => handleInputChange('bankAccount', e.target.value)}
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
            className="h-20 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
            placeholder="가게 소개 입력"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
          />
        </div>

        {/* 업종 선택 */}
        <div className="mb-4">
          <div className="mb-2 flex items-center">
            <span className="font-['Inter'] text-xs text-gray-500">업종</span>
          </div>
          <select
            className="h-10 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
            value={formData.category}
            onChange={e => handleInputChange('category', e.target.value)}
          >
            <option value="">업종 선택</option>
            <option value="한식">한식</option>
            <option value="중식">중식</option>
            <option value="일식">일식</option>
            <option value="양식">양식</option>
            <option value="분식">분식</option>
            <option value="아시안">아시안</option>
            <option value="패스트푸드">패스트푸드</option>
            <option value="카페">카페</option>
            <option value="식료품">식료품</option>
            <option value="반찬/밀키트">반찬/밀키트</option>
            <option value="헤어">헤어</option>
            <option value="뷰티">뷰티</option>
            <option value="꽃">꽃</option>
            <option value="엔터테인먼트">엔터테인먼트</option>
            <option value="스포츠">스포츠</option>
            <option value="자동차">자동차</option>
            <option value="반려동물">반려동물</option>
            <option value="주류">주류</option>
            <option value="클래스">클래스</option>
            <option value="잡화">잡화</option>
          </select>
        </div>

        {/* 주소 */}
        <div className="mb-6">
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
              detailAddress: '상세 주소 (선택)',
            }}
            className={{
              zipCodeInput: 'h-10 font-["Inter"] text-gray-800',
              searchButton: 'h-10 font-["Inter"] text-xs',
              addressInput: 'h-10 font-["Inter"] text-gray-800',
              detailAddressInput: 'h-10 font-["Inter"] text-black',
            }}
            validation={{
              address: { required: true, message: '기본주소를 입력해주세요.' },
            }}
          />
        </div>

        {/* 등록하기 버튼 */}
        <div className="flex justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !selectedImage}
            className={`rounded px-6 py-2 font-['nanumsquare'] text-xs font-bold transition-colors ${
              loading || !selectedImage
                ? 'cursor-not-allowed bg-gray-400 text-white'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {loading
              ? '등록 중...'
              : !selectedImage
                ? '이미지를 선택해주세요'
                : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoreRegisterModal
