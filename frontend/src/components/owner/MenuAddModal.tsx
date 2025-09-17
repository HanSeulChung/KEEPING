import React from 'react';

interface MenuAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuAddModal = ({ isOpen, onClose }: MenuAddModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[420px] max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
        >
          &times;
        </button>

        <div className="flex flex-col items-center w-full">
          <h2 className="text-4xl font-['Tenada'] font-extrabold text-black text-center mb-8">메뉴 추가</h2>
          
          <div className="flex flex-col items-start gap-4 w-full">
            {/* 메뉴 이미지 업로드 */}
            <div className="flex flex-col items-start w-full">
              <label className="text-gray-500 font-['Inter'] text-[11.9px] leading-5 mb-1">메뉴 이미지</label>
              <div className="flex justify-center items-center w-full h-48 bg-gray-100 rounded-lg border border-gray-200 relative">
                <div className="absolute bottom-2 right-2 flex justify-center items-center pt-[0.5625rem] pb-[0.5625rem] px-4 h-[1.375rem] rounded-lg border border-black bg-white text-black text-center font-['nanumsquare'] text-[11px] font-bold leading-5">
                  이미지 업로드
                </div>
                <span className="text-gray-400">이미지 미리보기</span>
              </div>
            </div>

            {/* 메뉴명 */}
            <div className="flex flex-col items-start w-full">
              <label className="text-gray-500 font-['Inter'] text-[11.9px] leading-5 mb-1">메뉴명</label>
              <input 
                type="text" 
                placeholder="메뉴명 입력" 
                className="w-full p-2 h-[2.5625rem] rounded-md border border-gray-300 bg-white text-black font-['Inter'] leading-6" 
              />
            </div>

            {/* 가격 */}
            <div className="flex flex-col items-start w-full">
              <label className="text-gray-500 font-['Inter'] text-[11.9px] leading-5 mb-1">가격</label>
              <input 
                type="number" 
                placeholder="가격" 
                className="w-full p-2 h-[2.5625rem] rounded-md border border-gray-300 bg-white text-black font-['Inter'] leading-6" 
              />
            </div>

            {/* 메뉴 카테고리 */}
            <div className="flex flex-col items-start w-full">
              <label className="text-gray-500 font-['Inter'] text-[11.9px] leading-5 mb-1">메뉴 카테고리</label>
              <div className="flex justify-between items-center p-2 h-[2.4375rem] rounded-md border border-gray-300 w-full">
                <span className="text-black font-['Inter'] leading-[1.2px]">카테고리 선택</span>
                <svg width={17} height={17} viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M11.401 6.31539C11.5963 6.51065 11.5963 6.82724 11.401 7.02248L8.73437 9.68914C8.5391 9.88441 8.22257 9.88441 8.0273 9.68914L5.36062 7.02248C5.16536 6.82724 5.16536 6.51065 5.36062 6.31539C5.55588 6.12013 5.87246 6.12013 6.06772 6.31539L8.38084 8.62848L10.694 6.31539C10.8892 6.12013 11.2058 6.12013 11.401 6.31539Z" fill="black" />
                </svg>
              </div>
            </div>

            {/* 메뉴 소개 */}
            <div className="flex flex-col items-start w-full">
              <label className="text-gray-500 font-['Inter'] text-[11.9px] leading-5 mb-1">메뉴 소개</label>
              <textarea 
                placeholder="메뉴 소개 입력" 
                className="w-full p-2 h-20 rounded-md border border-gray-300 text-black font-['Inter'] leading-6 resize-none"
              ></textarea>
            </div>
          </div>

          {/* 등록하기 버튼 */}
          <button className="mt-8 py-2 px-6 rounded bg-gray-800 text-white text-center font-['nanumsquare'] text-[.8125rem] font-bold leading-6">
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuAddModal;
