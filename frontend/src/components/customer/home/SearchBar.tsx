import Image from 'next/image'

export const SearchBar = () => {
  return (
    <div className="mb-6 w-full">
      <div className="flex h-[41px] border border-solid border-black bg-white">
        <div className="flex flex-1 items-center px-3">
          <input
            type="text"
            placeholder="지역 검색"
            className="w-full border-none text-sm outline-none"
          />
        </div>
        <button className="flex h-[41px] w-9 items-center justify-center bg-[#1f2937] transition-colors hover:bg-[#374151]">
          <Image
            src="/home/searchbar/search.svg"
            alt="Search icon"
            width={15}
            height={15}
          />
        </button>
      </div>
    </div>
  )
}
