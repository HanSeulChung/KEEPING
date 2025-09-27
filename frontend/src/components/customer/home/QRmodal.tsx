import apiClient from '@/api/axios'
import QRCode from 'qrcode'
import { useRouter } from 'next/navigation'
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
  cardId?: number
  walletId?: number
  storeId?: number
  isOpen?: boolean
  onClose?: () => void
}

const QRModal = ({
  cardName = 'QR',
  cardId,
  walletId,
  storeId,
  isOpen = false,
  onClose,
}: QRModalProps) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('결제')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // QR 코드 생성
  useEffect(() => {
    const generateQRCode = async () => {
      if (!walletId || !storeId) {
        console.error('walletId 또는 storeId가 없습니다')
        setError('필수 정보가 없습니다')
        return
      }

      setIsLoading(true)
      setError(null)
      
      try {
        // /cpqr/new API 호출 (axios 사용으로 자동으로 Authorization 헤더 추가됨)
        const response = await apiClient.post('/cpqr/new', {
          walletId: walletId,
          mode: 'CPQR',
          bindStoreId: storeId,
          ttlSeconds: 60
        })

        console.log('QR 토큰 생성 성공:', response.data)

        if (response.data.success && response.data.data?.qrUri) {
          // 응답의 qrUri를 사용하여 QR 코드 생성
          const dataUrl = await QRCode.toDataURL(response.data.data.qrUri, {
            width: 160,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          })
          setQrCodeDataUrl(dataUrl)
        } else {
          throw new Error('QR URI를 받지 못했습니다')
        }
      } catch (error) {
        console.error('QR 코드 생성 실패:', error)
        setError('QR 코드 생성에 실패했습니다: ' + (error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      generateQRCode()
    }
  }, [isOpen, walletId, storeId])

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
            {error ? (
              <div className="flex h-40 w-40 items-center justify-center bg-white">
                <div className="text-center">
                  <div className="text-sm text-red-500 mb-2">오류 발생</div>
                  <div className="text-xs text-gray-500">{error}</div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex h-40 w-40 items-center justify-center bg-white">
                <div className="text-sm text-gray-500">QR 코드 생성 중...</div>
              </div>
            ) : qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                width={160}
                height={160}
                className="bg-white"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center bg-white">
                <div className="text-sm text-gray-500">QR 코드를 생성할 수 없습니다</div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 텍스트 */}
        <div className="text-center">
          <div className="mb-2 h-px bg-gray-400"></div>
          <button
            onClick={() => router.push('/customer/home')}
            className="font-display text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors cursor-pointer"
          >
            KEEPING
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRModal
