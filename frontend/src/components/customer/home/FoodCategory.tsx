'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export const FoodCategory = () => {
  const router = useRouter()

  const foodItems = [
    { src: '/home/food/korean.svg', alt: 'Korean food', category: '한식' },
    { src: '/home/food/chinese.svg', alt: 'Chinese food', category: '중식' },
    { src: '/home/food/japanese.svg', alt: 'Japanese food', category: '일식' },
    { src: '/home/food/western.svg', alt: 'Western food', category: '양식' },
    { src: '/home/food/streetFood.svg', alt: 'Street food', category: '분식' },
    { src: '/home/food/asian.svg', alt: 'Asian food', category: '아시안' },
    {
      src: '/home/food/fastfood.svg',
      alt: 'Fast food',
      category: '패스트푸드',
    },
    { src: '/home/food/cafe.svg', alt: 'Cafe', category: '카페' },
    { src: '/home/food/grocery.svg', alt: 'Grocery', category: '식료품' },
    { src: '/home/food/mealkit.svg', alt: 'Meal kit', category: '반찬/밀키트' },
  ]

  const handleCategoryClick = (category: string) => {
    router.push(`/customer/list?category=${encodeURIComponent(category)}`)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 md:gap-3 lg:grid-cols-5 lg:gap-4">
        {foodItems.map((item, index) => (
          <div
            key={index}
            className="aspect-square cursor-pointer transition-transform hover:scale-102"
            onClick={() => handleCategoryClick(item.category)}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={130}
              height={130}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
