'use client'
import { buildURL } from '@/api/config'
import { useEffect, useState } from 'react'

// 타입 정의
interface GroupAddRequest {
  groupAddRequestId: number
  name: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface GroupAddRequestsResponse {
  success: boolean
  status: number
  message: string
  data: GroupAddRequest[]
  timestamp: string
}

interface GroupInfo {
  groupId: number
  groupName: string
  groupDescription: string
  leaderName: string
}

interface GroupSettingsProps {
  groupId: number
  groupName?: string
  groupDescription?: string
  members?: string[]
}

// 그룹 설정 컴포넌트
export const GroupSettings = ({
  groupId,
  groupName: initialGroupName = 'A509',
  groupDescription: initialGroupDescription = 'A509',
  members = ['혜은', '혜으니', '혜응응'],
}: GroupSettingsProps) => {
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [groupName, setGroupName] = useState(initialGroupName)
  const [groupDescription, setGroupDescription] = useState(
    initialGroupDescription
  )
  const [pendingRequests, setPendingRequests] = useState<GroupAddRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)

  // 그룹 정보 조회
  const fetchGroupInfo = async () => {
    try {
      const url = buildURL(`/groups/${groupId}`)
      console.log('그룹 정보 조회 URL:', url)
      
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('그룹 정보 조회 응답:', data)
      
      if (data.success) {
        setGroupInfo(data.data)
        setGroupName(data.data.groupName)
        setGroupDescription(data.data.groupDescription)
      }
    } catch (error) {
      console.error('그룹 정보 조회 실패:', error)
    }
  }

