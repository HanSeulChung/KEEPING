import apiClient from '@/api/axios'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Modal } from '../../ui/Modal'

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
          ttlSeconds: 60,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      title={cardName}
      height="h-[400px]"
      width="w-[320px] md:w-[380px]"
    >
      {/* 설명 텍스트 */}
      <p className="font-nanum-square-round-eb mb-6 text-center text-sm text-gray-600">
        가게 사장님에게 QR 코드 화면을 보여주세요.
      </p>

      {/* QR 코드 */}
      <div className="mb-6 flex justify-center">
        <div className="rounded-lg bg-gray-50 p-3 md:p-4">
          {error ? (
            <div className="flex h-32 w-32 items-center justify-center bg-white md:h-40 md:w-40">
              <div className="text-center">
                <div className="font-nanum-square-round-eb mb-2 text-xs text-red-500 md:text-sm">
                  오류 발생
                </div>
                <div className="font-nanum-square-round-eb text-xs text-gray-500">
                  {error}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex h-32 w-32 items-center justify-center bg-white md:h-40 md:w-40">
              <div className="font-nanum-square-round-eb text-xs text-gray-500 md:text-sm">
                QR 코드 생성 중...
              </div>
            </div>
          ) : qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="QR Code"
              width={128}
              height={128}
              className="bg-white md:h-40 md:w-40"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center bg-white md:h-40 md:w-40">
              <div className="font-nanum-square-round-eb text-xs text-gray-500 md:text-sm">
                QR 코드를 생성할 수 없습니다
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 텍스트 */}
      <div className="text-center">
        <div className="mb-2 h-px bg-gray-400"></div>
        <p className="font-jalnan text-sm font-medium text-gray-800">KEEPING</p>
      </div>
    </Modal>
  )
}

export default QRModal
