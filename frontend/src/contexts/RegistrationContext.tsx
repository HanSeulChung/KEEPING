'use client'

import React, { createContext, ReactNode, useContext, useState } from 'react'

// 사업자 정보 타입
export interface BusinessInfo {
  businessNumber: string     // 사업자등록번호 (숫자만)
  openingDate: string       // 개업일자 (YYYYMMDD)
  representativeName: string // 대표자명
  verified: boolean         // 인증 완료 여부
  verificationData?: any    // 정부 API 응답 데이터
}

// 점주 등록 전체 데이터 타입
export interface OwnerRegistrationData {
  // Step 1 데이터
  step1?: Record<string, unknown>

  // Step 2 데이터 (사업자 인증)
  businessInfo?: BusinessInfo

  // Step 3 데이터
  step3?: Record<string, unknown>
}

// Context 타입
interface RegistrationContextType {
  registrationData: OwnerRegistrationData

  // 사업자 정보 설정
  setBusinessInfo: (businessInfo: BusinessInfo) => void

  // 전체 데이터 초기화
  resetRegistration: () => void

  // 특정 스텝 완료 여부 확인
  isStepCompleted: (step: number) => boolean
}

// Context 생성
const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined)

// Provider 컴포넌트
export const RegistrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registrationData, setRegistrationData] = useState<OwnerRegistrationData>({})

  // 사업자 정보 설정
  const setBusinessInfo = (businessInfo: BusinessInfo) => {
    setRegistrationData(prev => ({
      ...prev,
      businessInfo
    }))
  }

  // 전체 데이터 초기화
  const resetRegistration = () => {
    setRegistrationData({})
  }

  // 특정 스텝 완료 여부 확인
  const isStepCompleted = (step: number): boolean => {
    switch (step) {
      case 1:
        return true // step1은 항상 완료된 것으로 가정
      case 2:
        return registrationData.businessInfo?.verified === true
      case 3:
        return !!registrationData.step3
      default:
        return false
    }
  }

  const value: RegistrationContextType = {
    registrationData,
    setBusinessInfo,
    resetRegistration,
    isStepCompleted
  }

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  )
}

// Custom Hook
export const useRegistration = (): RegistrationContextType => {
  const context = useContext(RegistrationContext)
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider')
  }
  return context
}

// 편의용 Hook들
export const useBusinessInfo = () => {
  const { registrationData } = useRegistration()
  return registrationData.businessInfo
}

export const useIsBusinessVerified = (): boolean => {
  const { registrationData } = useRegistration()
  return registrationData.businessInfo?.verified === true
}