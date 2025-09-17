'use client'
import { useState } from 'react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  onPayment: () => void
}

export const PaymentModal = ({ isOpen, onClose, amount, onPayment }: PaymentModalProps) => {
  const [cardNumber, setCardNumber] = useState(['9411', '9411', '9411', '9411'])
  const [expiryDate, setExpiryDate] = useState('')
  const [cvc, setCvc] = useState('')

  if (!isOpen) return null

  const handleCardNumberChange = (index: number, value: string) => {
    const newCardNumber = [...cardNumber]
    newCardNumber[index] = value.replace(/\D/g, '').slice(0, 4)
    setCardNumber(newCardNumber)
  }

  const handleExpiryDateChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').slice(0, 4)
    if (formatted.length >= 2) {
      setExpiryDate(`${formatted.slice(0, 2)}/${formatted.slice(2)}`)
    } else {
      setExpiryDate(formatted)
    }
  }

  const handleCvcChange = (value: string) => {
    setCvc(value.replace(/\D/g, '').slice(0, 3))
  }

  const handlePayment = () => {
    // 결제 로직 구현
    onPayment()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-[600px] h-[789px] md:w-[90vw] md:h-[80vh] md:max-w-[600px] md:max-h-[789px] relative overflow-hidden rounded-[10px] bg-white mx-4"
        style={{ boxShadow: "0px 4px 4px 0 rgba(0,0,0,0.25)" }}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-start p-4">
          <div>
            <p className="text-2xl md:text-4xl font-bold text-black mb-2">
              카드 결제
            </p>
            <p className="text-xs md:text-[10px] text-black">
              본인 명의의 카드 정보를 입력해주세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              width={36}
              height={36}
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 md:w-9 md:h-9"
            >
              <path
                d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z"
                stroke="#1E1E1E"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 구분선 */}
        <div className="w-full h-px bg-gray-300 mx-4"></div>

        {/* 카드 정보 입력 폼 */}
        <div className="p-4 space-y-6">
          {/* 카드 번호 */}
          <div className="space-y-2">
            <p className="text-sm md:text-[13.6px] font-bold text-black">
              카드 번호
            </p>
            <div className="flex gap-1 p-2 rounded-md bg-white border border-gray-300">
              {cardNumber.map((number, index) => (
                <input
                  key={index}
                  type="text"
                  value={number}
                  onChange={(e) => handleCardNumberChange(index, e.target.value)}
                  className="flex-1 text-center text-sm md:text-sm text-black border-b border-black bg-transparent outline-none"
                  maxLength={4}
                />
              ))}
            </div>
          </div>

          {/* 유효 기간 */}
          <div className="space-y-2">
            <p className="text-sm md:text-[13.6px] font-bold text-black">
              유효 기간
            </p>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => handleExpiryDateChange(e.target.value)}
              placeholder="월/년도(MMYY) 순서로 4자리 숫자"
              className="w-full h-[42px] p-2 rounded-md bg-white border border-gray-300 text-xs text-black outline-none"
              maxLength={5}
            />
          </div>

          {/* CVC */}
          <div className="space-y-2">
            <p className="text-sm md:text-[13.6px] font-bold text-black">
              CVC
            </p>
            <input
              type="text"
              value={cvc}
              onChange={(e) => handleCvcChange(e.target.value)}
              placeholder="3자리를 입력해주세요."
              className="w-full h-[42px] p-2 rounded-md bg-white border border-gray-300 text-xs text-black outline-none"
              maxLength={3}
            />
          </div>

          {/* 카드 타입 */}
          <div className="flex justify-center">
            <div className="px-4 py-2 rounded border border-black bg-gray-200">
              <p className="text-xs md:text-[10px] font-bold text-black">
                싸피 카드
              </p>
            </div>
          </div>

          {/* 숫자 패드 */}
          <div className="grid grid-cols-3 gap-2 p-2 border border-black rounded bg-gray-100">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <button
                key={num}
                className="h-[42px] rounded-[8.5px] flex items-center justify-center text-lg md:text-[23px] text-black hover:bg-gray-200 transition-colors"
                onClick={() => {
                  // 숫자 패드 클릭 로직 (현재 포커스된 필드에 숫자 입력)
                  console.log(`Number ${num} clicked`)
                }}
              >
                {num}
              </button>
            ))}
            <button className="h-[42px] rounded-[8.5px] flex items-center justify-center text-lg md:text-[19px] text-black hover:bg-gray-200 transition-colors">
              ⌫
            </button>
          </div>
        </div>

        {/* 결제 버튼 */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handlePayment}
            className="w-full h-12 md:h-[42px] bg-black text-white text-sm md:text-[13.6px] font-bold rounded-md hover:bg-gray-800 transition-colors"
          >
            결제하기
          </button>
        </div>

        {/* 하단 구분선 및 로고 */}
        <div className="absolute bottom-16 left-4 right-4 h-px bg-gray-300"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-lg md:text-[17px] font-bold text-black">
            KEEPING
          </p>
        </div>
      </div>
    </div>
  )
}
