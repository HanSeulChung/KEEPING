import type { NextConfig } from 'next'

const isWindows = process.platform === 'win32'

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  ...(isWindows ? {} : { output: 'standalone' }),
  
  // PWA 최적화
  experimental: {
    optimizeCss: true,
  },
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // 압축
  compress: true,
  
  // PWA 관련 헤더
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default withPWA(nextConfig)
