'use client'

import { apiConfig } from '@/api/config'
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

  // 주문 모달 상태
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [menus, setMenus] = useState<Array<{
    menuId: number
    storeId: number
    menuName: string
    categoryId: number
    categoryName: string
    displayOrder: number
    soldOut: boolean
    imgUrl: string
    description: string
  }>>([])
  const [isLoadingMenus, setIsLoadingMenus] = useState(false)
  const [selectedMenus, setSelectedMenus] = useState<Array<{
    menuId: number
    menuName: string
    categoryName: string
    quantity: number
    price: number
  }>>([])
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


  // 메뉴 가져오기
  const fetchMenus = async (storeId: string) => {
    try {
      setIsLoadingMenus(true)
      console.log('메뉴 가져오기 시작, storeId:', storeId)
      console.log('API URL:', `${apiConfig.baseURL}/owners/stores/${storeId}/menus`)
      console.log('Access Token:', accessToken ? '존재' : '없음')
      
      const response = await fetch(`${apiConfig.baseURL}/owners/stores/${storeId}/menus`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include'
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`메뉴 조회 실패: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('메뉴 조회 성공:', result)
      console.log('Result structure:', {
        success: result.success,
        hasData: !!result.data,
        dataType: Array.isArray(result.data) ? 'array' : typeof result.data,
        dataLength: Array.isArray(result.data) ? result.data.length : 'N/A'
      })
      
      if (result.success && result.data && Array.isArray(result.data)) {
        setMenus(result.data)
        console.log('메뉴 설정 완료:', result.data)
      } else {
        console.error('Invalid response structure:', result)
        throw new Error('메뉴 데이터가 없거나 형식이 올바르지 않습니다')
      }
    } catch (error) {
      console.error('메뉴 조회 오류:', error)
      setError('메뉴를 불러올 수 없습니다: ' + (error as Error).message)
    } finally {
      setIsLoadingMenus(false)
    }
  }

  // 현재 페이지 URL에서 storeId 가져오기
  const getCurrentStoreId = () => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const storeId = urlParams.get('storeId')
        console.log('현재 페이지 URL:', window.location.href)
        console.log('URL 파라미터:', window.location.search)
        console.log('추출된 storeId:', storeId)
        return storeId || '1' // storeId가 없으면 기본값
      }
    } catch (e) {
      console.error('URL 파라미터 파싱 실패:', e)
    }
    return '1' // 기본값
  }

  // QR 코드 결과 처리
  const handleQRResult = (data: string) => {
    // 스캔 정지 및 모달 오픈
    setIsScanning(false)
    setScannedData(data)
    setIsOrderModalOpen(true)
    
    console.log('QR 코드 데이터:', data)
    console.log('QR 코드 데이터 타입:', typeof data)
    console.log('QR 코드 데이터 길이:', data.length)
    console.log('QR 코드 데이터 첫 50자:', data.substring(0, 50))
    
    // QR 코드에서 qrToken 추출
    let extractedQrToken = ''
    
    try {
      // URL 형태인 경우 파싱 시도
      if (data.includes('http')) {
        const url = new URL(data)
        console.log('URL 파싱 성공:', url.href)
        console.log('URL search params:', url.searchParams.toString())
        
        // t 파라미터에서 qrToken 추출
        const rawToken = url.searchParams.get('t') || ''
        // "default-" 다음에 나오는 부분만 추출
        extractedQrToken = rawToken.startsWith('default-') ? rawToken.substring(8) : rawToken
        console.log('추출된 qrToken:', extractedQrToken)
      }
    } catch (e) {
      // URL 파싱 실패 시 원본 데이터 사용
      console.log('URL 파싱 실패, 원본 데이터 사용:', data)
      extractedQrToken = data
    }
    
    // 현재 페이지 URL에서 storeId 가져오기
    const currentStoreId = getCurrentStoreId()
    
    console.log('추출된 qrToken:', extractedQrToken)
    console.log('현재 페이지의 storeId:', currentStoreId)
    setQrToken(extractedQrToken)
    setStoreId(currentStoreId)
    
    // 메뉴 가져오기 (현재 페이지의 storeId로)
    fetchMenus(currentStoreId)
  }

  // 메뉴를 카테고리별로 그룹화
  const getMenusByCategory = () => {
    const groupedMenus: Record<string, typeof menus> = {}
    
    menus.forEach(menu => {
      if (!groupedMenus[menu.categoryName]) {
        groupedMenus[menu.categoryName] = []
      }
      groupedMenus[menu.categoryName].push(menu)
    })
    
    return groupedMenus
  }

  // 메뉴 선택 처리
  const handleMenuSelect = (menu: typeof menus[0]) => {
    const existingIndex = selectedMenus.findIndex(item => item.menuId === menu.menuId)
    
    if (existingIndex >= 0) {
      // 이미 선택된 메뉴면 수량 증가
      const updatedMenus = [...selectedMenus]
      updatedMenus[existingIndex].quantity += 1
      setSelectedMenus(updatedMenus)
    } else {
      // 새로운 메뉴 추가 (가격은 임시로 0으로 설정)
      setSelectedMenus([...selectedMenus, {
        menuId: menu.menuId,
        menuName: menu.menuName,
        categoryName: menu.categoryName,
        quantity: 1,
        price: 0 // 실제 가격은 백엔드에서 받아와야 함
      }])
    }
  }

  // 수량 조절
  const updateQuantity = (menuId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // 수량이 0 이하면 선택된 메뉴에서 제거
      setSelectedMenus(selectedMenus.filter(item => item.menuId !== menuId))
    } else {
      // 수량 업데이트
      setSelectedMenus(selectedMenus.map(item => 
        item.menuId === menuId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  // UUID 생성 함수
  const generateIdempotencyKey = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // 숫자 문자열을 UUID 형식으로 변환하는 함수
  const convertToUUID = (token: string): string => {
    // 이미 UUID 형식인지 확인
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(token)) {
      return token
    }
    
    // 숫자 문자열인 경우 UUID 형식으로 변환
    // 32자리 16진수 문자열로 변환 후 UUID 형식으로 포맷팅
    const paddedToken = token.padStart(32, '0')
    return `${paddedToken.substring(0, 8)}-${paddedToken.substring(8, 12)}-${paddedToken.substring(12, 16)}-${paddedToken.substring(16, 20)}-${paddedToken.substring(20, 32)}`
  }

  // 결제 요청 제출
  const handleSubmitOrder = async () => {
    if (!storeId || !qrToken || selectedMenus.length === 0) {
      alert('스토어 ID, QR 토큰, 선택된 메뉴가 필요합니다.')
      return
    }

    setIsSubmitting(true)
    try {
      // Idempotency Key 생성
      const idempotencyKey = generateIdempotencyKey()
      
      const paymentData = {
        storeId: parseInt(storeId, 10), // 명시적으로 10진수로 변환
        orderItems: selectedMenus.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
        })),
      }

      // qrToken을 UUID 형식으로 변환
      const uuidFormattedToken = convertToUUID(qrToken)
      
      console.log('결제 요청 데이터:', paymentData)
      console.log('Idempotency Key:', idempotencyKey)
      console.log('QR Token ID (원본):', qrToken)
      console.log('QR Token ID (UUID 형식):', uuidFormattedToken)

      const response = await fetch(`${apiConfig.baseURL}/cpqr/${uuidFormattedToken}/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Idempotency-Key': idempotencyKey,
        },
        credentials: 'include',
        body: JSON.stringify(paymentData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`결제 요청 실패: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('결제 요청 성공:', result)

      alert('결제 요청이 성공적으로 생성되었습니다!')
      setIsOrderModalOpen(false)
      setSelectedMenus([])
    } catch (error) {
      console.error('결제 요청 오류:', error)
      alert('결제 요청에 실패했습니다: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
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
      {/* 주문 모달 */}
      {isOrderModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white p-5 shadow-lg">
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
            
            {/* QR 정보 표시 */}
            <div className="mb-4 rounded bg-gray-50 p-3">
              <div className="mb-2 text-sm font-medium text-gray-700">QR 정보</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div className="break-all">
                  <div className="font-medium">QR 코드:</div>
                  <div className="mt-1 text-gray-600">{scannedData}</div>
                </div>
                <div>QR Token: {qrToken}</div>
                <div>매장 ID: {storeId}</div>
                {isLoadingMenus && <div className="text-blue-600">메뉴를 불러오는 중...</div>}
              </div>
            </div>
            
            <div className="flex gap-4">
              {/* 메뉴 선택 영역 */}
              <div className="flex-1">
                <h3 className="mb-3 text-lg font-semibold">메뉴 선택</h3>
                {isLoadingMenus ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">메뉴를 불러오는 중...</div>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-auto">
                    {Object.entries(getMenusByCategory()).map(([categoryName, categoryMenus]) => (
                      <div key={categoryName} className="mb-4">
                        <h4 className="mb-2 text-sm font-semibold text-gray-700 border-b pb-1">
                          {categoryName}
                        </h4>
                        <div className="space-y-2">
                          {categoryMenus.map(menu => (
                            <button
                              key={menu.menuId}
                              onClick={() => handleMenuSelect(menu)}
                              disabled={menu.soldOut}
                              className={`w-full rounded border p-3 text-left transition-colors ${
                                menu.soldOut
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                        <div>
                                  <div className="font-medium">{menu.menuName}</div>
                                  {menu.description && (
                                    <div className="text-sm text-gray-500">{menu.description}</div>
                                  )}
                                </div>
                                {menu.soldOut && (
                                  <span className="text-xs text-red-500">품절</span>
                                )}
                          </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 선택된 메뉴 및 결제 영역 */}
              <div className="w-96">
                <h3 className="mb-4 text-xl font-semibold">주문 내역</h3>
                <div className="max-h-96 overflow-auto border rounded-lg">
                  {selectedMenus.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-base">
                      선택된 메뉴가 없습니다
                    </div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {selectedMenus.map(item => (
                        <div key={item.menuId} className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
                          <div className="flex-1">
                            <div className="font-semibold text-base">{item.menuName}</div>
                            <div className="text-sm text-gray-600">{item.categoryName}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                              onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                              className="h-8 w-8 rounded border border-gray-300 text-base hover:bg-gray-200 font-medium"
                          >
                            -
                          </button>
                            <span className="w-10 text-center text-base font-semibold">{item.quantity}</span>
                          <button
                              onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                              className="h-8 w-8 rounded border border-gray-300 text-base hover:bg-gray-200 font-medium"
                          >
                            +
                          </button>
                          </div>
                        </div>
                    ))}
                    </div>
                )}
              </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="flex-1 rounded border border-gray-300 px-4 py-2"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || selectedMenus.length === 0}
                    className="flex-1 rounded bg-gray-800 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {isSubmitting ? '처리 중...' : '결제 요청'}
                  </button>
                </div>
              </div>
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
