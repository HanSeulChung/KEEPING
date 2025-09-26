'use client'

import React from 'react'
import { useAuthStore } from '@/store/useAuthStore'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  className = '', 
  children = '로그아웃' 
}) => {
  const { logout, isLoggingOut } = useAuthStore()

  const handleLogout = async () => {
    const confirmLogout = window.confirm('정말 로그아웃하시겠습니까?')
    if (confirmLogout) {
      await logout()
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${className} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoggingOut ? '로그아웃 중...' : children}
    </button>
  )
}

export default LogoutButton
