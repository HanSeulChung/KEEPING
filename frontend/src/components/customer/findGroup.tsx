interface FindGroupProps {
  isOpen: boolean
  onClose: () => void
}

const FindGroup = ({ isOpen, onClose }: FindGroupProps) => {
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
                <div className="flex h-7 w-full flex-shrink-0 items-center bg-white p-2 font-['Inter'] leading-6 text-[#ccc]">
                  모임 검색
                </div>
              </div>
              <div className="flex h-[2.5625rem] w-[2.1875rem] flex-col items-center justify-center border-l border-black bg-gray-800">
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
              </div>
            </div>
          </div>

          {/* 그룹 목록 */}
          <div className="w-full">
            <div className="w-full border border-black p-4">
              <div className="flex h-full items-center justify-between">
                <div className="flex flex-col gap-2">
                  {/* 그룹 이름 */}
                  <div className="font-['Tenada'] text-[2rem] leading-8 font-extrabold text-black">
                    A509
                  </div>

                  {/* 별 아이콘과 눈농 */}
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
                      눈농
                    </div>
                  </div>
                </div>

                {/* 그룹 설명 - 가운데 */}
                <div className="flex-1 text-center">
                  <div className="font-['nanumsquare'] text-lg leading-6 text-black">
                    SSAFY 특화 프로젝트 A509 입니다 ~
                  </div>
                </div>

                {/* 가입 요청 버튼 - 오른쪽 가운데 */}
                <div className="flex items-center">
                  <button className="inline-flex items-center justify-center bg-blue-500 px-5 py-1 font-['nanumsquare'] text-[10px] leading-7 font-bold text-white hover:bg-blue-600">
                    가입 요청
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FindGroup
