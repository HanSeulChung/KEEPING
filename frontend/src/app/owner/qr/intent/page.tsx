'use client'

import { apiConfig } from '@/api/config'
import { Alert } from '@/components/ui/Alert'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

interface Menu {
  menuId: number
  storeId: number
  menuName: string
  categoryId: number
  categoryName: string
  displayOrder: number
  soldOut: boolean
  imgUrl: string
  description: string
  price: number
}

interface SelectedMenu {
  menuId: number
  menuName: string
  categoryName: string
  quantity: number
  price: number
}

function QRIntentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenus, setSelectedMenus] = useState<SelectedMenu[]>([])
  const [isLoadingMenus, setIsLoadingMenus] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrData, setQrData] = useState<{
    v: string | null
    t: string | null
    m: string | null
  }>({ v: null, t: null, m: null })
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')

  const accessToken = useMemo(
    () =>
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null,
    []
  )

  // URL 파라미터에서 QR 데이터 파싱
  useEffect(() => {
    const v = searchParams.get('v')
    const t = searchParams.get('t')
    const m = searchParams.get('m')
    const storeId = searchParams.get('storeId')

    setQrData({ v, t, m })
    console.log('QR 데이터 파싱:', { v, t, m })
    console.log('Store ID:', storeId)

    // storeId가 있으면 해당 매장의 메뉴를 가져옴
    if (storeId) {
      fetchMenus(storeId)
    } else {
      setError('매장 ID가 없습니다. QR 코드를 다시 스캔해주세요.')
    }
  }, [searchParams])

  // 메뉴 가져오기
  const fetchMenus = async (storeId: string) => {
    try {
      setIsLoadingMenus(true)
      console.log('메뉴 가져오기 시작, storeId:', storeId)

      const response = await fetch(
        `${apiConfig.baseURL}/owners/stores/${storeId}/menus`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`메뉴 조회 실패: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('메뉴 조회 성공:', result)

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

  // 메뉴를 카테고리별로 그룹화
  const getMenusByCategory = () => {
    const groupedMenus: Record<string, Menu[]> = {}

    menus.forEach(menu => {
      if (!groupedMenus[menu.categoryName]) {
        groupedMenus[menu.categoryName] = []
      }
      groupedMenus[menu.categoryName].push(menu)
    })

    return groupedMenus
  }

  // 메뉴 선택 처리
  const handleMenuSelect = (menu: Menu) => {
    const existingIndex = selectedMenus.findIndex(
      item => item.menuId === menu.menuId
    )

    if (existingIndex >= 0) {
      // 이미 선택된 메뉴면 수량 증가
      const updatedMenus = [...selectedMenus]
      updatedMenus[existingIndex].quantity += 1
      setSelectedMenus(updatedMenus)
    } else {
      // 새로운 메뉴 추가
      setSelectedMenus([
        ...selectedMenus,
        {
          menuId: menu.menuId,
          menuName: menu.menuName,
          categoryName: menu.categoryName,
          quantity: 1,
          price: typeof menu.price === 'number' ? menu.price : 0,
        },
      ])
    }
  }

  // 수량 조절
  const updateQuantity = (menuId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // 수량이 0 이하면 선택된 메뉴에서 제거
      setSelectedMenus(selectedMenus.filter(item => item.menuId !== menuId))
    } else {
      // 수량 업데이트
      setSelectedMenus(
        selectedMenus.map(item =>
          item.menuId === menuId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  // UUID 생성 함수
  const generateIdempotencyKey = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
  }

  // 숫자 문자열을 UUID 형식으로 변환하는 함수
  const convertToUUID = (token: string): string => {
    // 이미 UUID 형식인지 확인
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
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
    if (!qrData.t || selectedMenus.length === 0) {
      setAlertMessage('QR 토큰과 선택된 메뉴가 필요합니다.')
      setAlertType('error')
      setShowAlert(true)
      return
    }

    setIsSubmitting(true)
    try {
      // Idempotency Key 생성
      const idempotencyKey = generateIdempotencyKey()

      // t 파라미터에서 qrToken 추출 (default- 접두사 제거)
      const rawToken = qrData.t
      const extractedToken = rawToken.startsWith('default-')
        ? rawToken.substring(8)
        : rawToken
      const uuidFormattedToken = convertToUUID(extractedToken)

      const storeId = searchParams.get('storeId')
      if (!storeId) {
        throw new Error('매장 ID가 없습니다. QR 코드를 다시 스캔해주세요.')
      }

      const paymentData = {
        storeId: parseInt(storeId, 10), // URL에서 storeId 가져오기
        orderItems: selectedMenus.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
        })),
      }

      console.log('결제 요청 데이터:', paymentData)
      console.log('Idempotency Key:', idempotencyKey)
      console.log('QR Token ID (원본):', qrData.t)
      console.log('QR Token ID (추출):', extractedToken)
      console.log('QR Token ID (UUID 형식):', uuidFormattedToken)

      const response = await fetch(
        `${apiConfig.baseURL}/cpqr/${uuidFormattedToken}/initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'Idempotency-Key': idempotencyKey,
          },
          credentials: 'include',
          body: JSON.stringify(paymentData),
        }
      )

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`결제 요청 실패: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('결제 요청 성공:', result)

      setAlertMessage('결제 요청이 성공적으로 생성되었습니다!')
      setAlertType('success')
      setShowAlert(true)

      // 성공 후 대시보드로 이동
      setTimeout(() => {
        router.push('/owner/dashboard')
      }, 1500)
    } catch (error) {
      console.error('결제 요청 오류:', error)
      setAlertMessage('결제 요청에 실패했습니다: ' + (error as Error).message)
      setAlertType('error')
      setShowAlert(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6FCFF]">
        <div className="mx-auto w-full max-w-4xl bg-white">
          {/* Owner 테마 헤더 */}
          <div className="flex w-full items-center bg-[#76d4ff] px-4 py-3">
            <h1 className="font-jalnan text-xl leading-[140%] text-white">
              주문 생성
            </h1>
          </div>

          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="font-jalnan mb-4 text-lg font-extrabold text-red-600">
                오류 발생
              </div>
              <div className="font-nanum-square-round-eb mb-4 text-gray-600">
                {error}
              </div>
              <button
                onClick={() => {
                  const storeId = searchParams.get('storeId')
                  const accountName = searchParams.get('accountName')
                  if (storeId && accountName) {
                    router.push(
                      `/owner/scan?storeId=${storeId}&accountName=${accountName}`
                    )
                  } else {
                    router.push('/owner/scan')
                  }
                }}
                className="font-jalnan rounded-[10px] bg-[#76d4ff] px-4 py-2 font-bold text-white hover:bg-[#5bb3e6]"
              >
                QR 스캔으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6FCFF]">
      <div className="mx-auto w-full max-w-4xl bg-white">
        {/* Owner 테마 헤더 */}
        <div className="flex w-full items-center bg-[#76d4ff] px-4 py-3">
          <h1 className="font-jalnan text-xl leading-[140%] text-white">
            주문 생성
          </h1>
        </div>

        {/* QR 정보 표시 */}
        <div className="mx-4 mt-6 rounded-[20px] border border-[#76d4ff] bg-white p-4 shadow-sm">
          <h2 className="font-jalnan mb-3 text-lg font-extrabold text-[#76d4ff]">
            QR 정보
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <div>
              <span className="font-nanum-square-round-eb font-bold text-gray-700">
                Version:
              </span>{' '}
              {qrData.v || 'N/A'}
            </div>
            <div>
              <span className="font-nanum-square-round-eb font-bold text-gray-700">
                Token:
              </span>{' '}
              {qrData.t || 'N/A'}
            </div>
            <div>
              <span className="font-nanum-square-round-eb font-bold text-gray-700">
                Method:
              </span>{' '}
              {qrData.m || 'N/A'}
            </div>
          </div>
        </div>

        <div className="mx-4 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 메뉴 선택 영역 */}
          <div className="rounded-[20px] border border-[#76d4ff] bg-white p-6 shadow-sm">
            <h3 className="font-jalnan mb-4 text-xl font-extrabold text-[#76d4ff]">
              메뉴 선택
            </h3>
            {isLoadingMenus ? (
              <div className="flex items-center justify-center py-8">
                <div className="font-nanum-square-round-eb text-gray-500">
                  메뉴를 불러오는 중...
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-auto">
                {Object.entries(getMenusByCategory()).map(
                  ([categoryName, categoryMenus]) => (
                    <div key={categoryName} className="mb-6">
                      <h4 className="font-jalnan mb-3 border-b pb-2 text-lg font-extrabold text-[#76d4ff]">
                        {categoryName}
                      </h4>
                      <div className="space-y-3">
                        {categoryMenus.map(menu => (
                          <button
                            key={menu.menuId}
                            onClick={() => handleMenuSelect(menu)}
                            disabled={menu.soldOut}
                            className={`w-full rounded-[15px] border p-4 text-left transition-colors ${
                              menu.soldOut
                                ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                                : 'border-[#76d4ff] hover:border-[#5bb3e6] hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-nanum-square-round-eb text-lg font-bold">
                                  {menu.menuName}
                                </div>
                                {/* 메뉴 설명은 일시적으로 숨김 */}
                              </div>
                              <div className="text-right">
                                <div className="font-nanum-square-round-eb text-base font-bold text-[#2563eb]">
                                  {typeof menu.price === 'number' &&
                                  menu.price > 0
                                    ? `${menu.price.toLocaleString()}원`
                                    : '-'}
                                </div>
                                {menu.soldOut && (
                                  <span className="font-nanum-square-round-eb text-xs text-red-500">
                                    품절
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* 선택된 메뉴 및 결제 영역 */}
          <div className="rounded-[20px] border border-[#76d4ff] bg-white p-6 shadow-sm">
            <h3 className="font-jalnan mb-4 text-xl font-extrabold text-[#76d4ff]">
              주문 내역
            </h3>
            <div className="max-h-96 overflow-auto">
              {selectedMenus.length === 0 ? (
                <div className="font-nanum-square-round-eb py-8 text-center text-gray-500">
                  선택된 메뉴가 없습니다
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedMenus.map(item => (
                    <div
                      key={item.menuId}
                      className="flex items-center justify-between rounded-[15px] border border-[#76d4ff] bg-blue-50 p-4"
                    >
                      <div className="flex-1">
                        <div className="font-nanum-square-round-eb text-lg font-bold">
                          {item.menuName}
                        </div>
                        <div className="font-nanum-square-round-eb text-sm text-gray-600">
                          {item.categoryName}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.menuId, item.quantity - 1)
                          }
                          className="font-nanum-square-round-eb h-8 w-8 rounded-[10px] border border-[#76d4ff] text-lg font-bold hover:bg-[#76d4ff] hover:text-white"
                        >
                          -
                        </button>
                        <span className="font-nanum-square-round-eb w-12 text-center text-lg font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.menuId, item.quantity + 1)
                          }
                          className="font-nanum-square-round-eb h-8 w-8 rounded-[10px] border border-[#76d4ff] text-lg font-bold hover:bg-[#76d4ff] hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  const storeId = searchParams.get('storeId')
                  const accountName = searchParams.get('accountName')
                  if (storeId && accountName) {
                    router.push(
                      `/owner/scan?storeId=${storeId}&accountName=${accountName}`
                    )
                  } else {
                    router.push('/owner/scan')
                  }
                }}
                className="font-nanum-square-round-eb flex-1 rounded-[10px] border border-[#76d4ff] bg-white px-4 py-3 text-lg font-bold text-[#76d4ff] hover:bg-blue-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || selectedMenus.length === 0}
                className="font-jalnan flex-1 rounded-[10px] bg-[#76d4ff] px-4 py-3 text-lg font-bold text-white hover:bg-[#5bb3e6] disabled:opacity-50"
              >
                {isSubmitting ? '처리 중...' : '결제 요청'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
        type={alertType}
        onConfirm={() => setShowAlert(false)}
        variant="owner"
        title="알림"
      />
    </div>
  )
}

export default function QRIntentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRIntentPageContent />
    </Suspense>
  )
}
