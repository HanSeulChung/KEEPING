import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 refresh token 추출
    const refreshToken = request.cookies.get('refreshToken')?.value

    // 백엔드 API 호출
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    
    const response = await fetch(`${backendUrl}/auth/logout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': refreshToken ? `refreshToken=${refreshToken}` : ''
      }
    })

    const data = await response.json()

    // 로그아웃 응답 생성 (refresh token 쿠키 제거)
    const nextResponse = NextResponse.json(data)
    nextResponse.cookies.delete('refreshToken')

    return nextResponse

  } catch (error) {
    console.error('로그아웃 오류:', error)
    
    // 오류가 발생해도 쿠키는 제거
    const nextResponse = NextResponse.json(
      { success: true, message: '로그아웃 완료' },
      { status: 200 }
    )
    nextResponse.cookies.delete('refreshToken')
    
    return nextResponse
  }
}
