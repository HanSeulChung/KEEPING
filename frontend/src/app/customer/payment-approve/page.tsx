'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import PaymentApprovalModal from '@/components/common/PaymentApprovalModal'

function PaymentApproveInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // URL 파라미터에서 결제 정보 추출
  const intentPublicId =
    searchParams.get('intentPublicId') || searchParams.get('intentId') // intentPublicId 우선
  const storeName = searchParams.get('storeName')
  const amount = searchParams.get('amount')
  const customerName = searchParams.get('customerName')

  useEffect(() => {
    // 필수 파라미터가 있으면 모달 표시
    if (intentPublicId) {
      setIsModalOpen(true)
    } else {
      // 파라미터가 없으면 알림 페이지로 리다이렉트
      router.push('/customer/notification')
    }
  }, [intentPublicId, router])

  const handleModalClose = () => {
    setIsModalOpen(false)
    // 모달 닫으면 알림 페이지로 이동
    router.push('/customer/notification')
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    // 성공 시 홈으로 이동
    router.push('/customer/home')
  }

  if (!intentPublicId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#fddb5f] px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 flex items-center justify-center"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.9 12.1095L15.5384 16.6708L14.1502 18.0825L8.10006 12.133L14.0495 6.0829L15.4612 7.47111L10.9 12.1095Z"
                fill="white"
                stroke="white"
                strokeWidth={2}
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">결제 승인</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex h-[calc(100vh-60px)] items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <svg
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 12C2 8.229 2 6.343 3.172 5.172C4.343 4 6.229 4 10 4H14C17.771 4 19.657 4 20.828 5.172C22 6.343 22 8.229 22 12C22 15.771 22 17.657 20.828 18.828C19.657 20 17.771 20 14 20H10C6.229 20 4.343 20 3.172 18.828C2 17.657 2 15.771 2 12Z"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                <path
                  d="M10 16H6M14 16H12.5M2 10H22"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              결제 승인 요청
            </h2>
            <p className="text-gray-600">
              아래 버튼을 눌러 결제를 승인해주세요
            </p>
          </div>

          {/* 결제 정보 미리보기 */}
          <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            {storeName && (
              <div className="mb-2">
                <span className="text-sm text-gray-600">매장: </span>
                <span className="font-medium">
                  {decodeURIComponent(storeName)}
                </span>
              </div>
            )}
            {amount && (
              <div className="mb-2">
                <span className="text-sm text-gray-600">금액: </span>
                <span className="text-lg font-bold text-blue-600">
                  {parseInt(amount).toLocaleString()}원
                </span>
              </div>
            )}
            {customerName && (
              <div>
                <span className="text-sm text-gray-600">고객: </span>
                <span className="font-medium">
                  {decodeURIComponent(customerName)}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            PIN 입력하여 결제 승인
          </button>
        </div>
      </div>

      {/* 결제 승인 모달 */}
      <PaymentApprovalModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        intentId={intentPublicId}
        storeName={storeName ? decodeURIComponent(storeName) : undefined}
        amount={amount ? parseInt(amount) : undefined}
        customerName={
          customerName ? decodeURIComponent(customerName) : undefined
        }
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default function PaymentApprovePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">결제 정보를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <PaymentApproveInner />
    </Suspense>
  )
}
