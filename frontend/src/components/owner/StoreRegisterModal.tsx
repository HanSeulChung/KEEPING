import { apiConfig } from '@/api/config'
import { StoreRequestDto } from '@/api/storeApi'
import AddressInput from '@/components/common/AddressInput'
import { useStoreManagement } from '@/hooks/useStoreManagement'
import { formatAddress } from '@/lib/addressUtils'
import type { AddressData } from '@/types/address'
import React, { useCallback, useEffect, useState } from 'react'

// 단계별 진행을 위한 타입 정의
type Step = 'business-verify' | 'store-info' | 'image-upload' | 'complete'

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
  const [currentStep, setCurrentStep] = useState<Step>('business-verify')
  const [formData, setFormData] = useState<StoreRequestDto>({
    storeName: '',
    description: '',
    address: '',
    phoneNumber: '',
    category: '',
    taxIdNumber: '000-00-00000', // 기본값 설정
    bankAccount: '000-000-000000', // 기본값 설정
    imgFile: undefined as unknown as File,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [addressData, setAddressData] = useState<AddressData>({
    zipCode: '',
    address: '',
    detailAddress: '',
  })
  const [businessData, setBusinessData] = useState({
    businessNumber: '109-81-72945',
    openDate: '2001.08.16',
    ceoName: '이헌철',
  })
  const [ocrImage, setOcrImage] = useState<File | null>(null)
  const [isOcrLoading, setIsOcrLoading] = useState(false)

  // 클라이언트 사이드에서만 실행되도록 설정
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleReset = useCallback(() => {
    setCurrentStep('business-verify')
    setFormData({
      storeName: '',
      description: '',
      address: '',
      phoneNumber: '',
      category: '',
      taxIdNumber: '000-00-00000', // 기본값 설정
      bankAccount: '000-000-000000', // 기본값 설정
      imgFile: undefined as unknown as File,
    })
    setSelectedImage(null)
    setAddressData({
      zipCode: '',
      address: '',
      detailAddress: '',
    })
    setBusinessData({
      businessNumber: '109-81-72945',
      openDate: '2001.08.16',
      ceoName: '이헌철',
    })
    setOcrImage(null)
    setIsOcrLoading(false)
  }, [])

  // 모달이 열릴 때 폼 초기화 (클라이언트에서만 실행)
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      handleReset()
    }
  }, [isOpen, handleReset])

  // OCR API 호출 함수
  const handleOcrUpload = async (file: File) => {
    setIsOcrLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${apiConfig.baseURL}/ocr/biz-license`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`OCR API 오류: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // OCR 결과로 폼 데이터 자동 채우기
        setBusinessData({
          businessNumber: result.data.bizNumber || '',
          openDate: result.data.openDate ? result.data.openDate.replace(/-/g, '.') : '',
          ceoName: result.data.fullName || '',
        })
        alert('사업자등록증이 성공적으로 인식되었습니다!')
        // OCR 처리 완료 후 이미지 제거
        setOcrImage(null)
      } else {
        alert('OCR 인식에 실패했습니다. 수동으로 입력해주세요.')
        setOcrImage(null)
      }
    } catch (error) {
      console.error('OCR 오류:', error)
      alert('OCR 처리 중 오류가 발생했습니다. 수동으로 입력해주세요.')
      setOcrImage(null)
    } finally {
      setIsOcrLoading(false)
    }
  }

  // OCR 이미지 변경 핸들러
  const handleOcrImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // 파일 크기 검증 (1MB = 1024 * 1024 bytes)
      const maxSize = 1024 * 1024
      if (file.size > maxSize) {
        alert('파일 크기가 1MB를 초과합니다. 더 작은 파일을 선택해주세요.')
        return
      }
      
      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        alert('JPG, JPEG, PNG 파일만 업로드 가능합니다.')
        return
      }
      
      setOcrImage(file)
      handleOcrUpload(file)
    }
  }

  // 단계별 진행 함수들
  const handleBusinessVerify = () => {
    // 사업자 등록번호만 확인하고 넘어가기 (진위확인 생략)
    if (!businessData.businessNumber || !businessData.openDate || !businessData.ceoName) {
      alert('모든 필드를 입력해주세요.')
      return
    }
    alert('사업자 등록번호가 저장되었습니다.')
    setCurrentStep('store-info')
  }

  const handleStoreInfoNext = () => {
    if (
      !formData.storeName ||
      !formData.phoneNumber ||
      !formData.description ||
      !formData.category ||
      !formData.address
    ) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }
    setCurrentStep('image-upload')
  }

  const handleImageUploadNext = () => {
    if (!selectedImage) {
      alert('이미지를 선택해주세요.')
      return
    }
    setCurrentStep('complete')
  }

  const handleComplete = async () => {
    const result = await createNewStore(formData)
    if (result) {
      alert('가게가 성공적으로 등록되었습니다!')
      onClose()
      onSuccess?.()
      handleReset()
    }
  }

  if (!isOpen) return null

  const handleInputChange = (field: keyof StoreRequestDto, value: string) => {
    // bankAccount와 taxIdNumber는 항상 빈 문자열로 고정
    if (field === 'bankAccount' || field === 'taxIdNumber') {
      return
    }

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

  // 단계별 렌더링 함수
  const renderStepContent = () => {
    switch (currentStep) {
      case 'business-verify':
        return renderBusinessVerifyStep()
      case 'store-info':
        return renderStoreInfoStep()
      case 'image-upload':
        return renderImageUploadStep()
      case 'complete':
        return renderCompleteStep()
      default:
        return null
    }
  }

  // 사업자 등록 진위확인 단계 (OCR + 수동 입력)
  const renderBusinessVerifyStep = () => (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="mb-4 font-['Tenada'] text-2xl font-extrabold text-black">
          사업자 등록번호 입력
        </h3>
        <p className="text-sm text-gray-600">
          사업자 등록번호를 입력해주세요.
        </p>
      </div>

      {/* 이미지로 등록하기 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => document.getElementById('ocr-file-input')?.click()}
          disabled={isOcrLoading}
          className={`rounded-lg border border-black bg-white px-6 py-3 font-['nanumsquare'] text-sm font-bold text-black transition-colors hover:bg-gray-100 ${
            isOcrLoading ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {isOcrLoading ? 'OCR 추출 중...' : '📷 이미지로 등록하기'}
        </button>
        <input
          id="ocr-file-input"
          type="file"
          accept="image/*"
          onChange={handleOcrImageChange}
          className="hidden"
          disabled={isOcrLoading}
        />
        {isOcrLoading && (
          <p className="mt-2 text-sm text-blue-600">사업자등록증을 분석하고 있습니다...</p>
        )}
      </div>
      
      {/* 수동 입력 폼 */}
      <div className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-6">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-black">
            사업자 등록번호
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 p-3 text-center"
            placeholder="000-00-00000"
            value={businessData.businessNumber}
            onChange={e => setBusinessData(prev => ({ ...prev, businessNumber: e.target.value }))}
            maxLength={12}
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-black">
            개업일자
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 p-3 text-center"
            placeholder="YYYY.MM.DD"
            value={businessData.openDate}
            onChange={e => setBusinessData(prev => ({ ...prev, openDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-black">
            대표자명
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 p-3 text-center"
            placeholder="대표자명을 입력하세요"
            value={businessData.ceoName}
            onChange={e => setBusinessData(prev => ({ ...prev, ceoName: e.target.value }))}
          />
        </div>
      </div>

          <button
        onClick={handleBusinessVerify}
        disabled={isOcrLoading}
        className={`w-full rounded-md px-6 py-3 font-bold text-white ${
          isOcrLoading
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isOcrLoading ? 'OCR 처리 중...' : '다음'}
      </button>
    </div>
  )

  // 매장 정보 입력 단계
  const renderStoreInfoStep = () => (
    <div>
      <div className="mb-6 text-center">
        <h3 className="mb-2 font-['Tenada'] text-2xl font-extrabold text-black">
          매장 정보 입력
        </h3>
        <p className="text-sm text-gray-600">
          매장의 기본 정보를 입력해주세요.
        </p>
      </div>

      {/* 매장 이름 */}
      <div className="mb-4">
        <div className="mb-2 flex items-center">
          <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
            가게명 *
          </span>
        </div>
        <input
          type="text"
          className="h-10 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
          placeholder="가게명을 입력하세요"
          value={formData.storeName}
          onChange={e => handleInputChange('storeName', e.target.value)}
        />
      </div>

      {/* 가게 전화번호 */}
      <div className="mb-4">
        <div className="mb-2 flex items-center">
          <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
            가게 전화번호 *
          </span>
        </div>
        <input
          type="tel"
          className="h-10 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
          placeholder="가게 전화번호를 입력하세요 (예: 02-1234-5678)"
          value={formData.phoneNumber}
          onChange={e => handleInputChange('phoneNumber', e.target.value)}
        />
      </div>

      {/* 가게 소개 */}
      <div className="mb-4">
        <div className="mb-2 flex items-center">
          <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
            가게 소개 *
          </span>
        </div>
        <textarea
          className="h-20 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
          placeholder="가게 소개를 입력하세요"
          value={formData.description}
          onChange={e => handleInputChange('description', e.target.value)}
        />
      </div>

      {/* 업종 선택 */}
      <div className="mb-4">
        <div className="mb-2 flex items-center">
          <span className="rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black">
            업종 *
          </span>
        </div>
        <select
          className="h-10 w-full rounded-md border border-gray-300 p-2 font-['Inter'] text-black"
          value={formData.category}
          onChange={e => handleInputChange('category', e.target.value)}
        >
          <option value="">업종을 선택하세요</option>
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
            주소 *
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

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep('business-verify')}
          className="flex-1 rounded-md border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          onClick={handleStoreInfoNext}
          className="flex-1 rounded-md bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
        >
          다음
          </button>
        </div>
    </div>
  )

  // 이미지 업로드 단계
  const renderImageUploadStep = () => (
    <div>
      <div className="mb-6 text-center">
        <h3 className="mb-2 font-['Tenada'] text-2xl font-extrabold text-black">
          매장 이미지 등록
        </h3>
        <p className="text-sm text-gray-600">
          매장의 대표 이미지를 등록해주세요.
        </p>
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

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep('store-info')}
          className="flex-1 rounded-md border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          onClick={handleImageUploadNext}
          disabled={!selectedImage}
          className={`flex-1 rounded-md px-6 py-3 font-bold ${
            !selectedImage
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          다음
        </button>
      </div>
          </div>
  )

  // 완료 단계
  const renderCompleteStep = () => (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="mb-4 font-['Tenada'] text-2xl font-extrabold text-black">
          등록 완료
        </h3>
        <p className="text-sm text-gray-600">
          입력하신 정보를 최종 확인해주세요.
        </p>
        </div>

      <div className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4 text-left">
        <h4 className="mb-3 font-bold text-black">매장 정보</h4>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">가게명:</span> {formData.storeName}</div>
          <div><span className="font-medium">전화번호:</span> {formData.phoneNumber}</div>
          <div><span className="font-medium">업종:</span> {formData.category}</div>
          <div><span className="font-medium">주소:</span> {formData.address}</div>
          <div><span className="font-medium">소개:</span> {formData.description}</div>
        </div>
          </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep('image-upload')}
          className="flex-1 rounded-md border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          onClick={handleComplete}
          disabled={loading}
          className={`flex-1 rounded-md px-6 py-3 font-bold ${
            loading
              ? 'cursor-not-allowed bg-gray-400 text-white'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? '등록 중...' : '등록 완료'}
        </button>
        </div>
          </div>
  )

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

        {/* 진행 단계 표시 */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            {['business-verify', 'store-info', 'image-upload', 'complete'].map((step, index) => {
              const isActive = currentStep === step
              const isCompleted = ['business-verify', 'store-info', 'image-upload', 'complete'].indexOf(currentStep) > index
              
              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isActive || isCompleted
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 w-8 ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600">
            {currentStep === 'business-verify' && '사업자 등록번호 입력'}
            {currentStep === 'store-info' && '매장 정보 입력'}
            {currentStep === 'image-upload' && '매장 이미지 등록'}
            {currentStep === 'complete' && '등록 완료'}
          </div>
        </div>

        {/* 단계별 컨텐츠 */}
        {renderStepContent()}
      </div>
    </div>
  )
}

export default StoreRegisterModal
