import type { Metadata } from 'next'
import React from 'react'

import ConditionalLayout from '@/components/ConditionalLayout'
import AuthProvider from '@/providers/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Keeping',
  description: '선결제 디지털 플랫폼',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* 폰트 preload로 로딩 최적화 */}
        <link
          rel="preload"
          href="/fonts/NanumSquareNeo-bRg.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Tenada.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* 다음 우편번호 API */}
        <script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          async
        ></script>

        {/* Service Worker 등록 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker 등록 성공:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('Service Worker 등록 실패:', error);
                    });

                  // Firebase Messaging Service Worker 등록
                  navigator.serviceWorker.register('/firebase-messaging-sw.js')
                    .then(function(registration) {
                      console.log('FCM Service Worker 등록 성공:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('FCM Service Worker 등록 실패:', error);
                    });
                });
              }
            `
          }}
        />
      </head>
      <body className="bg-white text-black antialiased">
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
