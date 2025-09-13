"use client";

import Image from "next/image";
import Link from "next/link";

export default function OwnerLogin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* 캐릭터 일러스트 */}
      <div className="mb-10">
        <Image
          src="/owner.png"
          alt="사장님 캐릭터"
          width={180}
          height={180}
          priority
        /> 
      </div>

      {/* 제목 */}
      <h1 className="font-display text-xl font-bold text-gray-900 mb-6">사장님 로그인</h1>

      {/* Google 버튼 */}
      <button className="flex items-center w-72 h-12 border border-[#DADCE0] rounded-lg mb-4 bg-white hover:shadow-md transition">
        <Image
          src="/google-icon.png"
          alt="Google"
          width={18}
          height={18}
          className="ml-4"
        />
        <span className="flex-1 text-center text-[#3C4043] font-medium text-sm">
          Google로 시작하기
        </span>
      </button>

      {/* Kakao 버튼 */}
      <button className="flex items-center w-72 h-12 rounded-lg mb-8 bg-[#FEE500] hover:brightness-95 transition">
        <Image
          src="/kakao-icon.png"
          alt="Kakao"
          width={20}
          height={20}
          className="ml-4"
        />
        <span className="flex-1 text-center text-black font-medium text-sm">
          Kakao로 시작하기
        </span>
      </button>

      {/* 고객 로그인 링크 */}
      <Link
        href="/customer/login"
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
      >
        <Image
          src="/customer.png"
          alt="고객 아이콘"
          width={20}
          height={20}
        />
        <span className="font-medium text-yellow-600">고객</span>
        <span>으로 로그인하기</span>
      </Link>
    </div>
  );
}
