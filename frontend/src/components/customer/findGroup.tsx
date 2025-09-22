'use client'

import { buildURL } from '@/api/config'
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
  const [activeTab, setActiveTab] = useState<'code' | 'search'>('code')
  const [searchTerm, setSearchTerm] = useState('')
  const [groupCode, setGroupCode] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joiningGroup, setJoiningGroup] = useState<number | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // 코드로 그룹 가입 함수
  const joinGroupByCode = async (code: string) => {
    if (!code.trim()) {
      setError('그룹 코드를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = buildURL('/groups/join')
      
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
        credentials: 'include',
        headers,
        body: JSON.stringify({ groupCode: code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('그룹 가입 성공:', result)
      
      alert('그룹에 성공적으로 가입되었습니다!')
      setGroupCode('')
      onClose()
      
      // 페이지 새로고침 또는 상태 업데이트
      window.location.reload()
      
    } catch (error) {
      console.error('그룹 가입 실패:', error)
      setError(error instanceof Error ? error.message : '그룹 가입에 실패했습니다.')
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
        alert(errorMessage)
        return
      }

      const data = await response.json()
      console.log('가입 요청 응답:', data)

      if (data.success) {
        alert('가입 요청이 성공적으로 전송되었습니다.')
      } else {
        alert(data.message || '가입 요청에 실패했습니다.')
      }
    } catch (error) {
      console.error('가입 요청 실패:', error)
      alert('가입 요청 중 오류가 발생했습니다.')
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
      setActiveTab('code')
      setHasSearched(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black">
      <div className="relative mx-4 my-8 w-full max-w-6xl rounded-lg bg-white p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-500"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* 메인 컨텐츠 */}
        <div className="w-full max-w-5xl">
          {/* 제목 */}
          <div className="mb-4">
            <h1 className="text-left font-['Tenada'] text-[2rem] leading-8 font-extrabold text-black">
              모임 찾기
            </h1>
          </div>

          {/* 탭 네비게이션 */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg border-2 border-b-0 ${
                activeTab === 'code'
                  ? 'bg-white border-blue-500 text-blue-600'
                  : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
              }`}
            >
              코드로 가입
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg border-2 border-b-0 ${
                activeTab === 'search'
                  ? 'bg-white border-blue-500 text-blue-600'
                  : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
              }`}
            >
              모임 검색
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-6">
            {activeTab === 'code' && (
              <div>
                {/* 설명 */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 공유받은 그룹코드를 입력하면 가입신청 없이 즉시 가입됩니다.
                  </p>
                </div>
                
                {/* 코드 입력 */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    그룹 코드
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={groupCode}
                      onChange={e => setGroupCode(e.target.value.toUpperCase())}
                      placeholder="그룹 코드를 입력하세요"
                      className="flex h-10 w-full max-w-md items-center border border-gray-300 rounded-l-md bg-white p-3 font-['Inter'] text-sm text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                     <button
                       onClick={() => joinGroupByCode(groupCode)}
                       disabled={loading || !groupCode.trim()}
                       className="flex h-10 px-3 items-center justify-center rounded-r-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                     >
                       {loading ? '가입중' : '가입'}
                     </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                {/* 설명 */}
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    🔍 정확한 모임 이름을 입력해주세요.
                  </p>
                </div>
                
                {/* 검색바 */}
                <div className="mb-4">
                  <div className="flex items-center">
                    <div className="flex h-[2.5625rem] w-full max-w-[782px] items-center border border-black pt-[0.5625rem] pr-[0.5625rem] pb-1 pl-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            searchGroups(searchTerm)
                          }
                        }}
                        placeholder="모임 검색"
                        className="flex h-7 w-full flex-shrink-0 items-center bg-white p-2 font-['Inter'] leading-6 text-black placeholder:text-[#ccc] focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => searchGroups(searchTerm)}
                      className="flex h-[2.5625rem] w-[2.1875rem] flex-col items-center justify-center border-l border-black bg-gray-800 hover:bg-gray-700"
                    >
                      <svg
                        width={20}
                        height={21}
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.4985 18.1152L13.8818 14.4985"
                          stroke="white"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.16471 16.4486C12.8466 16.4486 15.8314 13.4638 15.8314 9.7819C15.8314 6.1 12.8466 3.11523 9.16471 3.11523C5.48282 3.11523 2.49805 6.1 2.49805 9.7819C2.49805 13.4638 5.48282 16.4486 9.16471 16.4486Z"
                          stroke="white"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 검색 탭에서만 보이는 콘텐츠 */}
          {activeTab === 'search' && (
            <>
              {/* 로딩 상태 */}
              {loading && (
                <div className="w-full border border-black p-4">
                  <div className="flex items-center justify-center">
                    <div className="font-['nanumsquare'] text-lg leading-6 text-gray-500">
                      검색 중...
                    </div>
                  </div>
                </div>
              )}

              {/* 에러 메시지 */}
              {error && (
                <div className="w-full border border-red-500 bg-red-50 p-4">
                  <div className="flex items-center justify-center">
                    <div className="font-['nanumsquare'] text-lg leading-6 text-red-600">
                      {error}
                    </div>
                  </div>
                </div>
              )}

              {/* 그룹 목록 */}
              {!loading && !error && groups.length === 0 && hasSearched && (
                <div className="w-full border border-black p-4">
                  <div className="flex items-center justify-center">
                    <div className="font-['nanumsquare'] text-lg leading-6 text-gray-500">
                      검색 결과가 없습니다.
                    </div>
                  </div>
                </div>
              )}

              {/* 검색된 그룹 목록 */}
              {!loading && !error && groups.length > 0 && (
                <div className="w-full space-y-2">
                  {groups.map(group => (
                    <div
                      key={group.groupId}
                      className="w-full border border-black p-4"
                    >
                      <div className="flex h-full items-center justify-between">
                        <div className="flex flex-col gap-2">
                          {/* 그룹 이름 */}
                          <div className="font-['Tenada'] text-[2rem] leading-8 font-extrabold text-black">
                            {group.groupName}
                          </div>

                          {/* 별 아이콘과 리더명 */}
                          <div className="flex items-center gap-2">
                            <svg
                              width={21}
                              height={13}
                              viewBox="0 0 21 13"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.5 0L13.0622 4.73785L18.5 5.36475L14.75 8.96215L15.6244 14.4352L10.5 11.9243L5.37564 14.4352L6.25 8.96215L2.5 5.36475L7.93782 4.73785L10.5 0Z"
                                fill="#FFD700"
                                stroke="#FFA500"
                                strokeWidth="0.5"
                              />
                            </svg>
                            <span className="font-['nanumsquare'] text-lg leading-6 text-black">
                              {group.leaderMaskingName}
                            </span>
                          </div>

                          {/* 그룹 설명 */}
                          <div className="font-['nanumsquare'] text-lg leading-6 text-gray-500">
                            {group.groupDescription}
                          </div>
                        </div>

                        {/* 가입 요청 버튼 */}
                        <button
                          onClick={() => requestJoinGroup(group.groupId)}
                          disabled={joiningGroup === group.groupId}
                          className="flex h-10 w-24 items-center justify-center border border-black bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <span className="font-['nanumsquare'] text-lg leading-6 text-black">
                            {joiningGroup === group.groupId ? '요청 중...' : '가입 요청'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 코드 탭 에러 메시지 */}
          {activeTab === 'code' && error && (
            <div className="w-full border border-red-500 bg-red-50 p-4">
              <div className="flex items-center justify-center">
                <div className="font-['nanumsquare'] text-lg leading-6 text-red-600">
                  {error}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default FindGroup
