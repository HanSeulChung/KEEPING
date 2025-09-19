import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('OTP 검증:', body)

    // 백엔드 API 호출
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    
    const response = await fetch(`${backendUrl}/otp/verify`, {
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

    return NextResponse.json(data)

  } catch (error) {
    console.error('OTP 검증 오류:', error)
    return NextResponse.json(
      { error: 'OTP 검증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
