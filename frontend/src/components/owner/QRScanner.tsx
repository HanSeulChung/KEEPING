'use client'

import { apiConfig } from '@/api/config'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function QRScanner() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

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
      // 실제 QR 코드 데이터를 스캔해야 함
      // 현재는 패턴만 감지하고 실제 데이터는 없음
      console.log('QR 패턴 감지됨 - 실제 구현 필요')
      setIsScanning(false)
    }
  }

  // 간단한 QR 패턴 감지 함수 (시뮬레이션)
  const detectQRPattern = (imageData: ImageData): boolean => {
    // 실제 QR 코드는 특정 패턴을 가지므로, 여기서는 랜덤 시뮬레이션
    // 실제 구현에서는 jsQR 라이브러리의 qrcode.decode() 함수를 사용
    return Math.random() > 0.995 // 0.5% 확률로 감지 (더 현실적으로)
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
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라 우선
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">로그인 페이지로 이동 중...</div>
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
                <div className="mb-4 text-center text-red-400">{error}</div>
              )}

              {scannedData && (
                <div className="mb-4 text-center text-green-400">
                  QR 코드 인식됨: {scannedData}
                </div>
              )}

              <div className="flex gap-4">
                {!isScanning ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                  >
                    스캔 시작
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
                  >
                    스캔 중지
                  </button>
                )}

                <button
                  onClick={() => router.push('/owner/dashboard')}
                  className="flex-1 rounded-lg bg-gray-600 px-6 py-3 font-medium text-white hover:bg-gray-700"
                >
                  대시보드로
                </button>
              </div>

              {/* 테스트용 QR 시뮬레이션 버튼 */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    // 실제 QR 코드 스캔 기능 구현 필요
                    console.log('수동 QR 스캔 버튼 클릭 - 실제 구현 필요')
                    setIsScanning(false)
                  }}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  테스트: QR 코드 시뮬레이션
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
    </>
  )
}
