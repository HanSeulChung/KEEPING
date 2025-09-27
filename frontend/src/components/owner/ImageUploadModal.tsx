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
    onImageSelect(file)
  }

  if (!showModal) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-bold">이미지 업로드</h3>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 w-full"
        />

        {selectedImage && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              선택된 파일: {selectedImage.name}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
            disabled={isUploading}
          >
            취소
          </button>
          <button
            onClick={onUpload}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
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
