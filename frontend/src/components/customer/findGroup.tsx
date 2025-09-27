'use client'

import { buildURL } from '@/api/config'
import { Alert } from '@/components/ui/Alert'
import { useEffect, useState } from 'react'

interface Group {
  groupId: number
  groupName: string
  groupDescription: string
  leaderMaskingName: string
}

interface GroupSearchResponse {
  success: boolean
  status: number
  message: string
  data: Group[]
  timestamp: string
}

interface FindGroupProps {
  isOpen: boolean
  onClose: () => void
}

const FindGroup = ({ isOpen, onClose }: FindGroupProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [groupCode, setGroupCode] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joiningGroup, setJoiningGroup] = useState<number | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [selectedGroupForCode, setSelectedGroupForCode] =
    useState<Group | null>(null)
  const [alertMessage, setAlertMessage] = useState('')
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')

  // 코드로 그룹 가입 함수
  const joinGroupByCode = async (code: string, groupId: number) => {
    if (!code.trim()) {
      setAlertMessage('그룹 코드를 입력해주세요.')
      setAlertType('error')
      setIsAlertOpen(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = buildURL(`/groups/${groupId}/entrance`)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const requestBody = { inviteCode: code }

      console.log('코드로 가입 요청 상세:', {
        url,
        method: 'POST',
        headers,
        requestBody,
        groupId,
        code,
      })

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(requestBody),
      })

      console.log(
        '코드로 가입 응답 상태:',
        response.status,
        response.statusText
      )

      if (!response.ok) {
        let errorMessage = `그룹 가입에 실패했습니다. (${response.status})`

        try {
          const errorData = await response.json()
          console.log('코드로 가입 에러 응답:', errorData)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          const errorText = await response.text()
          console.log('코드로 가입 에러 텍스트:', errorText)
          if (errorText) {
            errorMessage = errorText
          }
        }

        console.log('코드로 가입 실패 - 최종 에러 메시지:', errorMessage)
        setAlertMessage(errorMessage)
        setAlertType('error')
        setIsAlertOpen(true)
        return
      }

      const result = await response.json()
      console.log('코드로 가입 성공 응답:', result)

      setAlertMessage('그룹에 성공적으로 가입되었습니다!')
      setAlertType('success')
      setIsAlertOpen(true)
      setGroupCode('')
      setShowCodeInput(false)
      setSelectedGroupForCode(null)
    } catch (error) {
      console.error('그룹 가입 실패:', error)
      setAlertMessage(
        error instanceof Error ? error.message : '그룹 가입에 실패했습니다.'
      )
      setAlertType('error')
      setIsAlertOpen(true)
    } finally {
      setLoading(false)
    }
  }

  // 검색 함수
  const searchGroups = async (groupName: string) => {
    if (!groupName.trim()) {
      setGroups([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const url = buildURL(`/groups?name=${encodeURIComponent(groupName)}`)
      console.log('모임 검색 URL:', url)

      // Authorization 헤더 추가
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

      const data: GroupSearchResponse = await response.json()
      console.log('모임 검색 응답:', data)

      if (data.success) {
        setGroups(data.data || [])
      } else {
        setError(data.message || '모임 검색에 실패했습니다.')
      }
    } catch (error) {
      console.error('모임 검색 실패:', error)
      setError('모임 검색 중 오류가 발생했습니다.')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  // 가입 요청 함수
  const requestJoinGroup = async (groupId: number) => {
    setJoiningGroup(groupId)

    try {
      const url = buildURL(`/groups/${groupId}/add-requests`)
      console.log('가입 요청 URL:', url)

      // Authorization 헤더 추가
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
        method: 'POST',
        headers,
        credentials: 'include',
      })

      console.log('가입 요청 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `가입 요청에 실패했습니다. (${response.status})`

        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
          const errorText = await response.text()
          if (errorText) {
            errorMessage = errorText
          }
        }

        console.error('가입 요청 에러 응답:', errorMessage)
        setAlertMessage(errorMessage)
        setAlertType('error')
        setIsAlertOpen(true)
        return
      }

      const data = await response.json()
      console.log('가입 요청 응답:', data)

      if (data.success) {
        setAlertMessage('가입 요청이 성공적으로 전송되었습니다.')
        setAlertType('success')
        setIsAlertOpen(true)
      } else {
        setAlertMessage(data.message || '가입 요청에 실패했습니다.')
        setAlertType('error')
        setIsAlertOpen(true)
      }
    } catch (error) {
      console.error('가입 요청 실패:', error)
      setAlertMessage('가입 요청 중 오류가 발생했습니다.')
      setAlertType('error')
      setIsAlertOpen(true)
    } finally {
      setJoiningGroup(null)
    }
  }

  // 검색어 변경 시 디바운스 처리 제거 (엔터키로만 검색)
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     if (searchTerm.trim()) {
  //       searchGroups(searchTerm)
  //     } else {
  //       setGroups([])
  //     }
  //   }, 500)

  //   return () => clearTimeout(timeoutId)
  // }, [searchTerm])

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setGroupCode('')
      setGroups([])
      setError(null)
      setHasSearched(false)
      setShowCodeInput(false)
      setSelectedGroupForCode(null)
      setIsAlertOpen(false)
      setAlertMessage('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative h-[622px] w-[412px] rounded-[30px] bg-[#fbf9f5]">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4">
          <div className="font-jalnan text-xl leading-[140%] text-[#ffc800]">
            그룹 검색
          </div>
          <button onClick={onClose}>
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

        {/* 노란색 구분선 */}
        <div className="h-[3px] w-full bg-[#ffc800]" />

        {/* 검색 입력 */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  searchGroups(searchTerm)
                }
              }}
              placeholder="그룹명을 정확하게 입력해주세요"
              className="w-full rounded-[28px] border border-[#fdda60] px-5 py-3 pr-12 text-gray-800 placeholder-[#fdda60] focus:outline-none"
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z"
                  fill="#FDDA60"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        {loading && (
          <div className="px-4 text-center text-gray-500">검색 중...</div>
        )}

        {error && <div className="px-4 text-center text-red-500">{error}</div>}

        {hasSearched && groups.length === 0 && !loading && (
          <div className="px-4 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

        {groups.length > 0 && (
          <div className="px-4">
            {groups.map(group => (
              <div
                key={group.groupId}
                className="mb-4 rounded-[10px] border-2 border-[#fdda60] p-4"
              >
                <div className="font-jalnan mb-3 text-lg text-[#ffc800]">
                  {group.groupName}
                </div>

                <div className="mb-3 text-sm text-gray-500">
                  {group.groupDescription}
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-full border-2 border-[#fdda60] px-2 py-1 text-xs text-[#ffc800]">
                    리더
                  </div>
                  <div className="text-sm text-[#99a1af]">
                    {group.leaderMaskingName}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedGroupForCode(group)
                      setShowCodeInput(true)
                    }}
                    className="font-jalnan flex-1 rounded-[10px] bg-[#fdda60] px-4 py-2 text-white"
                  >
                    코드로 가입
                  </button>
                  <button
                    onClick={() => requestJoinGroup(group.groupId)}
                    disabled={joiningGroup === group.groupId}
                    className="font-jalnan flex-1 rounded-[10px] border-2 border-[#fdda60] px-4 py-2 text-[#ffc800]"
                  >
                    {joiningGroup === group.groupId
                      ? '가입 중...'
                      : '가입 신청'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 코드 입력 모달 */}
        {showCodeInput && selectedGroupForCode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-[240px] w-[320px] rounded-[30px] bg-[#fbf9f5]">
              <div className="flex items-center justify-between p-3">
                <div className="font-jalnan text-lg leading-[140%] text-[#ffc800]">
                  코드로 가입
                </div>
                <button
                  onClick={() => {
                    setShowCodeInput(false)
                    setSelectedGroupForCode(null)
                    setGroupCode('')
                  }}
                >
                  <svg
                    width={32}
                    height={32}
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

              <div className="h-[3px] w-full bg-[#ffc800]" />

              <div className="flex h-full flex-col justify-start px-4 pt-4">
                <div className="mb-2 text-sm text-gray-500">
                  {selectedGroupForCode.groupName}의 그룹 코드를 입력해주세요.
                </div>

                <div className="relative mb-3">
                  <input
                    type="text"
                    value={groupCode}
                    onChange={e => setGroupCode(e.target.value.toUpperCase())}
                    placeholder="코드입력"
                    className="w-full rounded-[28px] border border-[#fdda60] px-4 py-2 text-gray-800 placeholder-[#fdda60] focus:outline-none"
                  />
                </div>

                <button
                  onClick={() =>
                    joinGroupByCode(groupCode, selectedGroupForCode.groupId)
                  }
                  disabled={loading || !groupCode.trim()}
                  className="font-jalnan w-full rounded-[10px] bg-[#fdda60] px-4 py-2 text-white disabled:bg-gray-400"
                >
                  {loading ? '가입 중...' : '가입'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alert 모달 */}
      <Alert
        isOpen={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false)
          // 성공 시에만 페이지 새로고침
          if (
            alertType === 'success' &&
            alertMessage.includes('성공적으로 가입되었습니다')
          ) {
            window.location.reload()
          }
        }}
        onConfirm={() => {
          setIsAlertOpen(false)
          // 성공 시에만 페이지 새로고침
          if (
            alertType === 'success' &&
            alertMessage.includes('성공적으로 가입되었습니다')
          ) {
            window.location.reload()
          }
        }}
        title=""
        message={alertMessage}
        type={alertType}
      />
    </div>
  )
}

export default FindGroup
