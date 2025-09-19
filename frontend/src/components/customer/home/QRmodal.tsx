import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

const XIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

interface QRModalProps {
  cardName?: string
  isOpen?: boolean
  onClose?: () => void
}

const QRModal = ({
  cardName = 'QR',
  isOpen = false,
  onClose,
}: QRModalProps) => {
  const [activeTab, setActiveTab] = useState('결제')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  // QR 코드 생성
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrString =
          'http://payapp.kr/q?v=1&t=1f0944fd-2dcd-6a9b-9378-af2d22653626&m=CPQR'
        const dataUrl = await QRCode.toDataURL(qrString, {
          width: 160,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
        setQrCodeDataUrl(dataUrl)
      } catch (error) {
        console.error('QR 코드 생성 실패:', error)
      }
    }

    if (isOpen) {
      generateQRCode()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* 모달 컨텐츠 */}
      <div className="relative mx-4 w-80 max-w-sm rounded-lg bg-white p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100"
        >
          <XIcon size={20} className="text-gray-500" />
        </button>

        {/* QR 타이틀 */}
        <div className="mb-6 text-center">
          <h2 className="font-display text-xl font-bold">{cardName}</h2>
        </div>

        {/* 설명 텍스트 */}
        <p className="mb-4 text-center text-sm text-gray-600">
          가게 사장님에게 QR 코드 화면을 보여주세요.
        </p>

        <div className="mb-6 flex justify-center gap-2">
          <div className="group relative">
            <button
              onClick={() => setActiveTab('결제')}
              className={`flex h-[31px] items-center gap-2 border border-solid border-black px-3 transition-colors ${
                activeTab === '결제'
                  ? 'bg-[#efefef]'
                  : 'bg-white hover:bg-[#efefef]'
              }`}
            >
              <span className="font-nanum text-xs leading-6 font-normal tracking-[0] text-black">
                결제
              </span>
            </button>
          </div>
          <div className="group relative">
            <button
              onClick={() => setActiveTab('환불')}
              className={`flex h-[31px] items-center gap-2 border border-solid border-black px-3 transition-colors ${
                activeTab === '환불'
                  ? 'bg-[#efefef]'
                  : 'bg-white hover:bg-[#efefef]'
              }`}
            >
              <span className="font-nanum text-xs leading-6 font-normal tracking-[0] text-black">
                환불
              </span>
            </button>
          </div>
        </div>

        {/* QR 코드 */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-lg bg-gray-50 p-4">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                width={160}
                height={160}
                className="bg-white"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center bg-white">
                <div className="text-sm text-gray-500">QR 코드 생성 중...</div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 텍스트 */}
        <div className="text-center">
          <div className="mb-2 h-px bg-gray-400"></div>
          <p className="font-display text-sm font-medium text-gray-800">
            KEEPING
          </p>
        </div>
      </div>
    </div>
  )
}

export default QRModal
