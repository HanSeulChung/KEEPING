import React, { useState, useEffect } from 'react';

interface PersonalCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerInfo?: {
    name: string;
    groupName?: string;
  };
  storeId?: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
}

const PersonalCardPaymentModal = ({ isOpen, onClose, customerInfo, storeId = '1' }: PersonalCardPaymentModalProps) => {
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [menuOptions, setMenuOptions] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 메뉴 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchMenus();
    }
  }, [isOpen, storeId]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${storeId}/menus`);
      if (response.ok) {
        const data = await response.json();
        setMenuOptions(data.data || []);
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
          { id: '8', name: '된장국', price: 5000, category: '사이드메뉴' }
        ]);
      }
    } catch (error) {
      console.error('메뉴 로딩 오류:', error);
      // 오류 시 기본 메뉴 사용
      setMenuOptions([
        { id: '1', name: '도미코스 A', price: 25000, category: '도미코스' },
        { id: '2', name: '도미코스 B', price: 35000, category: '도미코스' },
        { id: '3', name: '연어 사시미', price: 18000, category: '사시미' },
        { id: '4', name: '도미 사시미', price: 20000, category: '사시미' },
        { id: '5', name: '돈코츠 라멘', price: 12000, category: '라멘' },
        { id: '6', name: '미소 라멘', price: 11000, category: '라멘' },
        { id: '7', name: '김치', price: 3000, category: '사이드메뉴' },
        { id: '8', name: '된장국', price: 5000, category: '사이드메뉴' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectedMenuData = menuOptions.find(menu => menu.id === selectedMenu);
  const totalPrice = selectedMenuData ? selectedMenuData.price * quantity : 0;


  const handlePayment = async () => {
    if (!selectedMenuData) return;
    
    try {
      // 결제 API 호출
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo,
          menuId: selectedMenu,
          menuName: selectedMenuData.name,
          quantity,
          totalPrice,
          storeId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`결제가 완료되었습니다!\n${selectedMenuData.name} × ${quantity}개 = ${totalPrice.toLocaleString()}원`);
        onClose();
      } else {
        alert('결제 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('결제 오류:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-[600px] max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
        >
          <svg width={36} height={36} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z" stroke="#1E1E1E" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex flex-col items-center w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-4xl font-['Tenada'] font-extrabold text-black mb-2">주문하기</h2>
            <p className="text-sm font-['nanumsquare'] text-black">메뉴를 선택하고 주문해주세요.</p>
          </div>

          {/* Customer Info */}
          {customerInfo && (
            <div className="w-full bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm font-['nanumsquare'] text-black">
                고객: {customerInfo.name}
                {customerInfo.groupName && ` (${customerInfo.groupName})`}
              </p>
            </div>
          )}

          <div className="w-full space-y-6">
            {/* Menu Selection */}
            <div>
              <label className="block text-sm font-['nanumsquare'] font-bold text-black mb-2">메뉴 선택</label>
              {loading ? (
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-center">
                  <span className="text-sm font-['nanumsquare'] text-gray-500">메뉴 로딩 중...</span>
                </div>
              ) : (
                <select
                  value={selectedMenu}
                  onChange={(e) => setSelectedMenu(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-black font-['nanumsquare']"
                >
                  <option value="">메뉴를 선택해주세요</option>
                  {menuOptions.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name} - {menu.price.toLocaleString()}원
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-['nanumsquare'] font-bold text-black mb-2">수량</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-xl font-bold"
                >
                  -
                </button>
                <span className="text-lg font-['nanumsquare'] font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            {selectedMenuData && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-['nanumsquare'] text-black">
                  {selectedMenuData.name} × {quantity}개 = {totalPrice.toLocaleString()}원
                </p>
              </div>
            )}


            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={!selectedMenu}
              className="w-full py-3 bg-black text-white rounded-md font-['nanumsquare'] font-bold text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              주문하기
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-lg font-['Tenada'] font-extrabold text-black">KEEPING</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalCardPaymentModal;
