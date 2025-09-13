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
      <body className="antialiased bg-white text-black">
        {/* 공통 Header */}
        <Header />

        {/* 페이지별 컨텐츠 */}
        <main className="min-h-screen">{children}</main>

        {/* 서비스워커: 앱 전역에서 한 번만 등록 */}
        <SWRegister />
      </body>
    </html>
  );
}
