'use client'
import { buildURL } from '@/api/config'
import { useEffect, useState } from 'react'
import { Alert } from '../ui/Alert'

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
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{
    id: number
    name: string
  } | null>(null)
  const [isTransferConfirmOpen, setIsTransferConfirmOpen] = useState(false)
  const [isDisbandConfirmOpen, setIsDisbandConfirmOpen] = useState(false)

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

      console.log(
        '그룹 멤버 조회 응답 상태:',
        response.status,
        response.statusText
      )

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

  // 멤버 내보내기 확인
  const removeMember = (customerId: number, customerName: string) => {
    setMemberToRemove({ id: customerId, name: customerName })
    setIsRemoveConfirmOpen(true)
  }

  // 실제 멤버 내보내기 실행
  const executeRemoveMember = async () => {
    if (!memberToRemove) return

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
        targetCustomerId: memberToRemove.id,
      }

      console.log('멤버 내보내기 요청:', {
        url,
        method: 'POST',
        headers,
        requestBody,
        groupId,
        customerId: memberToRemove.id,
        customerName: memberToRemove.name,
      })

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log(
        '멤버 내보내기 응답 상태:',
        response.status,
        response.statusText
      )

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
        setAlertMessage(errorMessage)
        setAlertType('error')
        setIsAlertOpen(true)
        return
      }

      const result = await response.json()
      console.log('멤버 내보내기 성공 응답:', result)

      setAlertMessage(`${memberToRemove.name}을/를 성공적으로 내보냈습니다.`)
      setAlertType('success')
      setIsAlertOpen(true)

      // 멤버 목록 새로고침
      fetchGroupMembers()
    } catch (error) {
      console.error('멤버 내보내기 실패:', error)
      setAlertMessage('멤버 내보내기 중 오류가 발생했습니다.')
      setAlertType('error')
      setIsAlertOpen(true)
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

      console.log(
        '가입 요청 목록 조회 응답 상태:',
        response.status,
        response.statusText
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: GroupAddRequestsResponse = await response.json()
      console.log('가입 요청 목록 조회 응답 데이터:', data)

      if (data.success) {
        // PENDING 상태의 요청만 필터링
        const pendingOnly = data.data.filter(
          request => request.status === 'PENDING'
        )
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
  const handleRequestDecision = async (
    requestId: number,
    isAccept: boolean
  ) => {
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
        isAccept: isAccept,
      }

      console.log(`${isAccept ? '승인' : '거절'} 요청 시작:`, {
        url,
        method: 'PATCH',
        headers,
        requestBody,
        groupId,
        requestId,
      })

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log(
        `${isAccept ? '승인' : '거절'} 응답 상태:`,
        response.status,
        response.statusText
      )

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

        console.log(
          `${isAccept ? '승인' : '거절'} 실패 - 최종 에러 메시지:`,
          errorMessage
        )
        alert(errorMessage)
        return
      }

      const result = await response.json()
      console.log(`${isAccept ? '승인' : '거절'} 성공 응답:`, result)

      if (result.success) {
        setAlertMessage(`${isAccept ? '승인' : '거절'} 처리되었습니다.`)
        setAlertType('success')
        setIsAlertOpen(true)
        // 목록 새로고침
        fetchAddRequests()
      } else {
        setAlertMessage(
          result.message || `${isAccept ? '승인' : '거절'} 처리에 실패했습니다.`
        )
        setAlertType('error')
        setIsAlertOpen(true)
      }
    } catch (error) {
      console.error('가입 요청 처리 실패:', error)
      setAlertMessage(
        `${isAccept ? '승인' : '거절'} 처리 중 오류가 발생했습니다.`
      )
      setAlertType('error')
      setIsAlertOpen(true)
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

  // 모임장 위임 확인
  const handleTransferLeadership = () => {
    if (!selectedMember) {
      setAlertMessage('위임할 멤버를 선택해주세요.')
      setAlertType('error')
      setIsAlertOpen(true)
      return
    }

    // 선택된 멤버의 customerId 찾기
    const selectedMemberData = groupMembers.find(
      member => member.customerName === selectedMember
    )
    if (!selectedMemberData) {
      setAlertMessage('선택된 멤버를 찾을 수 없습니다.')
      setAlertType('error')
      setIsAlertOpen(true)
      return
    }

    setIsTransferConfirmOpen(true)
  }

  // 실제 모임장 위임 실행
  const executeTransferLeadership = async () => {
    // 선택된 멤버의 customerId 찾기
    const selectedMemberData = groupMembers.find(
      member => member.customerName === selectedMember
    )
    if (!selectedMemberData) {
      setAlertMessage('선택된 멤버를 찾을 수 없습니다.')
      setAlertType('error')
      setIsAlertOpen(true)
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
        newGroupLeaderId: selectedMemberData.customerId,
      }

      console.log('모임장 위임 요청:', {
        url,
        method: 'PATCH',
        headers,
        requestBody,
        groupId,
        selectedMember,
        newGroupLeaderId: selectedMemberData.customerId,
      })

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log(
        '모임장 위임 응답 상태:',
        response.status,
        response.statusText
      )

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
        setAlertMessage(errorMessage)
        setAlertType('error')
        setIsAlertOpen(true)
        return
      }

      const result = await response.json()
      console.log('모임장 위임 성공 응답:', result)

      setAlertMessage(
        `"${selectedMember}"에게 모임장을 성공적으로 위임했습니다.`
      )
      setAlertType('success')
      setIsAlertOpen(true)
    } catch (error) {
      console.error('모임장 위임 실패:', error)
      setAlertMessage('모임장 위임 중 오류가 발생했습니다.')
      setAlertType('error')
      setIsAlertOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = (memberName: string) => {
    // 멤버 내보내기 로직
    console.log(`${memberName} 내보내기`)
  }

  // 모임 해체 확인
  const handleDisbandGroup = () => {
    setIsDisbandConfirmOpen(true)
  }

  // 실제 모임 해체 실행
  const executeDisbandGroup = async () => {
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
        groupId,
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
        setAlertMessage(errorMessage)
        setAlertType('error')
        setIsAlertOpen(true)
        return
      }

      const result = await response.json()
      console.log('모임 해체 성공 응답:', result)

      setAlertMessage('모임이 성공적으로 해체되었습니다.')
      setAlertType('success')
      setIsAlertOpen(true)
    } catch (error) {
      console.error('모임 해체 실패:', error)
      setAlertMessage('모임 해체 중 오류가 발생했습니다.')
      setAlertType('error')
      setIsAlertOpen(true)
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
        groupDescription: groupDescription,
      }

      console.log('모임 수정 요청:', {
        url,
        method: 'PATCH',
        headers,
        requestBody,
        groupId,
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
        setAlertMessage(errorMessage)
        setAlertType('error')
        setIsAlertOpen(true)
        return
      }

      const result = await response.json()
      console.log('모임 수정 성공 응답:', result)

      setAlertMessage('모임 정보가 성공적으로 수정되었습니다.')
      setAlertType('success')
      setIsAlertOpen(true)

      // 그룹 정보 새로고침
      fetchGroupInfo()
    } catch (error) {
      console.error('모임 수정 실패:', error)
      setAlertMessage('모임 수정 중 오류가 발생했습니다.')
      setAlertType('error')
      setIsAlertOpen(true)
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
    <div className="w-full bg-white">
      {/* 그룹명 헤더 */}
      <div className="flex items-center justify-between bg-[#f5f5f5] px-4 py-2">
        <div className="font-jalnan text-lg text-gray-600">{groupName}</div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {/* 모임 추가 신청 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="font-jalnan mb-3 text-lg font-bold text-black">
            모임 추가 신청
          </div>

          {loading && (
            <div className="text-center text-sm text-gray-500">로딩 중...</div>
          )}

          {error && (
            <div className="text-center text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && pendingRequests.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="font-nanum-square-round-eb text-sm font-medium text-gray-700">
                  {pendingRequests[0].name}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleAcceptRequest(pendingRequests[0].groupAddRequestId)
                  }
                  disabled={loading}
                  className="font-jalnan rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold text-white disabled:bg-gray-300"
                >
                  수락
                </button>
                <button
                  onClick={() =>
                    handleRejectRequest(pendingRequests[0].groupAddRequestId)
                  }
                  disabled={loading}
                  className="font-jalnan rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white disabled:bg-gray-300"
                >
                  거절
                </button>
              </div>
            </div>
          )}

          {!loading && !error && pendingRequests.length === 0 && (
            <div className="text-center text-sm text-gray-500">
              신청이 없습니다
            </div>
          )}
        </div>

        {/* 멤버 관리 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="font-jalnan mb-3 text-lg font-bold text-black">
            멤버 관리
          </div>

          {membersLoading && (
            <div className="text-center text-sm text-gray-500">
              멤버 로딩 중...
            </div>
          )}

          {!membersLoading &&
            groupMembers.filter(member => !member.isLeader).length > 0 && (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="font-nanum-square-round-eb text-sm font-medium text-gray-700">
                    {
                      groupMembers.filter(member => !member.isLeader)[0]
                        ?.customerName
                    }
                  </div>
                </div>
                <button
                  onClick={() => {
                    const member = groupMembers.filter(
                      member => !member.isLeader
                    )[0]
                    if (member)
                      removeMember(member.customerId, member.customerName)
                  }}
                  disabled={loading}
                  className="font-jalnan rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white disabled:bg-gray-300"
                >
                  내보내기
                </button>
              </div>
            )}

          {!membersLoading &&
            groupMembers.filter(member => !member.isLeader).length === 0 && (
              <div className="text-center text-sm text-gray-500">
                내보낼 수 있는 멤버가 없습니다
              </div>
            )}
        </div>

        {/* 모임장 위임 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="font-jalnan mb-3 text-lg font-bold text-black">
            모임장 위임
          </div>
          <div className="font-nanum-square-round-eb mb-3 text-sm text-gray-600">
            위임할 멤버를 선택해주세요.
          </div>

          <div className="mb-3 flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
            <select
              value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}
              disabled={membersLoading}
              className="font-nanum-square-round-eb flex-1 appearance-none border-none bg-transparent text-sm font-medium text-gray-700 outline-none"
            >
              <option value="">
                {membersLoading ? '로딩 중...' : '멤버 선택'}
              </option>
              {!membersLoading &&
                groupMembers.length > 0 &&
                groupMembers
                  .filter(member => !member.isLeader)
                  .map(member => (
                    <option key={member.customerId} value={member.customerName}>
                      {member.customerName}
                    </option>
                  ))}
            </select>
            <svg
              width={20}
              height={20}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <button
            onClick={handleTransferLeadership}
            disabled={loading || !selectedMember}
            className="font-jalnan w-full rounded-lg bg-[#ffc800] py-2 text-sm font-bold text-white disabled:bg-gray-200"
          >
            위임하기
          </button>
        </div>

        {/* 모임 수정 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="font-jalnan mb-3 text-lg font-bold text-black">
            모임 수정
          </div>

          <div className="mb-3">
            <div className="font-nanum-square-round-eb mb-2 text-sm font-medium text-gray-600">
              모임 이름
            </div>
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="font-nanum-square-round-eb w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#ffc800] focus:bg-white"
              placeholder="모임 이름을 입력하세요"
            />
          </div>

          <div className="mb-3">
            <div className="font-nanum-square-round-eb mb-2 text-sm font-medium text-gray-600">
              모임 설명
            </div>
            <textarea
              value={groupDescription}
              onChange={e => setGroupDescription(e.target.value)}
              className="font-nanum-square-round-eb w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-[#ffc800] focus:bg-white"
              placeholder="모임 설명을 입력하세요"
              rows={3}
            />
          </div>

          <button
            onClick={handleUpdateGroup}
            disabled={loading}
            className="font-jalnan w-full rounded-lg bg-[#ffc800] py-2 text-sm font-bold text-white disabled:bg-gray-200"
          >
            수정하기
          </button>
        </div>

        {/* 모임 해체 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="font-jalnan mb-3 text-lg font-bold text-red-500">
            모임 해체
          </div>
          <div className="font-nanum-square-round-eb mb-3 text-sm text-gray-600">
            모임을 해체하면 모든 데이터가 삭제되며 복구할 수 없습니다.
          </div>

          <button
            onClick={handleDisbandGroup}
            disabled={loading}
            className="font-jalnan w-full rounded-lg bg-red-500 py-2 text-sm font-bold text-white disabled:bg-red-300"
          >
            모임 해체하기
          </button>
        </div>
      </div>

      {/* Alert 모달 */}
      <Alert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        message={alertMessage}
        type={alertType}
        onConfirm={() => {
          if (alertType === 'success') {
            if (alertMessage.includes('위임했습니다')) {
              // 모임장 위임 성공 시 그룹 지갑으로 이동
              window.location.href = '/customer/groupWallet'
            } else if (alertMessage.includes('해체되었습니다')) {
              // 모임 해체 성공 시 그룹 지갑으로 이동
              window.location.href = '/customer/groupWallet'
            } else {
              // 기타 성공 시 페이지 새로고침
              window.location.reload()
            }
          }
        }}
      />

      {/* 멤버 내보내기 확인 */}
      <Alert
        isOpen={isRemoveConfirmOpen}
        onClose={() => setIsRemoveConfirmOpen(false)}
        message={`"${memberToRemove?.name}"을/를 내보내시겠습니까?`}
        confirmText="확인"
        cancelText="취소"
        onConfirm={() => {
          setIsRemoveConfirmOpen(false)
          executeRemoveMember()
        }}
        onCancel={() => setIsRemoveConfirmOpen(false)}
      />

      {/* 모임장 위임 확인 */}
      <Alert
        isOpen={isTransferConfirmOpen}
        onClose={() => setIsTransferConfirmOpen(false)}
        message={`"${selectedMember}"에게 모임장을 위임하시겠습니까?`}
        confirmText="확인"
        cancelText="취소"
        onConfirm={() => {
          setIsTransferConfirmOpen(false)
          executeTransferLeadership()
        }}
        onCancel={() => setIsTransferConfirmOpen(false)}
      />

      {/* 모임 해체 확인 */}
      <Alert
        isOpen={isDisbandConfirmOpen}
        onClose={() => setIsDisbandConfirmOpen(false)}
        message="모임을 해체하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="확인"
        cancelText="취소"
        onConfirm={() => {
          setIsDisbandConfirmOpen(false)
          executeDisbandGroup()
        }}
        onCancel={() => setIsDisbandConfirmOpen(false)}
      />
    </div>
  )
}
