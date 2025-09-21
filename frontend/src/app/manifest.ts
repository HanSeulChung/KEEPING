// manifest: 앱 메타데이터(이름, 아이콘, 시작 경로, 표시 모드, 색상 등).

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KEEPING',
    short_name: 'KEEPING',
    description: 'KEEPING PWA',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F6',
    theme_color: '#000000',
    icons: [
      {
        src: 'icons/qr.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      }, // svg는 불가한가?
      {
        src: 'icons/qr.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

// any: 일반 정사각 아이콘.
// maskable: 안드로이드 적응형 아이콘 마스크에 잘리더라도 안전한 여백을 가진 아이콘.
// PNG/비트맵은 ‘실제 픽셀’ = sizes 일치, SVG는 any, ICO는 여러 크기 공백 구분!