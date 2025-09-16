'use client'

import React from 'react'
import Calendar from './Calendar'

export default function CreateMenuModal() {
  return (
    <div className="flex w-[1440px] flex-col items-center gap-11 bg-[#faf8f6] px-0 pt-2 pb-9">
      {/* Top bar */}
      <div className="flex h-[3.0625rem] w-[1440px] items-start justify-between border-t border-b border-[#000]">
        <div className="flex items-center justify-center gap-2.5 self-stretch border-t border-r border-b border-[#000] p-2.5">
          <div className="flex items-center gap-2.5">
            <svg
              width={11}
              height={15}
              viewBox="0 0 11 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.81665 14.75L0.81665 7.5L8.81665 0.25L10.6833 1.94167L4.54998 7.5L10.6833 13.0583L8.81665 14.75Z"
                fill="#1D1B20"
              />
            </svg>
          </div>
        </div>
        <div className="keeping flex w-[937px] flex-shrink-0 flex-col items-start justify-center self-stretch border-t border-b border-[#000] p-2.5 text-center font-['Tenada'] text-[1.0625rem] leading-7 font-extrabold text-black">
          KEEPING
        </div>
        <div className="flex items-center justify-center gap-2.5 self-stretch border-t border-b border-l border-[#000] p-2.5">
          <div className="flex h-[2.1875rem] w-[4.5625rem] items-center justify-center rounded border border-black bg-white text-center text-[11px] leading-5 font-bold text-black">
            로그아웃
          </div>
          <svg
            width={75}
            height={37}
            viewBox="0 0 75 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.75"
              y="1.00195"
              width="72.9941"
              height="34.9961"
              fill="white"
            />
            <rect
              x="0.75"
              y="1.00195"
              width="72.9941"
              height="34.9961"
              stroke="black"
            />
            <path
              d="M36.3062 26.335C36.4524 26.5883 36.6628 26.7987 36.9162 26.945C37.1695 27.0912 37.4569 27.1682 37.7495 27.1682C38.042 27.1682 38.3294 27.0912 38.5828 26.945C38.8361 26.7987 39.0465 26.5883 39.1928 26.335"
              stroke="black"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M30.4677 21.607C30.3589 21.7263 30.287 21.8747 30.2609 22.0341C30.2349 22.1934 30.2557 22.357 30.3208 22.5048C30.386 22.6526 30.4927 22.7782 30.6279 22.8665C30.7632 22.9548 30.9212 23.0018 31.0827 23.002H44.4161C44.5776 23.002 44.7356 22.9551 44.8709 22.867C45.0063 22.7789 45.1131 22.6534 45.1785 22.5057C45.2438 22.358 45.2648 22.1945 45.2389 22.0351C45.2131 21.8757 45.1414 21.7272 45.0327 21.6078C43.9244 20.4653 42.7494 19.2511 42.7494 15.502C42.7494 14.1759 42.2226 12.9041 41.2849 11.9664C40.3472 11.0287 39.0755 10.502 37.7494 10.502C36.4233 10.502 35.1515 11.0287 34.2139 11.9664C33.2762 12.9041 32.7494 14.1759 32.7494 15.502C32.7494 19.2511 31.5736 20.4653 30.4677 21.607Z"
              stroke="black"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Main card */}
      <div className="flex w-[937px] flex-col items-center justify-between border border-black bg-white px-[2.875rem] py-[2.5625rem]">
        <Calendar />
      </div>
    </div>
  )
}
