'use client'

interface ImageUploadModalProps {
  showModal: boolean
  selectedImage: File | null
  isUploading: boolean
  onImageSelect: (file: File | null) => void
  onUpload: () => void
  onClose: () => void
}

const ImageUploadModal = ({
  showModal,
  selectedImage,
  isUploading,
  onImageSelect,
  onUpload,
  onClose,
}: ImageUploadModalProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    console.log('파일 선택됨:', file)

    if (file) {
      // 파일 크기 검증 (10MB = 10485760 bytes)
      const maxFileSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxFileSize) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }

      // 이미지 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
    }

    onImageSelect(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      console.log('파일 드롭됨:', file)

      // 파일 크기 검증 (10MB = 10485760 bytes)
      const maxFileSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxFileSize) {
        alert('파일 크기는 10MB 이하여야 합니다.')
        return
      }

      // 이미지 파일 타입 검증
      if (file.type.startsWith('image/')) {
        onImageSelect(file)
      } else {
        alert('이미지 파일만 업로드 가능합니다.')
      }
    }
  }

  if (!showModal) {
    console.log('ImageUploadModal: showModal이 false입니다')
    return null
  }

  console.log(
    'ImageUploadModal: 렌더링 중, showModal:',
    showModal,
    'selectedImage:',
    selectedImage
  )

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            가게 이미지 업로드
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <label className="mb-4 block text-sm font-medium text-gray-700">
            이미지 파일 선택
          </label>

          {/* 드래그 앤 드롭 영역 */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-200 hover:border-blue-500 hover:from-blue-100 hover:to-blue-200 hover:shadow-md"
            >
              <div className="mb-3 rounded-full bg-blue-500 p-3">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-base font-semibold text-blue-700">
                클릭하거나 파일을 드래그하세요
              </p>
              <p className="mt-2 text-sm text-blue-600">
                PNG, JPG, JPEG 파일만 가능 (최대 10MB)
              </p>
            </label>
          </div>
        </div>

        {selectedImage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-sm font-medium text-green-800">
              선택된 파일: {selectedImage.name}
            </p>
            <p className="mt-1 text-xs text-green-600">
              크기: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            disabled={isUploading}
          >
            취소
          </button>
          <button
            onClick={onUpload}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedImage || isUploading}
          >
            {isUploading ? '업로드 중...' : '업로드'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageUploadModal
