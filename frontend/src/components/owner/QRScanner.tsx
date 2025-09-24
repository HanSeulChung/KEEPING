'use client'

import { replaceQRDomain } from '@/api/config'
import { useRouter } from 'next/navigation'
import QrScanner from 'qr-scanner'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function QRScanner() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrScannerRef = useRef<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  const accessToken = useMemo(
    () =>
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null,
    []
  )

  // 인증 상태 확인 - 더 관대한 방식
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        try {
          // localStorage에서 모든 키 확인
          const allKeys = Object.keys(localStorage)
          console.log('QRScanner - localStorage 모든 키:', allKeys)
          
          const accessToken = localStorage.getItem('accessToken')
          const user = localStorage.getItem('user')
          const authStorage = localStorage.getItem('auth-storage')
          
          console.log('QRScanner - 인증 데이터 확인:', {
            accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
            user: user ? JSON.parse(user) : 'null',
            authStorage: authStorage ? '존재' : 'null',
            allKeys
          })
          
          // accessToken이 있으면 인증 성공으로 간주 (user는 선택적)
          if (accessToken) {
            console.log('QRScanner - accessToken 존재, 인증 성공')
            setIsAuthChecked(true)
            // 인증 성공 후 자동으로 카메라 시작 (핸드폰에서 바로 시작)
            setTimeout(() => {
              console.log('QRScanner - 카메라 자동 시작')
              startCamera()
            }, 500)
      return
    }
          
          // auth-storage에서도 확인
          if (authStorage) {
            try {
              const authData = JSON.parse(authStorage)
              if (authData.state?.isLoggedIn) {
                console.log('QRScanner - auth-storage에서 인증 확인')
                setIsAuthChecked(true)
                // 인증 성공 후 자동으로 카메라 시작 (핸드폰에서 바로 시작)
                setTimeout(() => {
                  console.log('QRScanner - 카메라 자동 시작')
                  startCamera()
                }, 500)
                return
              }
            } catch (e) {
              console.log('QRScanner - auth-storage 파싱 실패')
            }
          }
          
          console.log('QRScanner - 모든 인증 방법 실패, 로그인 페이지로 이동')
          router.push('/owner/login')
        } catch (error) {
          console.error('QRScanner - 인증 확인 오류:', error)
          router.push('/owner/login')
        }
      }
    }

    // 100ms 지연 후 실행
    const timeoutId = setTimeout(checkAuth, 100)
    
    return () => clearTimeout(timeoutId)
  }, [router])

  // QR 코드 스캔 시작
  const startQRScanning = () => {
    if (!videoRef.current) return

    try {
      console.log('QrScanner 인스턴스 생성 시작')
      
      // QrScanner 인스턴스 생성
      const qrScanner = new QrScanner(
        videoRef.current,
        (result: any) => {
          console.log('QR 코드 스캔 성공:', result.data)
          setScannedData(result.data)
          setIsScanning(false)
          handleQRResult(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // 후면 카메라 우선
          maxScansPerSecond: 5, // 스캔 빈도 제한
        }
      )

      qrScannerRef.current = qrScanner
      
      console.log('QrScanner 인스턴스 생성 완료, 스캔 시작')
      
      // 스캔 시작
      qrScanner.start().then(() => {
        console.log('QR 스캔 시작됨')
        setIsScanning(true)
      }).catch((err: any) => {
        console.error('QR 스캔 시작 실패:', err)
        setError('QR 스캔을 시작할 수 없습니다: ' + err.message)
      })
    } catch (err: any) {
      console.error('QrScanner 생성 실패:', err)
      setError('QR 스캐너를 초기화할 수 없습니다: ' + err.message)
    }
  }



  // 현재 페이지 URL에서 storeId 가져오기
  const getCurrentStoreId = () => {
    try {
      if (typeof window !== 'undefined') {
        console.log('=== getCurrentStoreId 디버깅 ===')
        console.log('현재 페이지 URL:', window.location.href)
        console.log('URL 파라미터:', window.location.search)
        
        const urlParams = new URLSearchParams(window.location.search)
        const storeId = urlParams.get('storeId')
        const accountName = urlParams.get('accountName')
        
        console.log('추출된 storeId:', storeId)
        console.log('추출된 accountName:', accountName)
        console.log('모든 URL 파라미터:', Object.fromEntries(urlParams.entries()))
        
        if (storeId) {
          console.log('storeId 발견:', storeId)
          return storeId
        } else {
          console.log('storeId 없음, 기본값 1 반환')
          return '1' // storeId가 없으면 기본값
        }
      }
    } catch (e) {
      console.error('URL 파라미터 파싱 실패:', e)
    }
    console.log('window undefined, 기본값 1 반환')
    return '1' // 기본값
  }

  // QR 코드 결과 처리
  const handleQRResult = (data: string) => {
    // 스캔 정지
    setIsScanning(false)
    setScannedData(data)
    
    console.log('QR 코드 데이터:', data)
    console.log('QR 코드 데이터 타입:', typeof data)
    console.log('QR 코드 데이터 길이:', data.length)
    console.log('QR 코드 데이터 첫 50자:', data.substring(0, 50))
    
    // QR 코드에서 파라미터 추출
    let qrParams = ''
    
    try {
      // HTTP URL인 경우 도메인을 현재 환경의 baseURL로 교체
      let processedData = data
      if (data.includes('http')) {
        processedData = replaceQRDomain(data)
        console.log('원본 QR URI:', data)
        console.log('처리된 QR URI:', processedData)
      }

      // payapp://q? 형태인 경우 파라미터 부분만 추출
      if (processedData.includes('payapp://q?')) {
        qrParams = processedData.replace('payapp://q?', '')
        console.log('payapp URL에서 파라미터 추출:', qrParams)
      } else if (processedData.includes('http')) {
        // 일반 URL 형태인 경우 파싱 시도
        const url = new URL(processedData)
        console.log('URL 파싱 성공:', url.href)
        console.log('URL search params:', url.searchParams.toString())
        
        // payapp 뒤의 파라미터 추출
        const pathParts = url.pathname.split('/')
        const payappIndex = pathParts.findIndex(part => part === 'payapp')
        if (payappIndex !== -1 && payappIndex < pathParts.length - 1) {
          qrParams = pathParts[payappIndex + 1]
        } else {
          // payapp이 path에 없는 경우 search params 사용
          qrParams = url.searchParams.toString()
        }
        console.log('추출된 QR 파라미터:', qrParams)
      } else {
        // URL이 아닌 경우 원본 데이터 사용
        qrParams = processedData
      }
    } catch (e) {
      // URL 파싱 실패 시 원본 데이터 사용
      console.log('URL 파싱 실패, 원본 데이터 사용:', data)
      qrParams = data
    }
    
    // 현재 페이지 URL에서 storeId 가져오기
    const currentStoreId = getCurrentStoreId()
    
    // 새로운 페이지로 리다이렉트 (QR 파라미터 + storeId)
    const intentUrl = `/owner/qr/intent?${qrParams}&storeId=${currentStoreId}`
    console.log('리다이렉트 URL:', intentUrl)
    router.push(intentUrl)
  }




  // 카메라 시작
  const startCamera = async () => {
    try {
      console.log('QRScanner - 카메라 시작 시도')
      setError(null)
      
      // QrScanner가 자체적으로 카메라를 관리
      startQRScanning()
      
    } catch (err: any) {
      console.error('카메라 접근 오류:', err)
      
      let errorMessage = '카메라에 접근할 수 없습니다.'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = '이 브라우저는 카메라를 지원하지 않습니다. Chrome, Firefox, Safari를 사용해주세요.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = '카메라가 다른 애플리케이션에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.'
      }
      
      setError(errorMessage)
    }
  }

  // 카메라 중지
  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
    setScannedData(null)
  }

  // 수동 입력 처리
  const handleManualInput = () => {
    if (manualInput.trim()) {
      setScannedData(manualInput.trim())
      setShowManualInput(false)
      setManualInput('')
    }
  }

  // 컴포넌트 언마운트 시 QrScanner 정리
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop()
        qrScannerRef.current.destroy()
        qrScannerRef.current = null
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])


  // 인증이 완료되지 않았으면 로딩 표시
  if (!isAuthChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="mb-4 text-lg">인증 확인 중...</div>
          <div className="text-sm text-gray-300">잠시만 기다려주세요</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-black">
        <div className="relative">
          {/* 카메라 비디오 */}
          <video
            ref={videoRef}
            className="h-screen w-full object-cover"
            playsInline
            muted
            autoPlay
            webkit-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
          />

          {/* 숨겨진 캔버스 (QR 코드 분석용) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* 오버레이 UI */}
          <div className="absolute inset-0 flex flex-col">
            {/* 상단 컨트롤 */}
            <div className="bg-opacity-50 flex items-center justify-between bg-black p-4">
              <button
                onClick={() => router.back()}
                className="text-lg font-bold text-white"
              >
                ← 뒤로
              </button>
              <h1 className="text-lg font-bold text-white">QR 코드 스캔</h1>
              <div className="w-8"></div> {/* 공간 맞추기 */}
            </div>

            {/* 중앙 스캔 영역 */}
            <div className="flex flex-1 items-center justify-center">
              <div className="relative">
                {/* 스캔 프레임 */}
                <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-white">
                  <div className="text-center text-white">
                    <div className="mb-2 text-sm">QR 코드를</div>
                    <div className="text-sm">프레임 안에 맞춰주세요</div>
                  </div>
                </div>

                {/* 스캔 라인 애니메이션 */}
                {isScanning && (
                  <div className="absolute top-0 left-0 h-1 w-full animate-pulse bg-green-500"></div>
                )}
              </div>
            </div>

            {/* 하단 컨트롤 */}
            <div className="bg-opacity-50 bg-black p-6">
              {error && (
                <div className="mb-4 rounded-lg bg-red-900/50 p-4 text-center text-red-300">
                  <div className="mb-2 font-bold">{error}</div>
                  <div className="text-sm text-red-200">
                    {error.includes('카메라를 찾을 수 없습니다') && (
                      <>
                        데스크톱 환경에서는 카메라가 없을 수 있습니다.<br />
                        모바일 기기에서 접속하거나 외부 카메라를 연결해주세요.
                      </>
                    )}
                    {error.includes('권한이 거부되었습니다') && (
                      <>
                        브라우저 주소창 옆의 카메라 아이콘을 클릭하여<br />
                        카메라 권한을 허용해주세요.
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setError(null)
                      startCamera()
                    }}
                    className="mt-2 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {scannedData && (
                <div className="mb-4 text-center text-green-400">
                  <div className="mb-1 text-sm font-medium">QR 코드 인식됨:</div>
                  <div className="break-all text-xs text-green-300">
                    {scannedData}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                {isScanning && (
                  <button
                    onClick={stopCamera}
                    className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
                  >
                    스캔 중지
                  </button>
                )}

                <button
                  onClick={() => setShowManualInput(true)}
                  className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  수동 입력
                </button>

                <button
                  onClick={() => {
                    // 테스트용 QR 코드 데이터
                    const testData = 'https://example.com/store/123'
                    setScannedData(testData)
                    handleQRResult(testData)
                  }}
                  className="flex-1 rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white hover:bg-yellow-700"
                >
                  테스트 QR
                </button>

                <button
                  onClick={() => router.push('/owner/dashboard')}
                  className="flex-1 rounded-lg bg-gray-600 px-6 py-3 font-medium text-white hover:bg-gray-700"
                >
                  대시보드로
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 수동 입력 모달 */}
      {showManualInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">수동으로 QR 코드 입력</h3>
            <p className="mb-4 text-sm text-gray-600">
              QR 코드를 스캔할 수 없는 경우, QR 코드의 내용을 직접 입력해주세요.
            </p>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="QR 코드 내용을 입력하세요"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleManualInput}
                disabled={!manualInput.trim()}
                className="flex-1 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-700"
              >
                확인
              </button>
              <button
                onClick={() => {
                  setShowManualInput(false)
                  setManualInput('')
                }}
                className="flex-1 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
