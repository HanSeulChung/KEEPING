import { NextRequest, NextResponse } from 'next/server'

import { buildURL } from '@/api/config'

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 refresh token 추출
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'refreshToken이 없습니다.' },
        { status: 401 }
      )
    }

    // 백엔드 API 호출
    const response = await fetch(buildURL('/auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refreshToken=${refreshToken}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // 새로운 refresh token이 있다면 쿠키에 설정
    if (data.data?.refreshToken) {
      const nextResponse = NextResponse.json(data)
      nextResponse.cookies.set('refreshToken', data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7일
      })
      return nextResponse
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('토큰 갱신 오류:', error)
    return NextResponse.json(
      { error: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
