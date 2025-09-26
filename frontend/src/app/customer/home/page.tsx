'use client'
import { CategoryTabs } from '@/components/customer/home/CategoryTabs'
import { FoodCategory } from '@/components/customer/home/FoodCategory'
import { HeaderCards } from '@/components/customer/home/HeaderCards'
import { LifeCategory } from '@/components/customer/home/LifeCategory'
import { SearchBar } from '@/components/customer/home/SearchBar'
import { useAuthStore } from '@/store/useAuthStore'
import { useState } from 'react'

export default function Page() {
  const [isFoodActive, setIsFoodActive] = useState(true)
  const { user, loading, error } = useAuthStore()
  console.log('홈페이지 - useUser 상태:', { user, loading, error })
  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-6">
        <div className="w-full max-w-4xl">
          <div className="animate-pulse">
            <div className="mb-4 h-32 rounded bg-gray-200"></div>
            <div className="mb-4 h-12 rounded bg-gray-200"></div>
            <div className="mb-4 h-8 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-6">
      <div className="w-full max-w-4xl">
        <HeaderCards />
        <SearchBar />
        <CategoryTabs
          isFoodActive={isFoodActive}
          setIsFoodActive={setIsFoodActive}
        />
        {isFoodActive ? <FoodCategory /> : <LifeCategory />}
      </div>
    </div>
  )
}
