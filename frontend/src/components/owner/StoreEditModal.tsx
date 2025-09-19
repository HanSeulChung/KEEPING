'use client'

import { useRef, useState } from 'react'

interface StoreEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    storeName: string
    category: string
    postalCode: string
    baseAddress: string
    description: string
    imageFile?: File | null
  }) => void
  categories?: Array<{ id: string; name: string }>
  initial?: Partial<{
    storeName: string
    category: string
    postalCode: string
    baseAddress: string
    description: string
    imageUrl: string
  }>
  onSearchAddress?: () => void
}

export default function StoreEditModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
  initial = {},
  onSearchAddress,
}: StoreEditModalProps) {
  const [storeName, setStoreName] = useState(initial.storeName ?? '')
  const [category, setCategory] = useState(initial.category ?? '')
  const [postalCode, setPostalCode] = useState(initial.postalCode ?? '')
  const [baseAddress, setBaseAddress] = useState(initial.baseAddress ?? '')
  const [description, setDescription] = useState(initial.description ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initial.imageUrl ?? null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = () => {
    onSave({
      storeName,
      category,
      postalCode,
      baseAddress,
      description,
      imageFile,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-[720px] rounded-lg bg-white shadow-lg">
        {/* 헤더 바 */}
        <div className="flex h-12 w-full items-center justify-between overflow-hidden border-y border-black">
          <div className="flex h-full flex-1 items-center justify-center overflow-hidden border-r border-black">
            <div className="h-3.5 w-2.5 bg-black" />
          </div>
          <div className="flex h-full w-[60%] items-center justify-center">
            <div className="font-['Tenada'] text-base leading-7 font-extrabold text-black">
              KEEPING
            </div>
          </div>
          <div className="flex h-full flex-1 items-center justify-center gap-2 overflow-hidden border-l border-black">
            <button
              onClick={onClose}
              className="h-9 w-20 rounded border border-black text-xs font-bold"
            >
              닫기
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="relative mx-auto h-[860px] w-full max-w-[620px] py-10">
          {/* 타이틀 */}
          <div className="absolute top-[60px] left-1/2 -translate-x-1/2">
            <div className="inline-flex items-center justify-center p-2.5">
              <div className="font-['Tenada'] text-4xl leading-7 font-extrabold text-black">
                매장 정보 수정
              </div>
            </div>
          </div>

          {/* 카드 내용 */}
          <div className="absolute top-[186px] left-1/2 w-96 -translate-x-1/2">
            {/* 이미지 업로드 */}
            <div className="relative h-48 w-96">
              <div className="absolute top-0 left-0 h-48 w-96 overflow-hidden rounded-lg outline outline-offset-[-1px] outline-black/10">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    미리보기 없음
                  </div>
                )}
                <button
                  onClick={handleUploadClick}
                  type="button"
                  className="absolute right-2 bottom-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold outline outline-offset-[-1px] outline-black"
                >
                  이미지 업로드
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* 폼 섹션 */}
            <div className="relative mt-6 h-[456px] w-96">
              {/* 주소 블럭 */}
              <div className="absolute top-0 left-0 inline-flex w-96 flex-col items-start justify-start gap-2.5">
                <div className="relative h-5 w-full">
                  <div className="absolute top-0 left-0 inline-flex items-center justify-center gap-2.5 rounded-lg bg-white px-4 py-2 text-center text-xs font-bold outline outline-offset-[-1px] outline-black">
                    주 소
                  </div>
                </div>
                {/* 우편번호 + 검색 */}
                <div className="relative h-10 w-full">
                  <div className="absolute top-1 left-0 inline-flex h-10 w-[304px] items-center justify-start rounded-l-md bg-white p-2 outline outline-offset-[-1px] outline-gray-300">
                    <input
                      value={postalCode}
                      onChange={e =>
                        setPostalCode(e.target.value.replace(/[^\d-]/g, ''))
                      }
                      placeholder="우편번호"
                      className="w-full text-base text-gray-800 placeholder:text-stone-300 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onSearchAddress}
                    className="absolute top-1 right-0 h-10 w-14 rounded-r-md bg-gray-800 text-sm text-white"
                  >
                    검색
                  </button>
                </div>
                {/* 기본 주소 */}
                <div className="inline-flex h-10 w-96 items-center justify-start rounded-md bg-white p-2 outline outline-offset-[-1px] outline-gray-300">
                  <input
                    value={baseAddress}
                    onChange={e => setBaseAddress(e.target.value)}
                    placeholder="기본 주소"
                    className="w-full text-base text-gray-800 placeholder:text-stone-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* 업체명 / 업종 */}
              <div className="absolute top-[200px] left-0 inline-flex w-96 flex-col items-start justify-start gap-3">
                {/* 업체명 */}
                <div className="relative h-16 w-full">
                  <div className="absolute top-0 left-0 h-5 w-full">
                    <div className="absolute top-[2px] left-0 h-5 w-10 text-xs leading-tight text-gray-500">
                      업체명
                    </div>
                  </div>
                  <div className="absolute top-6 left-0 inline-flex h-10 w-full items-center justify-start rounded-md bg-white p-2 outline outline-offset-[-1px] outline-gray-300">
                    <input
                      value={storeName}
                      onChange={e => setStoreName(e.target.value)}
                      placeholder="업체명 입력"
                      className="w-full text-base text-gray-800 placeholder:text-stone-300 focus:outline-none"
                    />
                  </div>
                </div>
                {/* 업종 */}
                <div className="relative h-16 w-full">
                  <div className="absolute top-0 left-0 h-5 w-full">
                    <div className="absolute top-[2px] left-0 h-5 w-7 text-xs leading-tight text-gray-500">
                      업종
                    </div>
                  </div>
                  <div className="absolute top-6 left-0 inline-flex h-10 w-full items-center justify-between rounded-md p-2 outline outline-offset-[-1px] outline-gray-300">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-transparent text-base text-gray-800 focus:outline-none"
                    >
                      <option value="" disabled>
                        업종 선택
                      </option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 소개 */}
              <div className="absolute top-[360px] left-0 inline-flex w-96 flex-col items-start justify-start gap-3">
                <div className="relative h-5 w-full">
                  <div className="absolute top-0 left-0 inline-flex items-center justify-center gap-2.5 rounded-lg bg-white px-4 py-2 text-center text-xs font-bold outline outline-offset-[-1px] outline-black">
                    가게 소개
                  </div>
                </div>
                <div className="inline-flex h-20 w-96 items-start justify-start rounded-md p-2 outline outline-offset-[-1px] outline-gray-300">
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="가게 소개 입력"
                    className="h-full w-full resize-none text-base text-gray-800 placeholder:text-stone-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 등록하기 */}
            <div className="relative mt-6 h-11 w-full">
              <button
                type="button"
                onClick={handleSubmit}
                className="absolute top-0 left-0 inline-flex w-96 items-center justify-between rounded bg-gray-800 px-3 py-2.5 text-sm font-bold text-white"
              >
                수정하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
