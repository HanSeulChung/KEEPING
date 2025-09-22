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
  const [searchTerm, setSearchTerm] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joiningGroup, setJoiningGroup] = useState<number | null>(null)

  // 검색 함수
  const searchGroups = async (groupName: string) => {
    if (!groupName.trim()) {
      setGroups([])
      return
    }

    setLoading(true)
    setError(null)

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
        const errorText = await response.text()
        console.error('가입 요청 에러 응답:', errorText)
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        )
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

  // 검색어 변경 시 디바운스 처리
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchGroups(searchTerm)
      } else {
        setGroups([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setGroups([])
      setError(null)
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

          {/* 검색바 */}
          <div className="mb-2">
            <div className="flex items-center">
              <div className="flex h-[2.5625rem] w-full max-w-[782px] items-center border border-black pt-[0.5625rem] pr-[0.5625rem] pb-1 pl-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
          {!loading && !error && groups.length === 0 && searchTerm && (
            <div className="w-full border border-black p-4">
              <div className="flex items-center justify-center">
                <div className="font-['nanumsquare'] text-lg leading-6 text-gray-500">
                  검색 결과가 없습니다.
                </div>
              </div>
            </div>
          )}

          {/* 그룹 목록 */}
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
                            d="M4.50031 0.0574706L9.52971 8.03881L0.0297722 8.07416L4.50031 0.0574706Z"
                            fill="#FFF45E"
                          />
                          <path
                            d="M9.99997 0.036963L16.0306 8.26458L5.26801 8.30463L9.99997 0.036963Z"
                            fill="#FFF45E"
                          />
                          <path
                            d="M15.5004 0.0164546L20.0297 7.99965L11.0298 8.03315L15.5004 0.0164546Z"
                            fill="#FFF45E"
                          />
                          <rect
                            x="0.0302734"
                            y="8.07422"
                            width={20}
                            height={4}
                            transform="rotate(-0.213228 0.0302734 8.07422)"
                            fill="#FFF45E"
                          />
                        </svg>
                        <div className="font-['nanumsquare'] text-lg leading-6 text-black">
                          {group.leaderMaskingName}
                        </div>
                      </div>
                    </div>

                    {/* 그룹 설명 - 가운데 */}
                    <div className="flex-1 text-center">
                      <div className="font-['nanumsquare'] text-lg leading-6 text-black">
                        {group.groupDescription}
                      </div>
                    </div>

                    {/* 가입 요청 버튼 - 오른쪽 가운데 */}
                    <div className="flex items-center">
                      <button
                        onClick={() => requestJoinGroup(group.groupId)}
                        disabled={joiningGroup === group.groupId}
                        className="inline-flex items-center justify-center bg-blue-500 px-5 py-1 font-['nanumsquare'] text-[10px] leading-7 font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {joiningGroup === group.groupId
                          ? '요청 중...'
                          : '가입 요청'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FindGroup
