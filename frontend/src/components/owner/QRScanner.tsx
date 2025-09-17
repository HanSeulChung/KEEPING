'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import PersonalCardPaymentModal from './PersonalCardPaymentModal'

export default function QRScanner() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<{name: string, groupName?: string} | null>(null)

  // 인증 상태 확인
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/owner/login')
      return
    }
  }, [isLoggedIn, router])

  // QR 코드 스캔 함수
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // 비디오 프레임을 캔버스에 그리기
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // 이미지 데이터 가져오기
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // 간단한 QR 코드 패턴 감지 시뮬레이션
    // 실제로는 jsQR 라이브러리를 사용해야 하지만, 여기서는 시뮬레이션
    const hasQRPattern = detectQRPattern(imageData)
    
    if (hasQRPattern) {
      const mockQRData = 'customer:1:group:1:table:A-5'
      setScannedData(mockQRData)
      setIsScanning(false)
      handleQRResult(mockQRData)
    }
  }

  // 간단한 QR 패턴 감지 함수 (시뮬레이션)
  const detectQRPattern = (imageData: ImageData): boolean => {
    // 실제 QR 코드는 특정 패턴을 가지므로, 여기서는 랜덤 시뮬레이션
    // 실제 구현에서는 jsQR 라이브러리의 qrcode.decode() 함수를 사용
    return Math.random() > 0.995 // 0.5% 확률로 감지 (더 현실적으로)
  }

  // QR 코드 결과 처리
  const handleQRResult = async (data: string) => {
    try {
      // QR 데이터 파싱 (예: customer:1:group:1:table:A-5)
      const parts = data.split(':')
      if (parts.length >= 6) {
        const customerId = parts[1]
        const groupId = parts[3]
        const tableNumber = parts[5]

        // API 호출
        const response = await fetch('/api/owners/scan-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrCode: data,
            customerId,
            groupId,
            tableNumber
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setCustomerInfo({
            name: result.data.customerName,
            groupName: result.data.groupName
          })
          setIsPaymentModalOpen(true)
        } else {
          alert('QR 코드 인식에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('QR 처리 오류:', error)
      alert('QR 코드 처리 중 오류가 발생했습니다.')
    }
  }

  // 카메라 시작
  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라 우선
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
        setIsScanning(true)
        
        // 스캔 시작 (requestAnimationFrame 사용)
        const scanFrame = () => {
          if (isScanning) {
            scanQRCode()
            requestAnimationFrame(scanFrame)
          }
        }
        requestAnimationFrame(scanFrame)
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err)
      setError('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.')
    }
  }

  // 카메라 중지
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
    setScannedData(null)
  }

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로그인 페이지로 이동 중...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-black font-['Tenada'] text-xl sm:text-2xl lg:text-4xl font-extrabold leading-7 mb-2">
            QR 코드 스캔
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-4">
            고객의 QR 코드를 스캔하여 주문을 받아보세요
          </p>
        </div>

        {/* QR 스캔 영역 */}
        <div className="bg-white border border-black p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-3 sm:px-4 h-[1.375rem] rounded-lg border border-black bg-white text-1 font-['nanumsquare'] text-black text-center text-[10px] sm:text-[11px] font-bold leading-5 whitespace-nowrap mx-auto mb-3 sm:mb-4">
              QR 스캔 영역
            </div>
          </div>
          
          {/* 카메라 비디오 영역 */}
          <div className="relative w-full h-64 sm:h-80 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* 숨겨진 캔버스 (QR 코드 분석용) */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* 스캔 프레임 오버레이 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-white border-dashed rounded-lg flex items-center justify-center bg-black bg-opacity-20">
                <div className="text-white text-center">
                  <div className="text-xs sm:text-sm mb-2 font-['nanumsquare']">QR 코드를</div>
                  <div className="text-xs sm:text-sm font-['nanumsquare']">프레임 안에 맞춰주세요</div>
                </div>
              </div>
              
              {/* 스캔 라인 애니메이션 */}
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
              )}
            </div>
          </div>

          {/* 상태 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs sm:text-sm font-['nanumsquare'] text-center">
                {error}
              </p>
            </div>
          )}
          
          {scannedData && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-xs sm:text-sm font-['nanumsquare'] text-center">
                QR 코드 인식됨: {scannedData}
              </p>
            </div>
          )}
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex gap-3 sm:gap-4">
            {!isScanning ? (
              <button
                onClick={startCamera}
                className="flex-1 flex justify-center items-center py-2 px-3 rounded bg-blue-600 text-white text-center font-['nanumsquare'] text-xs sm:text-sm font-bold leading-6 hover:bg-blue-700 transition-colors"
              >
                스캔 시작
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 flex justify-center items-center py-2 px-3 rounded bg-red-600 text-white text-center font-['nanumsquare'] text-xs sm:text-sm font-bold leading-6 hover:bg-red-700 transition-colors"
              >
                스캔 중지
              </button>
            )}
            
            <button
              onClick={() => router.push('/owner/dashboard')}
              className="flex-1 flex justify-center items-center py-2 px-3 rounded bg-gray-600 text-white text-center font-['nanumsquare'] text-xs sm:text-sm font-bold leading-6 hover:bg-gray-700 transition-colors"
            >
              대시보드로
            </button>
          </div>
          
          {/* 테스트용 QR 시뮬레이션 버튼 */}
          <button
            onClick={() => {
              const mockQRData = 'customer:1:group:1:table:A-5'
              setScannedData(mockQRData)
              setIsScanning(false)
              handleQRResult(mockQRData)
            }}
            className="w-full flex justify-center items-center py-2 px-3 rounded bg-green-600 text-white text-center font-['nanumsquare'] text-xs sm:text-sm font-bold leading-6 hover:bg-green-700 transition-colors"
          >
            테스트: QR 코드 시뮬레이션
          </button>
        </div>

        {/* 하단 안내 */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-500 px-4 font-['nanumsquare']">
            QR 코드 스캔에 문제가 있으시면 고객센터로 문의해주세요
          </p>
        </div>
      </div>

      {/* 개인 카드 결제 모달 */}
      <PersonalCardPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setCustomerInfo(null)
          setScannedData(null)
        }}
        customerInfo={customerInfo || undefined}
      />
    </main>
  )
}
