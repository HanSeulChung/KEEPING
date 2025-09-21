'use client'
import { useState } from 'react'

// 타입 정의
interface GroupSettingsProps {
  groupName?: string
  groupDescription?: string
  members?: string[]
  pendingRequests?: Array<{
    id: string
    name: string
  }>
}

// 그룹 설정 컴포넌트
export const GroupSettings = ({
  groupName: initialGroupName = 'A509',
  groupDescription: initialGroupDescription = 'A509',
  members = ['혜은', '혜으니', '혜응응'],
  pendingRequests = [{ id: '1', name: '혜은' }],
}: GroupSettingsProps) => {
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [groupName, setGroupName] = useState(initialGroupName)
  const [groupDescription, setGroupDescription] = useState(
    initialGroupDescription
  )

  const handleAcceptRequest = (requestId: string) => {
    // 수락 로직
    console.log('모임 추가 신청 수락:', requestId)
  }

  const handleRejectRequest = (requestId: string) => {
    // 거절 로직
    console.log('모임 추가 신청 거절:', requestId)
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
              {pendingRequests.length > 0 ? (
                pendingRequests.map(request => (
                  <div key={request.id} className="flex items-center gap-3 p-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                    <div
                      className="flex-1 text-xs font-bold text-black"
                      style={{ fontFamily: 'NanumSquare Neo' }}
                    >
                      {request.name}
                    </div>
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-blue-500 px-2 py-1 text-[10px] font-bold text-white"
                      style={{ fontFamily: 'NanumSquare Neo' }}
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="bg-red-500 px-2 py-1 text-[10px] font-bold text-white"
                      style={{ fontFamily: 'NanumSquare Neo' }}
                    >
                      거절
                    </button>
                  </div>
                ))
              ) : (
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
                className="w-full bg-black py-2 text-[10px] font-bold text-white"
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
                className="w-full bg-black py-2 text-[10px] font-bold text-white"
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
                className="bg-black px-4 py-2 text-[10px] font-bold text-white"
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
