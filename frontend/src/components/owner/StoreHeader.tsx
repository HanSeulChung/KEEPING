'use client'

interface StoreHeaderProps {
  storeName?: string
  accountName?: string
  title?: string
}

const StoreHeader = ({ storeName, accountName, title = 'STORE MANAGEMENT' }: StoreHeaderProps) => {
  return (
    <div className="w-full border border-black bg-white">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-center font-['Tenada'] text-2xl font-extrabold text-black sm:text-3xl lg:text-4xl">
          {title}
        </h1>
      </div>
    </div>
  )
}

export default StoreHeader
