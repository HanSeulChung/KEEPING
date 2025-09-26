import { useState } from 'react';

export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const logout = async () => {
    if (isLoggingOut) return; // 중복 클릭 방지
    
    setIsLoggingOut(true);
    
    try {
      // 1. 백엔드 로그아웃
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const data = await response.json();
      
      // 2. 카카오 로그아웃 (숨겨진 처리)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.src = `https://kauth.kakao.com/oauth/logout?client_id=8f7d038e1e68f41ef9ddb00e2868fb31&redirect_uri=${encodeURIComponent('http://localhost:3000')}`;
      document.body.appendChild(iframe);
      
      // 3. 정리 및 리다이렉트
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          console.log('iframe 제거 실패:', e);
        }
        
        localStorage.clear(); // 모든 로컬 데이터 삭제
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      console.error('로그아웃 에러:', error);
      localStorage.clear();
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return { logout, isLoggingOut };
};
