import { NextRequest, NextResponse } from 'next/server'

import { buildURL } from '@/api/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('점주 회원가입 요청:', body)

    // 백엔드 API 호출
    const response = await fetch(buildURL('/auth/signup/owner'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // 회원가입 성공 시 refresh token 쿠키 설정
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
    console.error('점주 회원가입 오류:', error)
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
