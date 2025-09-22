import { useEffect, useState } from 'react'

interface PersonalCardPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  customerInfo?: {
    name: string
    groupName?: string
  }
  storeId?: string
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  imageUrl?: string
}

const PersonalCardPaymentModal = ({
  isOpen,
  onClose,
  customerInfo,
  storeId,
}: PersonalCardPaymentModalProps) => {
  const [selectedMenu, setSelectedMenu] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [menuOptions, setMenuOptions] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)

  // 메뉴 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchMenus()
    }
  }, [isOpen, storeId])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      if (!storeId) {
        console.error('storeId가 없습니다')
        return
      }

      // Authorization 헤더 추가
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(`/api/stores/${storeId}/menus`, {
        headers,
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setMenuOptions(data.data || [])
      } else {
        // API 실패 시 기본 메뉴 사용
        setMenuOptions([
          { id: '1', name: '도미코스 A', price: 25000, category: '도미코스' },
          { id: '2', name: '도미코스 B', price: 35000, category: '도미코스' },
          { id: '3', name: '연어 사시미', price: 18000, category: '사시미' },
          { id: '4', name: '도미 사시미', price: 20000, category: '사시미' },
          { id: '5', name: '돈코츠 라멘', price: 12000, category: '라멘' },
          { id: '6', name: '미소 라멘', price: 11000, category: '라멘' },
          { id: '7', name: '김치', price: 3000, category: '사이드메뉴' },
          { id: '8', name: '된장국', price: 5000, category: '사이드메뉴' },
        ])
      }
    } catch (error) {
      console.error('메뉴 로딩 오류:', error)
      // 오류 시 기본 메뉴 사용
      setMenuOptions([
        { id: '1', name: '도미코스 A', price: 25000, category: '도미코스' },
        { id: '2', name: '도미코스 B', price: 35000, category: '도미코스' },
        { id: '3', name: '연어 사시미', price: 18000, category: '사시미' },
        { id: '4', name: '도미 사시미', price: 20000, category: '사시미' },
        { id: '5', name: '돈코츠 라멘', price: 12000, category: '라멘' },
        { id: '6', name: '미소 라멘', price: 11000, category: '라멘' },
        { id: '7', name: '김치', price: 3000, category: '사이드메뉴' },
        { id: '8', name: '된장국', price: 5000, category: '사이드메뉴' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const selectedMenuData = menuOptions.find(menu => menu.id === selectedMenu)
  const totalPrice = selectedMenuData ? selectedMenuData.price * quantity : 0

  const handlePayment = async () => {
    if (!selectedMenuData) return

    try {
      // Authorization 헤더 추가
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      // 결제 API 호출
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          customerInfo,
          menuId: selectedMenu,
          menuName: selectedMenuData.name,
          quantity,
          totalPrice,
          storeId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(
          `결제가 완료되었습니다!\n${selectedMenuData.name} × ${quantity}개 = ${totalPrice.toLocaleString()}원`
        )
        onClose()
      } else {
        alert('결제 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('결제 오류:', error)
      alert('결제 처리 중 오류가 발생했습니다.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative max-h-[90vh] w-[600px] overflow-y-auto rounded-lg bg-white p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-900"
        >
          <svg
            width={36}
            height={36}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z"
              stroke="#1E1E1E"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex w-full flex-col items-center">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="mb-2 font-['Tenada'] text-4xl font-extrabold text-black">
              주문하기
            </h2>
            <p className="font-['nanumsquare'] text-sm text-black">
              메뉴를 선택하고 주문해주세요.
            </p>
          </div>

          {/* Customer Info */}
          {customerInfo && (
            <div className="mb-6 w-full rounded-lg bg-gray-50 p-4">
              <p className="font-['nanumsquare'] text-sm text-black">
                고객: {customerInfo.name}
                {customerInfo.groupName && ` (${customerInfo.groupName})`}
              </p>
            </div>
          )}

          <div className="w-full space-y-6">
            {/* Menu Selection */}
            <div>
              <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-black">
                메뉴 선택
              </label>
              {loading ? (
                <div className="w-full rounded-md border border-gray-300 bg-gray-100 p-3 text-center">
                  <span className="font-['nanumsquare'] text-sm text-gray-500">
                    메뉴 로딩 중...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedMenu}
                  onChange={e => setSelectedMenu(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white p-3 font-['nanumsquare'] text-black"
                >
                  <option value="">메뉴를 선택해주세요</option>
                  {menuOptions.map(menu => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name} - {menu.price.toLocaleString()}원
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity Selection */}
            <div>
              <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-black">
                수량
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-xl font-bold"
                >
                  -
                </button>
                <span className="font-['nanumsquare'] text-lg font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            {selectedMenuData && (
              <div className="rounded-lg bg-yellow-50 p-4">
                <p className="font-['nanumsquare'] text-sm text-black">
                  {selectedMenuData.name} × {quantity}개 ={' '}
                  {totalPrice.toLocaleString()}원
                </p>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={!selectedMenu}
              className="w-full rounded-md bg-black py-3 font-['nanumsquare'] text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              주문하기
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="font-['Tenada'] text-lg font-extrabold text-black">
              KEEPING
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalCardPaymentModal
