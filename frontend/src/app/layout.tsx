import type { Metadata } from "next";
import React from "react";

import Header from "@/components/common/Header";
import SWRegister from "@/providers/SWRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keeping",
  description: "선결제 디지털 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* 폰트 preload로 로딩 최적화 */}
        <link
          rel="preload"
          href="/src/app/fonts/NanumSquareNeo-bRg.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/src/app/fonts/Tenada.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-white text-black">
        {/* 공통 Header */}
        <Header />

        {/* 페이지별 컨텐츠 */}
        <main className="min-h-screen">{children}</main>
        <SWRegister />
      </body>
    </html>
  );
}
