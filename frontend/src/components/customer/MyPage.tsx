'use client'
import { useState } from 'react'

// 마이페이지 컴포넌트
export const MyPage = () => {
  const [isPaymentNotificationOn, setIsPaymentNotificationOn] = useState(true)
  const [isGroupNotificationOn, setIsGroupNotificationOn] = useState(true)
  const [isChargeNotificationOn, setIsChargeNotificationOn] = useState(true)

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
            <div className="mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <div className="h-10 w-10 rounded-full bg-gray-300"></div>
              <div className="absolute text-xl leading-8 font-bold text-blue-500">
                김
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="mb-1 text-xl font-bold text-black">김고객</div>
              <div className="text-sm text-gray-500">010-1234-5678</div>
            </div>
          </div>

          {/* 정보 입력 폼 */}
          <div className="space-y-4">
            {/* 이름 */}
            <div className="flex flex-col">
              <label className="mb-2 text-xs text-gray-500">이름</label>
              <input
                type="text"
                className="h-10 rounded-md border border-gray-300 bg-white p-2 text-black"
                defaultValue="김고객"
              />
            </div>

            {/* 전화번호 */}
            <div className="flex flex-col">
              <label className="mb-2 text-xs text-gray-500">전화번호</label>
              <input
                type="text"
                className="h-10 rounded-md border border-gray-300 bg-white p-2 text-black"
                defaultValue="010-1234-5678"
              />
            </div>

            {/* 이메일 */}
            <div className="flex flex-col">
              <label className="mb-2 text-xs text-gray-500">이메일</label>
              <input
                type="email"
                className="h-10 rounded-md border border-gray-300 bg-black/60 p-2 text-white"
                defaultValue="customer@example.com"
                readOnly
              />
            </div>

            {/* 정보 수정 버튼 */}
            <button className="h-10 w-full rounded-md bg-black text-sm font-medium text-white">
              정보 수정
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
