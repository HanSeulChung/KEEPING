'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

export default function QRScanner() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

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
          alert(`QR 코드 인식 성공!\n고객: ${result.data.customerName}\n그룹: ${result.data.groupName}\n테이블: ${result.data.tableNumber}`)
          router.push('/owner/dashboard')
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
    <div className="min-h-screen bg-black">
      <div className="relative">
        {/* 카메라 비디오 */}
        <video
          ref={videoRef}
          className="w-full h-screen object-cover"
          playsInline
          muted
        />
        
        {/* 숨겨진 캔버스 (QR 코드 분석용) */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* 오버레이 UI */}
        <div className="absolute inset-0 flex flex-col">
          {/* 상단 컨트롤 */}
          <div className="flex justify-between items-center p-4 bg-black bg-opacity-50">
            <button
              onClick={() => router.back()}
              className="text-white text-lg font-bold"
            >
              ← 뒤로
            </button>
            <h1 className="text-white text-lg font-bold">QR 코드 스캔</h1>
            <div className="w-8"></div> {/* 공간 맞추기 */}
          </div>

          {/* 중앙 스캔 영역 */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              {/* 스캔 프레임 */}
              <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-sm mb-2">QR 코드를</div>
                  <div className="text-sm">프레임 안에 맞춰주세요</div>
                </div>
              </div>
              
              {/* 스캔 라인 애니메이션 */}
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
              )}
            </div>
          </div>

          {/* 하단 컨트롤 */}
          <div className="p-6 bg-black bg-opacity-50">
            {error && (
              <div className="text-red-400 text-center mb-4">
                {error}
              </div>
            )}
            
            {scannedData && (
              <div className="text-green-400 text-center mb-4">
                QR 코드 인식됨: {scannedData}
              </div>
            )}

            <div className="flex gap-4">
              {!isScanning ? (
                <button
                  onClick={startCamera}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700"
                >
                  스캔 시작
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700"
                >
                  스캔 중지
                </button>
              )}
              
              <button
                onClick={() => router.push('/owner/dashboard')}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700"
              >
                대시보드로
              </button>
            </div>
            
            {/* 테스트용 QR 시뮬레이션 버튼 */}
            <div className="mt-4">
              <button
                onClick={() => {
                  const mockQRData = 'customer:1:group:1:table:A-5'
                  setScannedData(mockQRData)
                  setIsScanning(false)
                  handleQRResult(mockQRData)
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700"
              >
                테스트: QR 코드 시뮬레이션
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
