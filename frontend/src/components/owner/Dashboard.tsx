'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StoreRegisterModal from './StoreRegisterModal'

interface Store {
  id: string
  name: string
}

interface OwnerHomeProps {
  currentStore?: Store
  stores?: Store[]
  unreadCount?: number
}

export default function OwnerHome({
  currentStore,
  stores: initialStores,
  unreadCount: initialUnreadCount,
}: OwnerHomeProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>(
    initialStores || [
      { id: '1', name: '서울 초밥' },
      { id: '2', name: '일식비\n마곡점' },
    ]
  )
  const [unreadCount, setUnreadCount] = useState<number>(
    initialUnreadCount || 3
  )
  const [loading, setLoading] = useState(false)
  const [isStoreRegisterModalOpen, setIsStoreRegisterModalOpen] = useState(false)

  // currentStore가 있으면 그것을 선택, 없으면 첫 번째 매장 선택
  useEffect(() => {
    if (currentStore) {
      setSelected(currentStore)
    } else if (stores.length > 0 && !selected) {
      setSelected(stores[0])
    }
  }, [currentStore, stores, selected])

  // 가게 선택 시 해당 가게의 대시보드로 이동
  const handleStoreSelect = (store: Store) => {
    setSelected(store)
    // URL에 가게 정보를 포함하여 각 페이지로 이동할 수 있도록 설정
    // accountName을 사용하여 URL 구성
    const accountName = store.name.replace(/\s+/g, '').toLowerCase()
    router.push(`/owner/dashboard?storeId=${store.id}&accountName=${accountName}`)
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">로딩 중...</div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-[626px] px-4 py-8">
        <div className="top-8 mb-6 flex justify-center sm:mb-8">
          <div className="flex h-[97px] w-[347px] items-start justify-center gap-1 pl-px">
            {stores.map((s, index) => (
              <button
                key={s.id}
                onClick={() => handleStoreSelect(s)}
                className={[
                  'flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center rounded-full border border-black text-center cursor-pointer transition-colors',
                  selected?.id === s.id
                    ? 'bg-black text-white'
                    : 'bg-keeping-beige text-black hover:bg-gray-100',
                ].join(' ')}
              >
                <div className="px-2 text-[17px] leading-6 font-extrabold whitespace-pre-line">
                  {s.name}
                </div>
              </button>
            ))}

            {/* 매장 추가 버튼 */}
            <button 
              onClick={() => setIsStoreRegisterModalOpen(true)}
              className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border border-black bg-keeping-beige hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg
                width={21}
                height={20}
                viewBox="0 0 21 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.6647 9.99805H16.3314"
                  stroke="black"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.498 4.16504V15.8317"
                  stroke="black"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex w-full flex-col items-center justify-between">
          <div className="h-[551px] self-stretch">
            {/* 페이지 타이틀 */}
            <div className="font-display mb-6 flex h-[50px] w-[207px] flex-shrink-0 flex-col justify-center text-4xl leading-7 font-extrabold text-black">
              {selected?.name?.replace('\\n', ' ') || '매장을 선택해주세요'}
            </div>

            {/* 두 열 레이아웃 */}
            <div className="grid w-full max-w-[620px] grid-cols-2 gap-6">
              {/* 1열: 매출 캘린더 + QR 인식하기 (세로 스택) */}
              <div className="flex h-full flex-col gap-6">
                {/* 매출 캘린더 */}
                <Link 
                  href={`/owner/calendar?storeId=${selected?.id}&accountName=${selected?.name?.replace(/\s+/g, '').toLowerCase()}`}
                  className="bg-keeping-beige flex flex-1 flex-col items-start border border-black p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="mb-4 flex h-[68px] w-[127px] flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                    매출
                    <br />
                    캘린더 &gt;
                  </div>
                  <div className="flex flex-1 flex-col justify-center text-[17px] leading-7 text-black">
                    전체 선결제 금액
                    <br />
                    이번 달 선결제 금액
                  </div>
                </Link>

                {/* QR 인식하기 */}
                <Link 
                  href={`/owner/scan?storeId=${selected?.id}&accountName=${selected?.name?.replace(/\s+/g, '').toLowerCase()}`}
                  className="flex flex-1 flex-col items-start border border-black bg-white p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="mb-4 flex h-[68px] w-[162px] flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                    QR 인식하기
                  </div>
                </Link>
              </div>

              {/* 2열: 나머지 3개 (세로 스택) */}
              <div className="flex h-full flex-col gap-6">
                {/* 매장 관리 */}
                <Link 
                  href={`/owner/manage?storeId=${selected?.id}&accountName=${selected?.name?.replace(/\s+/g, '').toLowerCase()}`}
                  className="relative flex flex-1 flex-col items-start border border-black bg-white p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex h-[68px] w-[127px] flex-shrink-0 flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                    매장 관리
                  </div>
                </Link>

                {/* 설정 */}
                <div className="bg-keeping-beige relative flex flex-1 flex-col items-start border border-black p-4">
                  <div className="flex h-[68px] w-[127px] flex-shrink-0 flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                    설정
                  </div>
                </div>

                {/* 알림 */}
                <Link 
                  href={`/owner/notification?storeId=${selected?.id}&accountName=${selected?.name?.replace(/\s+/g, '').toLowerCase()}`}
                  className="relative flex flex-1 flex-col items-start border border-black bg-white p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex h-[68px] w-[127px] flex-shrink-0 flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                      알림
                    </div>
                    <svg
                      width={18}
                      height={19}
                      viewBox="0 0 18 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.55664 16.8867C7.70293 17.1401 7.91332 17.3504 8.16668 17.4967C8.42003 17.643 8.70743 17.72 8.99997 17.72C9.29252 17.72 9.57991 17.643 9.83327 17.4967C10.0866 17.3504 10.297 17.1401 10.4433 16.8867"
                        stroke="black"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1.71821 12.1587C1.60935 12.278 1.53751 12.4264 1.51143 12.5858C1.48534 12.7452 1.50615 12.9088 1.5713 13.0565C1.63646 13.2043 1.74316 13.33 1.87843 13.4183C2.01369 13.5065 2.1717 13.5536 2.33321 13.5537H15.6665C15.828 13.5538 15.9861 13.5069 16.1214 13.4188C16.2568 13.3307 16.3636 13.2052 16.429 13.0575C16.4943 12.9098 16.5153 12.7463 16.4894 12.5869C16.4635 12.4275 16.3919 12.279 16.2832 12.1595C15.1749 11.017 13.9999 9.80288 13.9999 6.05371C13.9999 4.72763 13.4731 3.45586 12.5354 2.51818C11.5977 1.5805 10.326 1.05371 8.99988 1.05371C7.6738 1.05371 6.40203 1.5805 5.46435 2.51818C4.52666 3.45586 3.99988 4.72763 3.99988 6.05371C3.99988 9.80288 2.82405 11.017 1.71821 12.1587Z"
                        stroke="black"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="mt-2 flex flex-1 flex-col justify-center text-[17px] leading-7 text-black">
                    읽지 않은 알림
                    <br />
                    {unreadCount}건
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* 매장 등록 모달 */}
      <StoreRegisterModal 
        isOpen={isStoreRegisterModalOpen}
        onClose={() => setIsStoreRegisterModalOpen(false)}
      />
    </div>
  )
}
