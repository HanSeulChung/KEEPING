'use client'

import { apiConfig } from '@/api/config'
import jsQR from 'jsqr'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function QRScanner() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // 주문 모달 상태
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [menus, setMenus] = useState<
    Array<{ id: string; name: string; price: number }>
  >([])
  const [isLoadingMenus, setIsLoadingMenus] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // QR 코드 스캔 함수
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // 비디오가 아직 로드되지 않았으면 스킵
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.log('비디오 로딩 중...', video.readyState)
      return
    }

    // 비디오 프레임을 캔버스에 그리기
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    console.log('스캔 시도 - 비디오 크기:', video.videoWidth, 'x', video.videoHeight)
    console.log('캔버스 크기:', canvas.width, 'x', canvas.height)

    // 이미지 데이터 가져오기
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // jsQR을 사용하여 QR 코드 스캔
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    })

    if (code) {
      console.log('QR 코드 스캔 성공:', code.data)
      setScannedData(code.data)
      setIsScanning(false)
      handleQRResult(code.data)
    } else {
      // 스캔 실패 시에도 로그 (너무 많이 출력되지 않도록 제한)
      if (Math.random() < 0.01) { // 1% 확률로만 로그 출력
        console.log('QR 코드 스캔 시도 중... (감지되지 않음)')
      }
    }
  }


  // QR 코드 결과 처리
  const handleQRResult = (data: string) => {
    // 스캔 정지 및 모달 오픈
    setIsScanning(false)
    setScannedData(data)
    setIsOrderModalOpen(true)
  }

  const loadMenus = async () => {
    if (!storeId) {
      alert('storeId를 입력하세요.')
      return
    }
    try {
      setIsLoadingMenus(true)
      const url = `${apiConfig.baseURL.replace(/\/$/, '')}/stores/${encodeURIComponent(storeId)}/menus`
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
      })
      if (!res.ok) throw new Error('메뉴를 불러오지 못했습니다.')
      const data = await res.json()
      // 백엔드 스키마에 따라 매핑 필요할 수 있음
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []
      const mapped = list.map((m: any) => ({
        id: String(m.id ?? m.menuId),
        name: m.name,
        price: Number(m.price ?? 0),
      }))
      setMenus(mapped)
    } catch (e) {
      console.error(e)
      alert('메뉴 조회 실패')
    } finally {
      setIsLoadingMenus(false)
    }
  }

  const increaseQty = (menuId: string) =>
    setQuantities(prev => ({ ...prev, [menuId]: (prev[menuId] ?? 0) + 1 }))
  const decreaseQty = (menuId: string) =>
    setQuantities(prev => {
      const next = (prev[menuId] ?? 0) - 1
      return { ...prev, [menuId]: Math.max(0, next) }
    })

  const selectedItems = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([menuId, q]) => ({ menuId, quantity: q })),
    [quantities]
  )

  const submitOrder = async () => {
    if (!scannedData) return
    if (!storeId) {
      alert('storeId를 입력하세요.')
      return
    }
    if (selectedItems.length === 0) {
      alert('메뉴와 수량을 선택하세요.')
      return
    }
    try {
      setIsSubmitting(true)
      const idempotencyKey = crypto.randomUUID()
      const url = `${apiConfig.baseURL.replace(/\/$/, '')}/cpqr/${encodeURIComponent(scannedData)}/initiate`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
        'X-Store-Id': storeId,
        'X-Orders-Item': JSON.stringify(selectedItems),
      }
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`

      const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || '요청 실패')
      }
      alert('주문이 시작되었습니다.')
      setIsOrderModalOpen(false)
      router.push('/owner/dashboard')
    } catch (e) {
      console.error(e)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 카메라 시작
  const startCamera = async () => {
    try {
      console.log('QRScanner - 카메라 시작 시도')
      setError(null)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라 우선
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, max: 60 },
        },
      })
      
      console.log('QRScanner - 카메라 권한 획득 성공')

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
        setIsScanning(true)
        
        console.log('QRScanner - 비디오 스트림 설정 완료, 스캔 시작')

        // 스캔 시작 (200ms 간격으로 스캔)
        scanIntervalRef.current = setInterval(() => {
          if (isScanning) {
            scanQRCode()
          }
        }, 200)
      }
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
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
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

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])


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
                  QR 코드 인식됨: {scannedData}
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
      {/* 주문 모달 */}
      {isOrderModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">주문 생성</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsOrderModalOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  QR 토큰
                </label>
                <div className="truncate rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  {scannedData}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">
                  Store ID
                </label>
                <div className="flex gap-2">
                  <input
                    value={storeId}
                    onChange={e => setStoreId(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-3 py-2"
                    placeholder="예: 123"
                  />
                  <button
                    onClick={loadMenus}
                    disabled={isLoadingMenus || !storeId}
                    className="rounded bg-gray-800 px-3 py-2 text-white disabled:opacity-50"
                  >
                    {isLoadingMenus ? '불러오는 중' : '메뉴 불러오기'}
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-auto rounded border border-gray-200">
                {menus.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    메뉴가 없습니다. 상단에서 스토어 메뉴를 불러오세요.
                  </div>
                ) : (
                  <ul>
                    {menus.map(m => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between border-b border-gray-100 px-3 py-2 last:border-b-0"
                      >
                        <div>
                          <div className="text-sm font-medium">{m.name}</div>
                          <div className="text-xs text-gray-500">
                            {m.price.toLocaleString()}원
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQty(m.id)}
                            className="h-7 w-7 rounded border border-gray-300"
                          >
                            -
                          </button>
                          <div className="w-6 text-center text-sm">
                            {quantities[m.id] ?? 0}
                          </div>
                          <button
                            onClick={() => increaseQty(m.id)}
                            className="h-7 w-7 rounded border border-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  선택 수: {selectedItems.reduce((a, b) => a + b.quantity, 0)}
                </span>
                <span>메뉴 수: {menus.length}</span>
              </div>
              <button
                onClick={submitOrder}
                disabled={
                  isSubmitting || selectedItems.length === 0 || !storeId
                }
                className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
              >
                {isSubmitting ? '요청 중...' : '완료'}
              </button>
            </div>
          </div>
        </div>
      )}

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
