'use client'
import { buildURL } from '@/api/config'
import { useEffect, useState } from 'react'

interface CustomerInfo {
  name: string
  phoneNumber: string
  email: string
  imgUrl: string
}

interface CustomerResponse {
  success: boolean
  status: number
  message: string
  data: CustomerInfo
  timestamp: string
}

interface CancelTransaction {
  transactionUniqueNo: string
  storeName: string
  paymentAmount: number
  remainingBalance: number
  transactionTime: string
}

interface CancelListResponse {
  success: boolean
  status: number
  message: string
  data: {
    content: CancelTransaction[]
  }
  timestamp: string
}

// 마이페이지 컴포넌트
export const MyPage = () => {
  const [isPaymentNotificationOn, setIsPaymentNotificationOn] = useState(true)
  const [isGroupNotificationOn, setIsGroupNotificationOn] = useState(true)
  const [isChargeNotificationOn, setIsChargeNotificationOn] = useState(true)

  // 회원정보 관련 상태
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 수정 폼 상태
  const [editName, setEditName] = useState('')
  const [editPhoneNumber, setEditPhoneNumber] = useState('')

  // 카드 취소 관련 상태
  const [cancelTransactions, setCancelTransactions] = useState<
    CancelTransaction[]
  >([])
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<CancelTransaction | null>(null)
  const [creditCard, setCreditCard] = useState<{
    cardNo: string
    cvc: string
    cardName: string
  } | null>(null)
  const [cancelProcessing, setCancelProcessing] = useState(false)
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsError, setCardsError] = useState<string | null>(null)

  // 회원정보 조회
  const fetchCustomerInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = buildURL('/customers/me')
      console.log('회원정보 조회 URL:', url)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      })

      console.log(
        '회원정보 조회 응답 상태:',
        response.status,
        response.statusText
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CustomerResponse = await response.json()
      console.log('회원정보 조회 응답 데이터:', data)

      if (data.success) {
        setCustomerInfo(data.data)
        setEditName(data.data.name)
        setEditPhoneNumber(data.data.phoneNumber)
      } else {
        setError(data.message || '회원정보 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('회원정보 조회 실패:', error)
      setError('회원정보 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 회원정보 수정
  const updateCustomerInfo = async () => {
    if (!editName.trim() || !editPhoneNumber.trim()) {
      alert('이름과 전화번호를 모두 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = buildURL('/customers/me')

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const requestBody = {
        name: editName.trim(),
        phoneNumber: editPhoneNumber.trim(),
      }

      console.log('회원정보 수정 요청:', {
        url,
        method: 'PUT',
        headers,
        requestBody,
      })

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log(
        '회원정보 수정 응답 상태:',
        response.status,
        response.statusText
      )

      if (!response.ok) {
        let errorMessage = `회원정보 수정에 실패했습니다. (${response.status})`

        try {
          const errorData = await response.json()
          console.log('회원정보 수정 에러 응답:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log('회원정보 수정 에러 텍스트:', errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }

        console.log('회원정보 수정 실패 - 최종 에러 메시지:', errorMessage)
        alert(errorMessage)
        return
      }

      const result = await response.json()
      console.log('회원정보 수정 성공 응답:', result)

      alert('회원정보가 성공적으로 수정되었습니다.')

      // 회원정보 새로고침
      fetchCustomerInfo()
    } catch (error) {
      console.error('회원정보 수정 실패:', error)
      alert('회원정보 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 결제 취소 목록 조회
  const fetchCancelList = async () => {
    try {
      setCancelLoading(true)
      setCancelError(null)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const url = buildURL('/api/v1/customers/cancel-list')
      console.log('결제 취소 목록 조회 URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      })

      console.log(
        '결제 취소 목록 조회 응답 상태:',
        response.status,
        response.statusText
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: CancelListResponse = await response.json()
      console.log('결제 취소 목록 조회 응답 데이터:', data)

      if (data.success) {
        setCancelTransactions(data.data.content || [])
      } else {
        setCancelError(data.message || '결제 취소 목록 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('결제 취소 목록 조회 실패:', error)
      setCancelError('결제 취소 목록 조회 중 오류가 발생했습니다.')
    } finally {
      setCancelLoading(false)
    }
  }

  // 결제 취소 실행
  const cancelPayment = async (
    transactionUniqueNo: string,
    cardNo: string,
    cvc: string
  ): Promise<boolean> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const url = buildURL('/api/v1/customers/payments/cancel')
      console.log('결제 취소 URL:', url)

      const requestBody = {
        transactionUniqueNo,
        cardNo,
        cvc,
      }

      console.log('결제 취소 요청:', {
        url,
        method: 'POST',
        headers,
        requestBody,
      })

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log('결제 취소 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `결제 취소에 실패했습니다. (${response.status})`

        try {
          const errorData = await response.json()
          console.log('결제 취소 에러 응답:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log('결제 취소 에러 텍스트:', errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('결제 취소 성공 응답:', result)

      return true
    } catch (error) {
      console.error('결제 취소 실패:', error)
      throw error
    }
  }

  // 카드 정보 조회 함수
  const fetchCreditCard = async () => {
    try {
      setCardsLoading(true)
      setCardsError(null)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(buildURL('/customers/me/card'), {
        method: 'POST',
        headers,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('카드 정보 조회 실패 - 응답 텍스트:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('카드 정보 조회 응답 데이터:', data)

      if (data.success && data.data) {
        setCreditCard(data.data)
      } else {
        throw new Error(data.message || '카드 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('카드 정보 조회 실패:', error)
      setCardsError('카드 정보를 불러오는데 실패했습니다.')
    } finally {
      setCardsLoading(false)
    }
  }

  // 결제 취소 모달 열기
  const handleCancelClick = (transaction: CancelTransaction) => {
    setSelectedTransaction(transaction)
    setIsCancelModalOpen(true)
    fetchCreditCard()
  }

  // 결제 취소 확인
  const handleCancelConfirm = async () => {
    if (!selectedTransaction || !creditCard) {
      alert('카드 정보를 확인해주세요.')
      return
    }

    try {
      setCancelProcessing(true)

      await cancelPayment(
        selectedTransaction.transactionUniqueNo,
        creditCard.cardNo,
        creditCard.cvc
      )

      alert('결제가 성공적으로 취소되었습니다.')
      setIsCancelModalOpen(false)
      setSelectedTransaction(null)
      setCreditCard(null)

      // 취소 목록 새로고침
      fetchCancelList()
    } catch (error) {
      console.error('결제 취소 실패:', error)
      alert(
        error instanceof Error
          ? error.message
          : '결제 취소 중 오류가 발생했습니다.'
      )
    } finally {
      setCancelProcessing(false)
    }
  }

  // 컴포넌트 마운트 시 회원정보 조회
  useEffect(() => {
    fetchCustomerInfo()
    fetchCancelList()
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="flex w-full flex-col items-start">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="font-jalnan text-2xl font-bold text-[#ffc800]">MY</h1>
        </div>

        {/* 프로필 및 정보 수정 섹션 */}
        <div className="mb-6 w-full max-w-2xl rounded-lg border border-gray-200 p-6">
          {/* 프로필 정보 */}
          <div className="mb-6 flex h-20 items-center">
            <div className="relative mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#ffc800]">
              {customerInfo?.imgUrl ? (
                <img
                  src={customerInfo.imgUrl}
                  alt="프로필 이미지"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
                  <div className="font-nanum-square-round-eb text-xl leading-8 font-bold text-[#ffc800]">
                    {customerInfo?.name ? customerInfo.name.charAt(0) : '?'}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              {loading ? (
                <div className="font-nanum-square-round-eb mb-1 text-xl font-bold text-gray-400">
                  로딩 중...
                </div>
              ) : (
                <>
                  <div className="font-nanum-square-round-eb mb-1 text-xl font-bold text-black">
                    {customerInfo?.name || '정보 없음'}
                  </div>
                  <div className="font-nanum-square-round-eb text-sm text-gray-500">
                    {customerInfo?.phoneNumber || '정보 없음'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 정보 입력 폼 */}
          <div className="space-y-4">
            {/* 이름 */}
            <div className="flex flex-col">
              <label className="mb-2 text-xs text-gray-500">이름</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white p-2 text-black"
                placeholder="이름을 입력하세요"
                disabled={loading}
              />
            </div>

            {/* 전화번호 */}
            <div className="flex flex-col">
              <label className="mb-2 text-xs text-gray-500">전화번호</label>
              <input
                type="text"
                value={editPhoneNumber}
                onChange={e => {
                  // 숫자만 추출
                  const numbers = e.target.value.replace(/[^0-9]/g, '')

                  // 하이픈 자동 추가 (000-0000-0000 형식)
                  let formattedPhone = numbers
                  if (numbers.length >= 3) {
                    formattedPhone = numbers.substring(0, 3)
                    if (numbers.length >= 7) {
                      formattedPhone += '-' + numbers.substring(3, 7)
                      if (numbers.length >= 11) {
                        formattedPhone += '-' + numbers.substring(7, 11)
                      } else if (numbers.length > 7) {
                        formattedPhone += '-' + numbers.substring(7)
                      }
                    } else if (numbers.length > 3) {
                      formattedPhone += '-' + numbers.substring(3)
                    }
                  }

                  setEditPhoneNumber(formattedPhone)
                }}
                className="h-10 rounded-md border border-gray-300 bg-white p-2 text-black"
                placeholder="전화번호를 입력하세요 (000-0000-0000)"
                maxLength={13}
                disabled={loading}
              />
            </div>

            {/* 이메일 */}
            <div className="flex flex-col">
              <label className="mb-2 text-xs text-gray-500">이메일</label>
              <input
                type="email"
                value={customerInfo?.email || ''}
                className="h-10 rounded-md border border-gray-300 bg-black/60 p-2 text-white"
                readOnly
                disabled
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded bg-red-50 p-2 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* 정보 수정 버튼 */}
            <button
              onClick={updateCustomerInfo}
              disabled={loading || !editName.trim() || !editPhoneNumber.trim()}
              className="font-jalnan h-10 w-full rounded-md bg-[#ffc800] text-sm font-bold text-white hover:bg-[#e6b400] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? '수정 중...' : '정보 수정'}
            </button>
          </div>
        </div>

        {/* 카드 취소 섹션 */}
        <div className="w-full max-w-2xl rounded-lg border border-gray-200 p-6">
          <h2 className="font-jalnan mb-6 text-sm font-bold text-black">
            카드 취소
          </h2>

          {cancelLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="font-nanum-square-round-eb text-sm text-gray-500">
                결제 취소 목록을 불러오는 중...
              </div>
            </div>
          ) : cancelError ? (
            <div className="flex items-center justify-center py-8">
              <div className="font-nanum-square-round-eb text-sm text-red-500">
                {cancelError}
              </div>
            </div>
          ) : cancelTransactions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="font-nanum-square-round-eb text-sm text-gray-500">
                취소 가능한 결제 내역이 없습니다.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cancelTransactions.map(transaction => (
                <div
                  key={transaction.transactionUniqueNo}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="font-nanum-square-round-eb font-bold text-black">
                        {transaction.storeName}
                      </div>
                      <div className="font-nanum-square-round-eb text-sm text-gray-500">
                        {new Date(transaction.transactionTime).toLocaleString(
                          'ko-KR'
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-nanum-square-round-eb font-bold text-black">
                        {transaction.paymentAmount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <div className="font-nanum-square-round-eb mb-3 text-xs text-gray-400">
                    거래번호: {transaction.transactionUniqueNo}
                  </div>
                  <button
                    onClick={() => handleCancelClick(transaction)}
                    className="font-jalnan w-full rounded bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600"
                  >
                    결제 취소
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 알림 설정 섹션 */}
        <div className="mt-8 w-full max-w-2xl rounded-lg border border-gray-200 p-6">
          <h2 className="font-jalnan mb-6 text-sm font-bold text-black">
            알림 설정
          </h2>

          <div className="space-y-4">
            {/* 결제 알림 */}
            <div className="flex items-center justify-between">
              <span className="font-nanum-square-round-eb text-sm text-black">
                결제 알림
              </span>
              <button
                onClick={() =>
                  setIsPaymentNotificationOn(!isPaymentNotificationOn)
                }
                className={`h-6 w-12 rounded-full transition-colors ${
                  isPaymentNotificationOn ? 'bg-[#ffc800]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    isPaymentNotificationOn ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 모임 알림 */}
            <div className="flex items-center justify-between">
              <span className="font-nanum-square-round-eb text-sm text-black">
                모임 알림
              </span>
              <button
                onClick={() => setIsGroupNotificationOn(!isGroupNotificationOn)}
                className={`h-6 w-12 rounded-full transition-colors ${
                  isGroupNotificationOn ? 'bg-[#ffc800]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    isGroupNotificationOn ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 충전 알림 */}
            <div className="flex items-center justify-between">
              <span className="font-nanum-square-round-eb text-sm text-black">
                충전 알림
              </span>
              <button
                onClick={() =>
                  setIsChargeNotificationOn(!isChargeNotificationOn)
                }
                className={`h-6 w-12 rounded-full transition-colors ${
                  isChargeNotificationOn ? 'bg-[#ffc800]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    isChargeNotificationOn ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 취소 모달 */}
      {isCancelModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative h-[400px] w-[412px] rounded-[30px] bg-[#fbf9f5]">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6">
              <div className="font-jalnan text-xl leading-[140%] text-[#ffc800]">
                결제 취소
              </div>
              <button
                onClick={() => {
                  setIsCancelModalOpen(false)
                  setSelectedTransaction(null)
                  setCreditCard(null)
                }}
                className="flex items-center justify-center"
              >
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

            {/* 구분선 */}
            <div className="h-[3px] w-full bg-[#ffc800]" />

            {/* 내용 */}
            <div className="px-6 pt-6">
              <div className="mb-4 space-y-2">
                <div className="font-nanum-square-round-eb text-sm text-gray-600">
                  가게: {selectedTransaction.storeName}
                </div>
                <div className="font-nanum-square-round-eb text-sm text-gray-600">
                  금액: {selectedTransaction.paymentAmount.toLocaleString()}원
                </div>
                <div className="font-nanum-square-round-eb text-sm text-gray-600">
                  거래번호: {selectedTransaction.transactionUniqueNo}
                </div>
              </div>

              {/* 카드 정보 */}
              {cardsLoading ? (
                <div className="mb-6 flex items-center justify-center py-4">
                  <div className="font-nanum-square-round-eb text-sm text-gray-500">
                    카드 정보를 불러오는 중...
                  </div>
                </div>
              ) : cardsError ? (
                <div className="mb-6 flex items-center justify-center py-4">
                  <div className="font-nanum-square-round-eb text-sm text-red-500">
                    {cardsError}
                  </div>
                </div>
              ) : creditCard ? (
                <div className="mb-6 rounded-lg border border-[#ffc800] bg-white p-4">
                  <div className="font-nanum-square-round-eb text-sm font-bold text-black">
                    {creditCard.cardName}
                  </div>
                  <div className="font-nanum-square-round-eb text-sm text-gray-600">
                    {creditCard.cardNo.replace(
                      /(\d{4})(\d{4})(\d{4})(\d{4})/,
                      '**** - **** - **** - $4'
                    )}
                  </div>
                </div>
              ) : null}

              {/* 취소하기 버튼 */}
              <button
                onClick={handleCancelConfirm}
                disabled={cancelProcessing || !creditCard}
                className="flex h-11 w-full items-center justify-center rounded-[10px] bg-red-500 disabled:bg-gray-300"
              >
                <div className="font-jalnan text-xl leading-[140%] text-white">
                  {cancelProcessing ? '처리 중...' : '결제 취소하기'}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