  // 가입 요청 목록 조회
  const fetchAddRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = buildURL(`/groups/${groupId}/add-requests`)
      console.log('가입 요청 목록 조회 URL:', url)
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      console.log('가입 요청 목록 조회 헤더:', headers)

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      })

      console.log('가입 요청 목록 조회 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: GroupAddRequestsResponse = await response.json()
      console.log('가입 요청 목록 조회 응답 데이터:', data)
      
      if (data.success) {
        // PENDING 상태의 요청만 필터링
        const pendingOnly = data.data.filter(request => request.status === 'PENDING')
        console.log('PENDING 상태 요청들:', pendingOnly)
        setPendingRequests(pendingOnly)
      } else {
        setError(data.message || '가입 요청 목록 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('가입 요청 목록 조회 실패:', error)
      setError('가입 요청 목록 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 가입 요청 승인/거절
  const handleRequestDecision = async (requestId: number, isAccept: boolean) => {
    try {
      setLoading(true)
      setError(null)

      const url = buildURL(`/groups/${groupId}/add-requests`)
      
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
        groupAddRequestId: requestId,
        isAccept: isAccept
      }

      console.log(`${isAccept ? '승인' : '거절'} 요청 시작:`, {
        url,
        method: 'PATCH',
        headers,
        requestBody,
        groupId,
        requestId
      })

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log(`${isAccept ? '승인' : '거절'} 응답 상태:`, response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `${isAccept ? '승인' : '거절'} 처리에 실패했습니다. (${response.status})`
        
        try {
          const errorData = await response.json()
          console.log(`${isAccept ? '승인' : '거절'} 에러 응답:`, errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log(`${isAccept ? '승인' : '거절'} 에러 텍스트:`, errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }
        
        console.log(`${isAccept ? '승인' : '거절'} 실패 - 최종 에러 메시지:`, errorMessage)
        alert(errorMessage)
        return
      }

      const result = await response.json()
      console.log(`${isAccept ? '승인' : '거절'} 성공 응답:`, result)
      
      if (result.success) {
        alert(`${isAccept ? '승인' : '거절'} 처리되었습니다.`)
        // 목록 새로고침
        fetchAddRequests()
      } else {
        alert(result.message || `${isAccept ? '승인' : '거절'} 처리에 실패했습니다.`)
      }
    } catch (error) {
      console.error('가입 요청 처리 실패:', error)
      alert(`${isAccept ? '승인' : '거절'} 처리 중 오류가 발생했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = (requestId: number) => {
    handleRequestDecision(requestId, true)
  }

  const handleRejectRequest = (requestId: number) => {
    handleRequestDecision(requestId, false)
  }

  const handleRemoveMember = (memberName: string) => {
    // 멤버 내보내기 로직
    console.log(`${memberName} 내보내기`)
  }

  const handleDisbandGroup = () => {
    // 모임 해체 로직
    console.log('모임 해체')
  }

  const handleTransferLeadership = () => {
    // 모임장 위임 로직
    console.log(`${selectedMember}에게 위임`)
  }

  const handleUpdateGroup = () => {
    // 모임 수정 로직
    console.log('모임 수정:', { groupName, groupDescription })
  }

  // 컴포넌트 마운트 시 그룹 정보와 가입 요청 목록 조회
  useEffect(() => {
    if (groupId) {
      fetchGroupInfo()
      fetchAddRequests()
    }
  }, [groupId])

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1
            className="text-3xl leading-8 font-extrabold text-black"
            style={{ fontFamily: 'Tenada' }}
          >
            {groupName}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 왼쪽 컬럼 - 상단: 모임 추가 신청 */}
          <div className="lg:col-span-1">
            <div className="h-full border border-black bg-[#faf8f6] p-6">
              <div
                className="mb-6 text-xl font-extrabold text-black"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                모임 추가 신청
              </div>
              {/* 로딩 상태 */}
              {loading && (
                <div className="p-3 text-center text-sm text-gray-500">
                  로딩 중...
                </div>
              )}

              {/* 에러 메시지 */}
              {error && (
                <div className="p-3 text-center text-sm text-red-500">
                  {error}
                </div>
              )}

              {/* 가입 요청 목록 */}
              {!loading && !error && pendingRequests.length > 0 && (
                pendingRequests.map(request => (
                  <div key={request.groupAddRequestId} className="flex items-center gap-3 p-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                    <div
                      className="flex-1 text-xs font-bold text-black"
                      style={{ fontFamily: 'NanumSquare Neo' }}
                    >
                      {request.name}
                    </div>
                    <button
                      onClick={() => handleAcceptRequest(request.groupAddRequestId)}
                      disabled={loading}
                      className="bg-blue-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'NanumSquare Neo' }}
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.groupAddRequestId)}
                      disabled={loading}
                      className="bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'NanumSquare Neo' }}
                    >
                      거절
                    </button>
                  </div>
                ))
              )}

              {/* 신청이 없는 경우 */}
              {!loading && !error && pendingRequests.length === 0 && (
                <div className="p-3 text-center text-sm text-gray-500">
                  신청이 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 왼쪽 컬럼 - 하단: 멤버 관리 */}
          <div className="lg:col-span-1">
            <div className="h-full border border-black bg-[#faf8f6] p-6">
              <div
                className="mb-6 text-xl font-extrabold text-black"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                멤버 관리
              </div>
              <div className="space-y-3">
                {members.map(member => (
                  <div key={member} className="flex items-center gap-3 p-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                    <div
                      className="flex-1 text-xs font-bold text-black"
                      style={{ fontFamily: 'NanumSquare Neo' }}
                    >
                      {member}
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="bg-black px-2 py-1 text-[10px] font-bold text-white"
                      style={{ fontFamily: 'NanumSquare Neo' }}
                    >
                      내보내기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 컬럼 - 상단: 모임장 위임 */}
          <div className="lg:col-span-1">
            <div className="h-full border border-black p-6">
              <div
                className="mb-4 text-xl font-extrabold text-black"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                모임장 위임
              </div>
              <div
                className="mb-4 text-[10px] text-black"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                위임할 멤버를 선택해주세요.
              </div>
              <select
                value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                className="mb-4 h-8 w-full rounded border border-black px-2"
              >
                <option value="">멤버 선택</option>
                {members.map(member => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              <button
                onClick={handleTransferLeadership}
                disabled={loading}
                className="w-full bg-black py-2 text-[10px] font-bold text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                위임하기
              </button>
            </div>
          </div>

          {/* 오른쪽 컬럼 - 중간: 모임 수정 */}
          <div className="lg:col-span-1">
            <div className="h-full border border-black bg-[#faf8f6] p-6">
              <div
                className="mb-4 text-xl font-extrabold text-black"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                모임 수정
              </div>

              {/* 모임명 */}
              <div className="mb-4">
                <div
                  className="mb-2 text-[10px] font-bold text-black"
                  style={{ fontFamily: 'NanumSquare Neo' }}
                >
                  모임명
                </div>
                <input
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="h-8 w-full border border-black px-2 text-[11px] font-bold"
                  style={{ fontFamily: 'NanumSquare Neo' }}
                />
              </div>

              {/* 모임 설명 */}
              <div className="mb-4">
                <div
                  className="mb-2 text-[10px] font-bold text-black"
                  style={{ fontFamily: 'NanumSquare Neo' }}
                >
                  모임 설명
                </div>
                <textarea
                  value={groupDescription}
                  onChange={e => setGroupDescription(e.target.value)}
                  className="h-16 w-full resize-none border border-black px-2 py-1 text-[11px] font-bold"
                  style={{ fontFamily: 'NanumSquare Neo' }}
                />
              </div>

              <button
                onClick={handleUpdateGroup}
                disabled={loading}
                className="w-full bg-black py-2 text-[10px] font-bold text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                수정하기
              </button>
            </div>
          </div>

          {/* 오른쪽 컬럼 - 하단: 모임 해체 */}
          <div className="lg:col-span-1">
            <div className="flex h-full flex-col justify-center border border-black p-6">
              <div
                className="mb-4 text-xl font-extrabold text-black"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                모임 해체
              </div>
              <button
                onClick={handleDisbandGroup}
                disabled={loading}
                className="bg-black px-4 py-2 text-[10px] font-bold text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                모임 해체하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
