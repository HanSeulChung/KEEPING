'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export const LifeCategory = () => {
  const router = useRouter()

  const lifeItems = [
    { src: '/home/life/hair.svg', alt: 'hair', category: '헤어' },
    { src: '/home/life/beauty.svg', alt: 'beauty', category: '뷰티' },
    { src: '/home/life/flower.svg', alt: 'flower', category: '꽃' },
    {
      src: '/home/life/entertainment.svg',
      alt: 'entertainment',
      category: '엔터테인먼트',
    },
    { src: '/home/life/sports.svg', alt: 'sports', category: '스포츠' },
    { src: '/home/life/car.svg', alt: 'car', category: '자동차' },
    { src: '/home/life/pet.svg', alt: 'pet', category: '펫' },
    { src: '/home/life/alcohol.svg', alt: 'alcohol', category: '주류' },
    { src: '/home/life/class.svg', alt: 'class', category: '클래스' },
    { src: '/home/life/items.svg', alt: 'items', category: '용품' },
  ]

  const handleCategoryClick = (category: string) => {
    router.push(
      `/customer/list?type=life&category=${encodeURIComponent(category)}`
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 md:gap-3 lg:grid-cols-5 lg:gap-4">
        {lifeItems.map((item, index) => (
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
