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

      console.log('회원정보 조회 응답 상태:', response.status, response.statusText)

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
        phoneNumber: editPhoneNumber.trim()
      }

      console.log('회원정보 수정 요청:', {
        url,
        method: 'PUT',
        headers,
        requestBody
      })

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log('회원정보 수정 응답 상태:', response.status, response.statusText)

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

  // 컴포넌트 마운트 시 회원정보 조회
  useEffect(() => {
    fetchCustomerInfo()
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="flex w-full flex-col items-start">
        {/* 헤더 */}
        <div className="mb-6">
          <h1
            className="text-2xl font-extrabold text-black"
            style={{ fontFamily: 'Tenada' }}
          >
            MY
          </h1>
        </div>

        {/* 프로필 및 정보 수정 섹션 */}
        <div className="mb-6 w-full max-w-2xl rounded-lg border border-gray-200 p-6">
          {/* 프로필 정보 */}
          <div className="mb-6 flex h-20 items-center">
            <div className="mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 relative">
              {customerInfo?.imgUrl ? (
                <img
                  src={customerInfo.imgUrl}
                  alt="프로필 이미지"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <div className="text-xl leading-8 font-bold text-gray-600">
                    {customerInfo?.name ? customerInfo.name.charAt(0) : '?'}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              {loading ? (
                <div className="mb-1 text-xl font-bold text-gray-400">로딩 중...</div>
              ) : (
                <>
                  <div className="mb-1 text-xl font-bold text-black">
                    {customerInfo?.name || '정보 없음'}
                  </div>
                  <div className="text-sm text-gray-500">
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
                onChange={(e) => setEditName(e.target.value)}
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
                onChange={(e) => {
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
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* 정보 수정 버튼 */}
            <button 
              onClick={updateCustomerInfo}
              disabled={loading || !editName.trim() || !editPhoneNumber.trim()}
              className="h-10 w-full rounded-md bg-black text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '수정 중...' : '정보 수정'}
            </button>
          </div>
        </div>

        {/* 알림 설정 섹션 */}
        <div className="w-full max-w-2xl rounded-lg border border-gray-200 p-6">
          <h2 className="mb-6 text-sm font-bold text-black">알림 설정</h2>

          <div className="space-y-4">
            {/* 결제 알림 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">결제 알림</span>
              <button
                onClick={() =>
                  setIsPaymentNotificationOn(!isPaymentNotificationOn)
                }
                className={`h-6 w-12 rounded-full transition-colors ${
                  isPaymentNotificationOn ? 'bg-black' : 'bg-gray-300'
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
              <span className="text-sm text-black">모임 알림</span>
              <button
                onClick={() => setIsGroupNotificationOn(!isGroupNotificationOn)}
                className={`h-6 w-12 rounded-full transition-colors ${
                  isGroupNotificationOn ? 'bg-black' : 'bg-gray-300'
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
              <span className="text-sm text-black">충전 알림</span>
              <button
                onClick={() =>
                  setIsChargeNotificationOn(!isChargeNotificationOn)
                }
                className={`h-6 w-12 rounded-full transition-colors ${
                  isChargeNotificationOn ? 'bg-black' : 'bg-gray-300'
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
    </div>
  )
}
