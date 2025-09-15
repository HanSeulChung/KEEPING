"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function OwnerLogin() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setLoading(provider);
    
    try {
      console.log(`로그인 시도: ${provider}`);
      
      const response = await fetch(`/api/auth/${provider}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 실제 구현에서는 소셜 로그인 토큰이나 코드를 전달
          token: `${provider}-mock-token-${Date.now()}`
        }),
      });

      console.log('응답 상태:', response.status);
      console.log('응답 OK:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('로그인 성공 데이터:', data);
        
        // 토큰 저장 (실제로는 secure storage 사용)
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Auth store 업데이트
        login({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email
        });
        
        console.log('대시보드로 리다이렉트');
        // 대시보드로 리다이렉트
        router.push('/owner/dashboard');
      } else {
        const errorData = await response.text();
        console.error('로그인 실패 응답:', errorData);
        alert(`로그인에 실패했습니다. (상태: ${response.status})`);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert(`로그인 중 오류가 발생했습니다: ${error}`);
    } finally {
      setLoading(null);
    }
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
