'use client'
import Image from 'next/image'

interface CategoryTabsProps {
  isFoodActive: boolean
  setIsFoodActive: (active: boolean) => void
}

export const CategoryTabs = ({
  isFoodActive,
  setIsFoodActive,
}: CategoryTabsProps) => {
  return (
    <div className="mb-6 w-full">
      <div className="flex gap-2">
        <div className="group relative">
          <button
            onClick={() => setIsFoodActive(true)}
            className={`flex h-[31px] items-center gap-2 border border-solid border-black px-3 transition-colors ${
              isFoodActive ? 'bg-[#efefef]' : 'bg-white hover:bg-[#efefef]'
            }`}
          >
            <Image
              src="/home/category/food.svg"
              alt="Free icon restaurant"
              width={20}
              height={20}
              className="object-cover"
            />
            <span className="font-nanum text-xs leading-6 font-normal tracking-[0] text-black">
              FOOD
            </span>
          </button>
          <Image
            src="/home/category/shadow.svg"
            alt="Shadow"
            width={87}
            height={2}
            className={`absolute left-0.25 ${
              isFoodActive ? 'top-[1px]' : 'top-[31px]'
            }`}
          />
        </div>

        <div className="group relative">
          <button
            onClick={() => setIsFoodActive(false)}
            className={`flex h-[31px] items-center gap-2 border border-solid border-black px-3 transition-colors ${
              !isFoodActive ? 'bg-[#efefef]' : 'bg-white hover:bg-[#efefef]'
            }`}
          >
            <Image
              src="/home/category/life.svg"
              alt="Free icon online"
              width={20}
              height={20}
              className="object-cover"
            />
            <span className="font-nanum text-xs leading-6 font-normal tracking-[0] text-black">
              LIFE
            </span>
          </button>
          <Image
            src="/home/category/shadow.svg"
            alt="Shadow"
            width={87}
            height={2}
            className={`absolute left-0.25 ${
              !isFoodActive ? 'top-[1px]' : 'top-[31px]'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
