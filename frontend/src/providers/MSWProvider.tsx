'use client'

import { useEffect } from 'react'

export default function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 개발 환경에서만 MSW 초기화
    if (process.env.NODE_ENV === 'development') {
      import('../mocks').catch(console.error)
    }
  }, [])

  return <>{children}</>
}
