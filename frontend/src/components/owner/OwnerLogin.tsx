"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/api/authApi";

export default function OwnerLogin() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    setLoading(provider);
    
    // 백엔드 점주용 소셜 로그인 URL로 직접 리다이렉트
    const backendUrl = 'http://localhost:8080';
    let redirectUrl: string;
    
    if (provider === 'kakao') {
      redirectUrl = `${backendUrl}/auth/kakao/owner`;
    } else if (provider === 'google') {
      redirectUrl = `${backendUrl}/auth/google/owner`; // 추후 백엔드에서 구현
    } else {
      console.error('지원하지 않는 소셜 로그인 프로바이더:', provider);
      setLoading(null);
      return;
    }
    
    console.log(`${provider} 점주 소셜 로그인으로 리다이렉트:`, redirectUrl);
    
    // 백엔드 OAuth 엔드포인트로 직접 리다이렉트
    window.location.href = redirectUrl;
  };

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
      <button 
        onClick={() => handleSocialLogin('google')}
        disabled={loading !== null}
        className="flex items-center w-72 h-12 border border-[#DADCE0] rounded-lg mb-4 bg-white hover:shadow-md transition disabled:opacity-50"
      >
        <Image
          src="/google-icon.png"
          alt="Google"
          width={18}
          height={18}
          className="ml-4"
        />
        <span className="flex-1 text-center text-[#3C4043] font-medium text-sm">
          {loading === 'google' ? '로그인 중...' : 'Google로 시작하기'}
        </span>
      </button>

      {/* Kakao 버튼 */}
      <button 
        onClick={() => handleSocialLogin('kakao')}
        disabled={loading !== null}
        className="flex items-center w-72 h-12 rounded-lg mb-8 bg-[#FEE500] hover:brightness-95 transition disabled:opacity-50"
      >
        <Image
          src="/kakao-icon.png"
          alt="Kakao"
          width={20}
          height={20}
          className="ml-4"
        />
        <span className="flex-1 text-center text-black font-medium text-sm">
          {loading === 'kakao' ? '로그인 중...' : 'Kakao로 시작하기'}
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
