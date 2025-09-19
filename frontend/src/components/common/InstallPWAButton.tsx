'use client'

import React, { useState } from 'react'
import { usePWA } from '@/providers/PwaProvider'
// import Button from '@/components/ui/Button'

interface InstallPWAButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function InstallPWAButton({ className, children }: InstallPWAButtonProps) {
  const { canInstall, installPrompt } = usePWA()
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstall = async () => {
    if (!canInstall) return

    setIsInstalling(true)
    try {
      const success = await installPrompt()
      if (success) {
        console.log('PWA 설치가 완료되었습니다!')
      }
    } catch (error) {
      console.error('PWA 설치 중 오류:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  if (!canInstall) {
    return null
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 ${className || ''}`}
    >
      {isInstalling ? '설치 중...' : (children || '앱 설치')}
    </button>
  )
}
