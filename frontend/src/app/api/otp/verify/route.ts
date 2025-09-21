import { NextRequest, NextResponse } from 'next/server'

import { buildURL } from '@/api/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('OTP 검증 (원본):', body)

    // 백엔드 API 호출
    // 백엔드로 요청할 때 쿠키 전달
    const response = await fetch(buildURL('/otp/verify'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // 백엔드에서 설정한 쿠키를 프론트엔드로 전달
    const nextResponse = NextResponse.json(data)
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader)
    }

    return nextResponse

  } catch (error) {
    console.error('OTP 검증 오류:', error)
    return NextResponse.json(
      { error: 'OTP 검증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}