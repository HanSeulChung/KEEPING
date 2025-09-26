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

interface GroupMember {
  groupId: number
  customerId: number
  customerName: string
  isLeader: boolean
  groupMemberId: number
}

interface GroupMembersResponse {
  success: boolean
  status: number
  message: string
  data: GroupMember[]
  timestamp: string
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
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  // 그룹 멤버 조회
  const fetchGroupMembers = async () => {
    try {
      setMembersLoading(true)
      setError(null)

      const url = buildURL(`/groups/${groupId}/group-members`)
      console.log('그룹 멤버 조회 URL:', url)
      
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

      console.log('그룹 멤버 조회 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: GroupMembersResponse = await response.json()
      console.log('그룹 멤버 조회 응답 데이터:', data)
      
      if (data.success) {
        setGroupMembers(data.data || [])
      } else {
        setError(data.message || '그룹 멤버 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('그룹 멤버 조회 실패:', error)
      setError('그룹 멤버 조회 중 오류가 발생했습니다.')
    } finally {
      setMembersLoading(false)
    }
  }

  // 멤버 내보내기
  const removeMember = async (customerId: number, customerName: string) => {
    const confirmMessage = `"${customerName}"을/를 내보내시겠습니까?`
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = buildURL(`/groups/${groupId}/group-member`)
      
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
        targetCustomerId: customerId
      }

      console.log('멤버 내보내기 요청:', {
        url,
        method: 'POST',
        headers,
        requestBody,
        groupId,
        customerId,
        customerName
      })

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log('멤버 내보내기 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `멤버 내보내기에 실패했습니다. (${response.status})`
        
        try {
          const errorData = await response.json()
          console.log('멤버 내보내기 에러 응답:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log('멤버 내보내기 에러 텍스트:', errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }
        
        console.log('멤버 내보내기 실패 - 최종 에러 메시지:', errorMessage)
        alert(errorMessage)
        return
      }

      const result = await response.json()
      console.log('멤버 내보내기 성공 응답:', result)
      
      alert(`${customerName}을/를 성공적으로 내보냈습니다.`)
      
      // 멤버 목록 새로고침
      fetchGroupMembers()
      
    } catch (error) {
      console.error('멤버 내보내기 실패:', error)
      alert('멤버 내보내기 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

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

  // 모임장 위임
  const handleTransferLeadership = async () => {
    if (!selectedMember) {
      alert('위임할 멤버를 선택해주세요.')
      return
    }

    // 선택된 멤버의 customerId 찾기
    const selectedMemberData = groupMembers.find(member => member.customerName === selectedMember)
    if (!selectedMemberData) {
      alert('선택된 멤버를 찾을 수 없습니다.')
      return
    }

    const confirmMessage = `"${selectedMember}"에게 모임장을 위임하시겠습니까?`
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = buildURL(`/groups/${groupId}/group-leader`)
      
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
        newGroupLeaderId: selectedMemberData.customerId
      }

      console.log('모임장 위임 요청:', {
        url,
        method: 'PATCH',
        headers,
        requestBody,
        groupId,
        selectedMember,
        newGroupLeaderId: selectedMemberData.customerId
      })

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log('모임장 위임 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `모임장 위임에 실패했습니다. (${response.status})`
        
        try {
          const errorData = await response.json()
          console.log('모임장 위임 에러 응답:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log('모임장 위임 에러 텍스트:', errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }
        
        console.log('모임장 위임 실패 - 최종 에러 메시지:', errorMessage)
        alert(errorMessage)
        return
      }

      const result = await response.json()
      console.log('모임장 위임 성공 응답:', result)
      
      alert(`"${selectedMember}"에게 모임장을 성공적으로 위임했습니다.`)
      
      // 페이지 나가기
      window.location.href = '/customer/groupWallet'
      
    } catch (error) {
      console.error('모임장 위임 실패:', error)
      alert('모임장 위임 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = (memberName: string) => {
    // 멤버 내보내기 로직
    console.log(`${memberName} 내보내기`)
  }

  const handleDisbandGroup = async () => {
    const confirmMessage = `모임을 해체하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = buildURL(`/groups/${groupId}`)
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      console.log('모임 해체 요청:', {
        url,
        method: 'DELETE',
        headers,
        groupId
      })

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })

      console.log('모임 해체 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `모임 해체에 실패했습니다. (${response.status})`
        
        try {
          const errorData = await response.json()
          console.log('모임 해체 에러 응답:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log('모임 해체 에러 텍스트:', errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }
        
        console.log('모임 해체 실패 - 최종 에러 메시지:', errorMessage)
        alert(errorMessage)
        return
      }

      const result = await response.json()
      console.log('모임 해체 성공 응답:', result)
      
      alert('모임이 성공적으로 해체되었습니다.')
      
      // 메인 페이지로 이동
      window.location.href = '/customer/groupWallet'
      
    } catch (error) {
      console.error('모임 해체 실패:', error)
      alert('모임 해체 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }


  const handleUpdateGroup = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = buildURL(`/groups/${groupId}`)
      
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
        groupName: groupName,
        groupDescription: groupDescription
      }

      console.log('모임 수정 요청:', {
        url,
        method: 'PATCH',
        headers,
        requestBody,
        groupId
      })

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log('모임 수정 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `모임 수정에 실패했습니다. (${response.status})`
        
        try {
          const errorData = await response.json()
          console.log('모임 수정 에러 응답:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log('모임 수정 에러 텍스트:', errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }
        
        console.log('모임 수정 실패 - 최종 에러 메시지:', errorMessage)
        alert(errorMessage)
        return
      }

      const result = await response.json()
      console.log('모임 수정 성공 응답:', result)
      
      alert('모임 정보가 성공적으로 수정되었습니다.')
      
      // 그룹 정보 새로고침
      fetchGroupInfo()
      
    } catch (error) {
      console.error('모임 수정 실패:', error)
      alert('모임 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 그룹 정보, 가입 요청 목록, 멤버 목록 조회
  useEffect(() => {
    if (groupId) {
      fetchGroupInfo()
      fetchAddRequests()
      fetchGroupMembers()
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
              {/* 로딩 상태 */}
              {membersLoading && (
                <div className="p-3 text-center text-sm text-gray-500">
                  멤버 로딩 중...
                </div>
              )}

              {/* 멤버 목록 (리더가 아닌 사람들만) */}
              {!membersLoading && groupMembers.filter(member => !member.isLeader).length > 0 && (
                <div className="space-y-3">
                  {groupMembers
                    .filter(member => !member.isLeader)
                    .map(member => (
                      <div key={member.customerId} className="flex items-center gap-3 p-3">
                        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                        <div
                          className="flex-1 text-xs font-bold text-black"
                          style={{ fontFamily: 'NanumSquare Neo' }}
                        >
                          {member.customerName}
                        </div>
                        <button
                          onClick={() => removeMember(member.customerId, member.customerName)}
                          disabled={loading}
                          className="bg-black px-2 py-1 text-[10px] font-bold text-white hover:bg-gray-800 disabled:bg-gray-400"
                          style={{ fontFamily: 'NanumSquare Neo' }}
                        >
                          {loading ? '처리 중...' : '내보내기'}
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* 멤버가 없는 경우 */}
              {!membersLoading && groupMembers.filter(member => !member.isLeader).length === 0 && (
                <div className="p-3 text-center text-sm text-gray-500">
                  내보낼 수 있는 멤버가 없습니다.
                </div>
              )}

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
                disabled={membersLoading}
                className="mb-4 h-8 w-full rounded border border-black px-2 disabled:bg-gray-100"
              >
                <option value="">
                  {membersLoading ? '로딩 중...' : '멤버 선택'}
                </option>
                {/* API 성공 시: 실제 멤버 데이터 (리더 제외) */}
                {!membersLoading && groupMembers.length > 0 && 
                  groupMembers
                    .filter(member => !member.isLeader)
                    .map(member => (
                      <option key={member.customerId} value={member.customerName}>
                        {member.customerName}
                      </option>
                    ))
                }
              </select>
              <button
                onClick={handleTransferLeadership}
                disabled={loading || !selectedMember}
                className="w-full bg-black py-2 text-[10px] font-bold text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{ fontFamily: 'NanumSquare Neo' }}
              >
                {loading ? '위임 중...' : '위임하기'}
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
                {loading ? '수정 중...' : '수정하기'}
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
                {loading ? '해체 중...' : '모임 해체하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
