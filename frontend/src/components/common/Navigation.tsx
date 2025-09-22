'use client'

import { useSidebarStore } from '@/store/useSidebarStore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
}

const Navigation = () => {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarStore()

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: '홈',
      href: '/customer/home',
      icon: (
        <svg
          width={20}
          height={21}
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.4922 18.4844V11.8177C12.4922 11.5967 12.4044 11.3847 12.2481 11.2285C12.0918 11.0722 11.8799 10.9844 11.6589 10.9844H8.32552C8.10451 10.9844 7.89255 11.0722 7.73627 11.2285C7.57999 11.3847 7.49219 11.5967 7.49219 11.8177V18.4844"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.49219 9.3176C2.49213 9.07516 2.54497 8.83562 2.64701 8.6157C2.74906 8.39577 2.89785 8.20076 3.08302 8.04427L8.91635 3.0451C9.21718 2.79086 9.59832 2.65137 9.99219 2.65137C10.3861 2.65137 10.7672 2.79086 11.068 3.0451L16.9014 8.04427C17.0865 8.20076 17.2353 8.39577 17.3374 8.6157C17.4394 8.83562 17.4922 9.07516 17.4922 9.3176V16.8176C17.4922 17.2596 17.3166 17.6836 17.004 17.9961C16.6915 18.3087 16.2675 18.4843 15.8255 18.4843H4.15885C3.71683 18.4843 3.2929 18.3087 2.98034 17.9961C2.66778 17.6836 2.49219 17.2596 2.49219 16.8176V9.3176Z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      activeIcon: (
        <svg
          width={20}
          height={21}
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.4922 18.4844V11.8177C12.4922 11.5967 12.4044 11.3847 12.2481 11.2285C12.0918 11.0722 11.8799 10.9844 11.6589 10.9844H8.32552C8.10451 10.9844 7.89255 11.0722 7.73627 11.2285C7.57999 11.3847 7.49219 11.5967 7.49219 11.8177V18.4844"
            stroke="#4C97D6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.49219 9.3176C2.49213 9.07516 2.54497 8.83562 2.64701 8.6157C2.74906 8.39577 2.89785 8.20076 3.08302 8.04427L8.91635 3.0451C9.21718 2.79086 9.59832 2.65137 9.99219 2.65137C10.3861 2.65137 10.7672 2.79086 11.068 3.0451L16.9014 8.04427C17.0865 8.20076 17.2353 8.39577 17.3374 8.6157C17.4394 8.83562 17.4922 9.07516 17.4922 9.3176V16.8176C17.4922 17.2596 17.3166 17.6836 17.004 17.9961C16.6915 18.3087 16.2675 18.4843 15.8255 18.4843H4.15885C3.71683 18.4843 3.2929 18.3087 2.98034 17.9961C2.66778 17.6836 2.49219 17.2596 2.49219 16.8176V9.3176Z"
            stroke="#4C97D6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'personal-wallet',
      label: '내지갑',
      href: '/customer/myWallet',
      icon: (
        <svg
          width={21}
          height={21}
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.1592 5.15137H3.82585C2.90537 5.15137 2.15918 5.89756 2.15918 6.81803V15.1514C2.15918 16.0718 2.90537 16.818 3.82585 16.818H17.1592C18.0797 16.818 18.8258 16.0718 18.8258 15.1514V6.81803C18.8258 5.89756 18.0797 5.15137 17.1592 5.15137Z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.15918 9.31738H18.8258"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      activeIcon: (
        <svg
          width={21}
          height={21}
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.1592 5.15137H3.82585C2.90537 5.15137 2.15918 5.89756 2.15918 6.81803V15.1514C2.15918 16.0718 2.90537 16.818 3.82585 16.818H17.1592C18.0797 16.818 18.8258 16.0718 18.8258 15.1514V6.81803C18.8258 5.89756 18.0797 5.15137 17.1592 5.15137Z"
            stroke="#4C97D6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.15918 9.31738H18.8258"
            stroke="#4C97D6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: 'group-wallet',
      label: '모임지갑',
      href: '/customer/groupWallet',
      icon: (
        <svg
          width={21}
          height={21}
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_762_2308)">
            <path
              d="M14.0758 18.4844V16.8177C14.0758 15.9337 13.7247 15.0858 13.0995 14.4607C12.4744 13.8356 11.6266 13.4844 10.7425 13.4844H5.74251C4.85846 13.4844 4.01061 13.8356 3.38549 14.4607C2.76037 15.0858 2.40918 15.9337 2.40918 16.8177V18.4844"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.0752 3.59082C14.79 3.77613 15.423 4.19354 15.8749 4.77754C16.3268 5.36154 16.572 6.07906 16.572 6.81749C16.572 7.55591 16.3268 8.27344 15.8749 8.85743C15.423 9.44143 14.79 9.85884 14.0752 10.0442"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.0752 18.4844V16.8178C19.0746 16.0792 18.8288 15.3618 18.3763 14.778C17.9238 14.1943 17.2903 13.7774 16.5752 13.5928"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.24251 10.151C10.0835 10.151 11.5758 8.65866 11.5758 6.81771C11.5758 4.97676 10.0835 3.48438 8.24251 3.48438C6.40156 3.48438 4.90918 4.97676 4.90918 6.81771C4.90918 8.65866 6.40156 10.151 8.24251 10.151Z"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_762_2308">
              <rect
                width={20}
                height={20}
                fill="white"
                transform="translate(0.742188 0.984375)"
              />
            </clipPath>
          </defs>
        </svg>
      ),
      activeIcon: (
        <svg
          width={21}
          height={21}
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_762_2308)">
            <path
              d="M14.0758 18.4844V16.8177C14.0758 15.9337 13.7247 15.0858 13.0995 14.4607C12.4744 13.8356 11.6266 13.4844 10.7425 13.4844H5.74251C4.85846 13.4844 4.01061 13.8356 3.38549 14.4607C2.76037 15.0858 2.40918 15.9337 2.40918 16.8177V18.4844"
              stroke="#4C97D6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.0752 3.59082C14.79 3.77613 15.423 4.19354 15.8749 4.77754C16.3268 5.36154 16.572 6.07906 16.572 6.81749C16.572 7.55591 16.3268 8.27344 15.8749 8.85743C15.423 9.44143 14.79 9.85884 14.0752 10.0442"
              stroke="#4C97D6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.0752 18.4844V16.8178C19.0746 16.0792 18.8288 15.3618 18.3763 14.778C17.9238 14.1943 17.2903 13.7774 16.5752 13.5928"
              stroke="#4C97D6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.24251 10.151C10.0835 10.151 11.5758 8.65866 11.5758 6.81771C11.5758 4.97676 10.0835 3.48438 8.24251 3.48438C6.40156 3.48438 4.90918 4.97676 4.90918 6.81771C4.90918 8.65866 6.40156 10.151 8.24251 10.151Z"
              stroke="#4C97D6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_762_2308">
              <rect
                width={20}
                height={20}
                fill="white"
                transform="translate(0.742188 0.984375)"
              />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      id: 'mypage',
      label: '마이페이지',
      href: '/customer/myPage',
      icon: (
        <svg
          width={21}
          height={21}
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.0758 18.4844V16.8177C16.0758 15.9337 15.7247 15.0858 15.0995 14.4607C14.4744 13.8356 13.6266 13.4844 12.7425 13.4844H7.74251C6.85846 13.4844 6.01061 13.8356 5.38549 14.4607C4.76037 15.0858 4.40918 15.9337 4.40918 16.8177V18.4844"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.2425 10.151C12.0835 10.151 13.5758 8.65866 13.5758 6.81771C13.5758 4.97676 12.0835 3.48438 10.2425 3.48438C8.40156 3.48438 6.90918 4.97676 6.90918 6.81771C6.90918 8.65866 8.40156 10.151 10.2425 10.151Z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      activeIcon: (
        <svg
          width={21}
          height={21}
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.0758 18.4844V16.8177C16.0758 15.9337 15.7247 15.0858 15.0995 14.4607C14.4744 13.8356 13.6266 13.4844 12.7425 13.4844H7.74251C6.85846 13.4844 6.01061 13.8356 5.38549 14.4607C4.76037 15.0858 4.40918 15.9337 4.40918 16.8177V18.4844"
            stroke="#4C97D6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.2425 10.151C12.0835 10.151 13.5758 8.65866 13.5758 6.81771C13.5758 4.97676 12.0835 3.48438 10.2425 3.48438C8.40156 3.48438 6.90918 4.97676 6.90918 6.81771C6.90918 8.65866 8.40156 10.151 10.2425 10.151Z"
            stroke="#4C97D6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* 모바일 하단 탭 */}
      <div className="fixed right-0 bottom-0 left-0 z-50 md:hidden">
        <div className="flex h-[2.9375rem] w-full items-start border-t border-gray-200 bg-white">
          {navigationItems.map(item => {
            const active = isActive(item.href)
            const currentIcon = active ? item.activeIcon : item.icon

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex min-h-[2.9375rem] flex-1 flex-col items-center justify-center px-3 py-2 transition-colors ${
                  active ? 'text-[#4C97D6]' : 'text-black'
                }`}
              >
                <div className="mb-1 flex items-center justify-center">
                  {currentIcon}
                </div>
                <span
                  className={`text-xs leading-3 font-extrabold ${
                    active ? 'text-[#4C97D6]' : 'text-black'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 웹 사이드바 */}
      <div
        className={`fixed top-0 left-0 z-40 hidden h-full border-r border-gray-200 bg-white transition-all duration-300 md:block ${
          isOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="p-6">
          <div className="mb-8 flex items-center justify-between">
            {isOpen && (
              <h1 className="text-xl font-extrabold text-black">KEEPING</h1>
            )}
            <button
              onClick={toggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
              aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'}
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-600"
              >
                <path
                  d={isOpen ? 'M15 18L9 12L15 6' : 'M9 18L15 12L9 6'}
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map(item => {
              const active = isActive(item.href)
              const currentIcon = active ? item.activeIcon : item.icon

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center rounded-lg px-4 py-3 transition-colors ${
                    isOpen ? 'space-x-3' : 'justify-center'
                  } ${
                    active
                      ? 'bg-[#4C97D6]/10 text-[#4C97D6]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <div className="flex-shrink-0">{currentIcon}</div>
                  {isOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Navigation
