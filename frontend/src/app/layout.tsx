import type { Metadata } from 'next'

import SWRegister from '@/providers/SWRegister'
import './globals.css'

// Tenada 폰트 설정 (미사용 시 비활성화)
/* const tenada = localFont({
  src: './fonts/Tenada.ttf',
  variable: '--font-tenada',
  display: 'swap',
}) */

// NanumSquareNeo 시리즈 폰트 설정
/* const nanumSquareNeo = localFont({
  src: [
    {
      path: './fonts/NanumSquareNeo-aLt.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/NanumSquareNeo-bRg.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/NanumSquareNeo-cBd.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/NanumSquareNeo-dEb.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/NanumSquareNeo-eHv.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-nanum-square-neo',
  display: 'swap',
}) */

export const metadata: Metadata = {
  title: 'Keeping',
  description: '선결제 디지털 플랫폼',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {/* 브라우저에서만 실행되는 SW 등록기 */}
        {children}
        <SWRegister />
      </body>
    </html>
  )
}
