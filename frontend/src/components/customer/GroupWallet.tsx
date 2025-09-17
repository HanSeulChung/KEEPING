'use client'
import Image from 'next/image'
import { useState } from 'react'
import { GroupCreateModal } from '../ui/GroupCreateModal'
import { PaymentModal } from '../ui/PaymentModal'

// 타입 정의
interface WalletCard {
  id: number
  name: string
  amount: number
  isSelected?: boolean
}

interface Transaction {
  id: number
  type: 'charge' | 'usage'
  amount: number
  date: string
  by: string
}

// 더미 데이터
const WALLET_CARDS: WalletCard[] = [
  { id: 1, name: '아쭈맛나', amount: 35000, isSelected: false },
  { id: 2, name: '아쭈맛나', amount: 35000, isSelected: true },
  { id: 3, name: '아쭈맛나', amount: 35000, isSelected: false },
]

const TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'charge', amount: 35000, date: '2025-09-01', by: '눈농' },
  { id: 2, type: 'usage', amount: 12000, date: '2025-09-07', by: '눈농' },
]

const TAB_CONFIG = {
  history: '사용내역',
  share: '공유',
  withdrawal: '회수',
} as const

// 지갑 카드 컴포넌트 (MyWallet에서 가져옴)
const WalletCard = ({
  card,
  onClick,
}: {
  card: WalletCard
  onClick: () => void
}) => {
  return (
    <div
      className={`relative h-44 w-44 md:h-40 md:w-40 cursor-pointer border border-black transition-colors ${
        card.isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {/* 아쭈맛나 텍스트 */}
      <div className="absolute top-4 left-4 text-base md:text-sm font-normal text-black">
        {card.name}
      </div>

      {/* 01 텍스트 */}
      <div className="absolute top-4 right-4 text-sm md:text-xs font-normal text-black">
        {card.id.toString().padStart(2, '0')}
      </div>

      {/* 선 */}
      <div className="absolute top-12 right-4 left-4 h-px bg-black"></div>

      {/* 금액 */}
      <div className="absolute top-18 left-1/2 -translate-x-1/2 text-base md:text-sm font-extrabold text-black">
        {card.amount.toLocaleString()}원
      </div>

      {/* 결제하기 버튼 */}
      <div className="absolute top-32 md:top-28 left-1/2 -translate-x-1/2">
        <div className="flex h-6 w-16 md:h-5 md:w-15 items-center justify-center border-2 border-blue-500 bg-white">
          <span className="text-sm md:text-xs font-bold text-blue-500">결제하기</span>
        </div>
      </div>
    </div>
  )
}

// 거래 내역 아이템 컴포넌트 (MyWallet에서 가져와서 수정)
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div className="relative h-16 w-full">
      {/* 충전/사용 라벨 */}
      <div
        className={`absolute top-4 left-4 flex h-6 w-13 items-center justify-center border text-sm font-extrabold ${
          transaction.type === 'charge'
            ? 'border-blue-500 text-blue-500'
            : 'border-red-500 text-red-500'
        }`}
      >
        {transaction.type === 'charge' ? '충전' : '사용'}
      </div>

      {/* 금액 */}
      <div className="absolute top-4 left-20 text-sm font-extrabold text-black">
        {transaction.amount.toLocaleString()}원
      </div>

      {/* 날짜 */}
      <div className="absolute top-5 left-44 text-xs font-extrabold text-gray-400">
        {transaction.date}
      </div>

      {/* by 사용자 */}
      <div className="absolute top-4 right-4 text-xs font-bold text-black">
        by {transaction.by}
      </div>

      {/* 구분선 */}
      <div className="absolute right-3 bottom-4 left-3 h-px bg-gray-300"></div>
    </div>
  )
}

// 충전 옵션 아이템 컴포넌트 (MyWallet에서 가져옴)
interface ChargeOptionProps {
  discount: string
  points: string
  isSelected?: boolean
  onClick?: () => void
}

const ChargeOption = ({
  discount,
  points,
  isSelected = false,
  onClick,
}: ChargeOptionProps) => {
  return (
    <div
      className={`flex h-[59px] w-full cursor-pointer items-center justify-between border border-black px-5 transition-colors ${
        isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-yellow-50'
      }`}
      onClick={onClick}
    >
      <span className="text-sm font-bold text-red-500">{discount}</span>
      <span className="text-sm font-bold text-black">{points}</span>
    </div>
  )
}

// 충전 섹션 컴포넌트 (MyWallet에서 가져옴)
const ChargeSection = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  const chargeOptions = [
    { discount: '5% 할인', points: '50,000 포인트', originalPrice: 50000, discountRate: 0.05 },
    { discount: '5% 할인', points: '100,000 포인트', originalPrice: 100000, discountRate: 0.05 },
    { discount: '5% 할인', points: '150,000 포인트', originalPrice: 150000, discountRate: 0.05 },
    { discount: '5% 할인', points: '200,000 포인트', originalPrice: 200000, discountRate: 0.05 },
    { discount: '5% 할인', points: '250,000 포인트', originalPrice: 250000, discountRate: 0.05 },
  ]

  // 선택된 옵션의 결제 금액 계산
  const calculatePaymentAmount = () => {
    if (selectedIndex === null) return 0
    const selectedOption = chargeOptions[selectedIndex]
    return Math.round(selectedOption.originalPrice * (1 - selectedOption.discountRate))
  }

  const paymentAmount = calculatePaymentAmount()

  return (
    <div className="w-full">
      {/* 충전 옵션들 */}
      <div className="mb-6 space-y-2">
        {chargeOptions.map((option, index) => (
          <ChargeOption
            key={index}
            discount={option.discount}
            points={option.points}
            isSelected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {/* 결제 금액 */}
      <div className="mb-6">
        <span className="text-sm font-bold text-black">
          결제 금액: {paymentAmount > 0 ? `${paymentAmount.toLocaleString()}원` : '옵션을 선택해주세요'}
        </span>
      </div>

      {/* 충전하기 버튼 */}
      <button className="flex h-12 w-full items-center justify-center border border-black bg-black">
        <span className="text-sm font-bold text-white">충전하기</span>
      </button>
    </div>
  )
}

// 공유 섹션 컴포넌트
const ShareSection = () => {
  const [shareAmount, setShareAmount] = useState<string>('')
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const myPoints = 35000 // 내 보유 포인트

  const handleShareAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 입력 가능
    setShareAmount(value)
  }

  return (
    <div className="w-full">
      <div className="w-full">
        {/* 내 보유 포인트 */}
        <div className="mb-6 flex items-center gap-4">
          <p className="text-base md:text-sm font-bold text-black">
            내 보유 포인트
          </p>
          <div className="relative">
            <Image
              src="/wallet/inputbox.svg"
              alt="입력 박스"
              width={200}
              height={40}
              className="w-[200px] h-[40px]"
            />
            <p className="absolute right-[20px] top-[12px] text-base md:text-sm font-bold text-black">
              {myPoints.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 공유할 포인트 */}
        <div className="mb-6 flex items-center gap-4">
          <p className="text-base md:text-sm font-bold text-black">
            공유할 포인트
          </p>
          <div className="relative">
            <Image
              src="/wallet/inputbox.svg"
              alt="입력 박스"
              width={200}
              height={40}
              className="w-[200px] h-[40px]"
            />
            <input
              type="text"
              value={shareAmount}
              onChange={handleShareAmountChange}
              placeholder="0"
              className="absolute right-[20px] top-[12px] w-[120px] text-base md:text-sm font-bold text-black bg-transparent border-none outline-none text-right"
            />
          </div>
        </div>

        {/* 공유하기 버튼 */}
        <button 
          className="flex h-14 md:h-12 w-full items-center justify-center border border-black bg-black cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => {
            if (shareAmount && parseInt(shareAmount) > 0) {
              setIsPaymentModalOpen(true)
            }
          }}
          disabled={!shareAmount || parseInt(shareAmount) <= 0}
        >
          <span className="text-base md:text-sm font-bold text-white">공유하기</span>
        </button>

        {/* 결제 모달 */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={parseInt(shareAmount) || 0}
          onPayment={() => {
            console.log('공유 완료:', shareAmount)
            // 공유 완료 후 로직
          }}
        />
      </div>
    </div>
  )
}

// 회수 섹션 컴포넌트 (환불 섹션과 유사)
const WithdrawalSection = () => {
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('')
  const availableAmount = 35000 // 회수 가능 금액

  const handleWithdrawalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 입력 가능
    setWithdrawalAmount(value)
  }

  return (
    <div className="w-full">
      <p className="mb-6 text-lg md:text-[15px] font-bold text-black">
        "아쭈맛나" 포인트 회수하기
      </p>
      
      <div className="mb-6 flex items-center gap-4">
        <p className="text-base md:text-sm font-bold text-black">
          회수 가능 금액
        </p>
        <div className="relative">
          <Image
            src="/wallet/inputbox.svg"
            alt="입력 박스"
            width={200}
            height={40}
            className="w-[200px] h-[40px]"
          />
          <p className="absolute right-[20px] top-[12px] text-base md:text-sm font-bold text-black">
            {availableAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <p className="text-base md:text-sm font-bold text-black">
          회수할 포인트
        </p>
        <div className="relative">
          <Image
            src="/wallet/inputbox.svg"
            alt="입력 박스"
            width={200}
            height={40}
            className="w-[200px] h-[40px]"
          />
          <input
            type="text"
            value={withdrawalAmount}
            onChange={handleWithdrawalAmountChange}
            placeholder="0"
            className="absolute right-[20px] top-[12px] w-[120px] text-base md:text-sm font-bold text-black bg-transparent border-none outline-none text-right"
          />
        </div>
      </div>
      
      <button className="flex h-14 md:h-12 w-full items-center justify-center border border-black bg-black">
        <span className="text-base md:text-sm font-bold text-white">회수하기</span>
      </button>
    </div>
  )
}

// 페이지네이션 컴포넌트 (MyWallet에서 가져옴)
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  return (
    <div className="w-[382px] h-[55px] relative overflow-hidden">
      <div className="w-[30px] h-[30px]">
        <div className="w-[30px] h-[30px] absolute left-[141px] top-3 overflow-hidden rounded-[10px] border border-black flex items-center justify-center">
          <p className="text-[15px] font-bold text-black">1</p>
        </div>
      </div>
      <div className="w-[65px] h-[30px]">
        <div className="w-[30px] h-[30px] absolute left-[177px] top-3 overflow-hidden rounded-[10px] border border-black flex items-center justify-center">
          <p className="text-[15px] font-bold text-black">2</p>
        </div>
        <div className="w-[30px] h-[30px]">
          <div className="w-[30px] h-[30px] absolute left-[212px] top-3 overflow-hidden rounded-[10px] border border-black flex items-center justify-center">
            <p className="text-[15px] font-bold text-black">3</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export const GroupWallet = () => {
  const [selectedCard, setSelectedCard] = useState<number>(2)
  const [activeTab, setActiveTab] = useState<keyof typeof TAB_CONFIG>('history')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGroup, setSelectedGroup] = useState<number>(0)
  const [hoveredMember, setHoveredMember] = useState<number | null>(null)
  const [isGroupCreateModalOpen, setIsGroupCreateModalOpen] = useState(false)

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId)
  }

  const handleGroupSelect = (groupId: number) => {
    setSelectedGroup(groupId)
  }

  const handleCreateGroup = (groupName: string, groupDescription: string) => {
    console.log('새 그룹 생성:', { groupName, groupDescription })
    // 실제 그룹 생성 로직 구현
  }

  const cardsWithSelection = WALLET_CARDS.map(card => ({
    ...card,
    isSelected: card.id === selectedCard,
  }))

  // 그룹 데이터
  const groups = [
    { id: 0, name: 'A509', isSelected: true },
    { id: 1, name: 'A509', isSelected: false },
    { id: 2, name: 'A509', isSelected: false },
    { id: 3, name: '+', isAddButton: true },
  ]

  // 모임원 데이터
  const members = [
    { id: 1, name: '눈농', isLeader: true, profileImage: '/owner.png' },
    { id: 2, name: '김철수', isLeader: false, profileImage: '/customer.png' },
    { id: 3, name: '이영희', isLeader: false, profileImage: '/customer.png' },
    { id: 4, name: '박민수', isLeader: false, profileImage: '/customer.png' },
    { id: 5, name: '최지영', isLeader: false, profileImage: '/customer.png' },
    { id: 6, name: '정현우', isLeader: false, profileImage: '/customer.png' },
  ]

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-md">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-xl font-bold text-black" style={{ fontFamily: 'Tenada' }}>모임 지갑</h1>
        </div>

        {/* 검색바 */}
        <div className="mb-6 w-full">
          <div className="flex h-[48px] md:h-[41px] border border-solid border-black bg-white">
            <div className="flex flex-1 items-center px-4 md:px-3">
              <input
                type="text"
                placeholder="모임 검색"
                className="w-full border-none text-base md:text-sm outline-none"
              />
            </div>
            <button className="flex h-[48px] md:h-[41px] w-12 md:w-9 items-center justify-center bg-[#1f2937] transition-colors hover:bg-[#374151]">
              <Image
                src="/home/searchbar/search.svg"
                alt="Search icon"
                width={18}
                height={18}
                className="md:w-[15px] md:h-[15px]"
              />
            </button>
          </div>
        </div>

        {/* 그룹 선택 원형 버튼들 */}
        <div className="mb-6 w-full">
          <div className="scrollbar-hide overflow-x-auto">
            <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
              {groups.map(group => (
                <div key={group.id} className="flex-shrink-0">
                  {group.isAddButton ? (
                    <div 
                      className="w-[100px] h-[100px] md:w-[90px] md:h-[90px] rounded-full border border-black bg-[#D8D8D8] flex items-center justify-center cursor-pointer hover:bg-[#C8C8C8] transition-colors"
                      onClick={() => setIsGroupCreateModalOpen(true)}
                    >
                      <span className="text-lg md:text-base font-bold text-black">+</span>
                    </div>
                  ) : (
                    <div 
                      className="w-[100px] h-[100px] md:w-[90px] md:h-[90px] cursor-pointer transition-colors relative"
                      onClick={() => handleGroupSelect(group.id)}
                    >
                      <svg width="100" height="101" viewBox="0 0 90 91" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[100px] h-[101px] md:w-[90px] md:h-[91px] group">
                        <path d="M44.9902 1.09766C69.5669 1.09766 89.4902 21.021 89.4902 45.5977C89.4902 70.1743 69.5669 90.0977 44.9902 90.0977C20.4136 90.0977 0.490234 70.1743 0.490234 45.5977C0.490234 21.021 20.4136 1.09766 44.9902 1.09766Z" stroke="black"/>
                        <path 
                          d="M48.4902 2.59766C72.9832 2.59766 89.4902 24.9291 89.4902 49.5977C89.4902 74.0881 68.1619 89.5977 43.4902 89.5977C31.1698 89.5977 21.0539 85.7208 14.0205 78.8105C6.98839 71.9013 2.99023 61.913 2.99023 49.5977C2.99023 25.0002 23.9339 2.59766 48.4902 2.59766Z" 
                          fill={selectedGroup === group.id ? "#FFDB69" : "white"} 
                          stroke="black"
                          className="transition-colors group-hover:fill-[#FFDB69]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg md:text-base font-bold text-black">{group.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 그룹 정보 섹션 */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-[80px] h-[120px] md:w-[70px] md:h-[105px] flex items-center justify-center">
              <Image
                src="/wallet/groupIntro.svg"
                alt="Group character"
                width={80}
                height={120}
                className="w-[80px] h-[120px] md:w-[70px] md:h-[105px]"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl md:text-[25px] font-bold text-black">A509</h2>
                <svg width={36} height={36} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 md:w-[30px] md:h-[30px]">
                  <path d="M11.5625 27.5L11.0625 23.5C10.7917 23.3958 10.5365 23.2708 10.2969 23.125C10.0573 22.9792 9.82292 22.8229 9.59375 22.6562L5.875 24.2188L2.4375 18.2812L5.65625 15.8438C5.63542 15.6979 5.625 15.5573 5.625 15.4219V14.5781C5.625 14.4427 5.63542 14.3021 5.65625 14.1562L2.4375 11.7188L5.875 5.78125L9.59375 7.34375C9.82292 7.17708 10.0625 7.02083 10.3125 6.875C10.5625 6.72917 10.8125 6.60417 11.0625 6.5L11.5625 2.5H18.4375L18.9375 6.5C19.2083 6.60417 19.4635 6.72917 19.7031 6.875C19.9427 7.02083 20.1771 7.17708 20.4062 7.34375L24.125 5.78125L27.5625 11.7188L24.3437 14.1562C24.3646 14.3021 24.375 14.4427 24.375 14.5781V15.4219C24.375 15.5573 24.3542 15.6979 24.3125 15.8438L27.5313 18.2812L24.0938 24.2188L20.4062 22.6562C20.1771 22.8229 19.9375 22.9792 19.6875 23.125C19.4375 23.2708 19.1875 23.3958 18.9375 23.5L18.4375 27.5H11.5625ZM15.0625 19.375C16.2708 19.375 17.3021 18.9479 18.1562 18.0938C19.0104 17.2396 19.4375 16.2083 19.4375 15C19.4375 13.7917 19.0104 12.7604 18.1562 11.9063C17.3021 11.0521 16.2708 10.625 15.0625 10.625C13.8333 10.625 12.7969 11.0521 11.9531 11.9063C11.1094 12.7604 10.6875 13.7917 10.6875 15C10.6875 16.2083 11.1094 17.2396 11.9531 18.0938C12.7969 18.9479 13.8333 19.375 15.0625 19.375Z" fill="#1D1B20" />
                </svg>
              </div>
              <div className="w-full h-[88px] md:h-[76px] rounded-[31px] bg-yellow-50 flex items-center justify-center">
                <p className="text-xl md:text-lg text-center text-black">SSAFY 특화 프로젝트 A509 입니다 ~</p>
              </div>
            </div>
          </div>
        </div>

        {/* 모임원 프로필 사진들 */}
        <div className="mb-6 w-full">
          <div className="scrollbar-hide overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
              {members.map(member => (
                <div key={member.id} className="flex-shrink-0 relative">
                  <div 
                    className="w-14 h-14 md:w-12 md:h-12 rounded-full overflow-hidden border border-black cursor-pointer hover:border-blue-500 transition-colors"
                    onMouseEnter={() => setHoveredMember(member.id)}
                    onMouseLeave={() => setHoveredMember(null)}
                  >
                    <Image
                      src={member.profileImage}
                      alt={member.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 md:w-12 md:h-12 object-cover"
                    />
                  </div>
                  {member.isLeader && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 md:w-5 md:h-5">
                      <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-5 md:h-5">
                        <path d="M10 0L12.5 4H18L14.5 7L16 12L10 9L4 12L5.5 7L2 4H7.5L10 0Z" fill="#FFF45E" stroke="black" strokeWidth="0.5"/>
                      </svg>
                    </div>
                  )}
                  {/* 이름 툴팁 */}
                  {hoveredMember === member.id && (
                    <div className="absolute top-16 md:top-14 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm md:text-xs px-3 md:px-2 py-1 rounded whitespace-nowrap z-10">
                      {member.name}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 지갑 카드 캐러셀 */}
        <div className="mb-6 w-full">
          <div className="scrollbar-hide overflow-x-auto">
            <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
              {cardsWithSelection.map(card => (
                <WalletCard
                  key={card.id}
                  card={card}
                  onClick={() => handleCardSelect(card.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="relative mb-6 h-16 md:h-13 w-full">
          {Object.entries(TAB_CONFIG).map(([tabKey, tabLabel], index) => (
            <div key={tabKey} className="relative">
              <button
                onClick={() => setActiveTab(tabKey as keyof typeof TAB_CONFIG)}
                className={`absolute h-10 md:h-8 w-24 md:w-22 border border-black text-sm md:text-xs font-normal transition-colors ${
                  activeTab === tabKey
                    ? 'bg-[#efefef] text-black'
                    : 'bg-white text-black hover:bg-[#efefef]'
                }`}
                style={{
                  left: `${7 + index * 100}px`,
                  top: '11px',
                }}
              >
                <div className="flex h-full items-center justify-center">
                  {tabLabel}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* 탭 내용 */}
        {activeTab === 'history' && (
          <div className="mb-6">
            {TRANSACTIONS.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}

        {activeTab === 'share' && (
          <div className="mb-4">
            <ShareSection />
          </div>
        )}

        {activeTab === 'withdrawal' && (
          <div className="mb-4">
            <WithdrawalSection />
          </div>
        )}

        {/* 페이지네이션 - 사용내역 탭에서만 표시 */}
        {activeTab === 'history' && (
          <div className="flex justify-center -ml-4">
            <Pagination
              currentPage={currentPage}
              totalPages={3}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* 그룹 생성 모달 */}
        <GroupCreateModal
          isOpen={isGroupCreateModalOpen}
          onClose={() => setIsGroupCreateModalOpen(false)}
          onCreateGroup={handleCreateGroup}
        />
      </div>
    </div>
  )
}
