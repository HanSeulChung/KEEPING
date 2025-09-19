'use client'
import { CategoryTabs } from '@/components/customer/home/CategoryTabs'
import { FoodCategory } from '@/components/customer/home/FoodCategory'
import { HeaderCards } from '@/components/customer/home/HeaderCards'
import { LifeCategory } from '@/components/customer/home/LifeCategory'
import { SearchBar } from '@/components/customer/home/SearchBar'
import { useState } from 'react'

export default function Page() {
  const [isFoodActive, setIsFoodActive] = useState(true)

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
