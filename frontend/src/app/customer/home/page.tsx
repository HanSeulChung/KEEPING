'use client'
import { CategoryTabs } from '@/components/customer/home/CategoryTabs'
import { FoodCategory } from '@/components/customer/home/FoodCategory'
import { HeaderCards } from '@/components/customer/home/HeaderCards'
import { LifeCategory } from '@/components/customer/home/LifeCategory'
import { SearchBar } from '@/components/customer/home/SearchBar'
import { useUser } from '@/contexts/UserContext'
import { useState } from 'react'

export default function Page() {
  const [isFoodActive, setIsFoodActive] = useState(true)
  const { user, loading, error } = useUser()
  console.log('홈페이지 - useUser 상태:', { user, loading, error }) 
  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-6">
        <div className="w-full max-w-4xl">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
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