// src/app/api/user/route.ts
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Route 시작')
    const cookieStore = await cookies()
    const jsessionId = cookieStore.get('JSESSIONID')?.value
    const refreshToken = cookieStore.get('refreshToken')?.value
    
    console.log('쿠키 확인:', { jsessionId, refreshToken })
    
    if (!jsessionId && !refreshToken) {
      console.log('쿠키가 없음')
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL
    console.log('백엔드 URL:', backendUrl)

    if (!backendUrl) {
      console.error('❌ BACKEND_URL 환경변수가 설정되지 않음')
      return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 })
    }

    const response = await fetch(`${backendUrl}/auth/user/info`, {
      headers: {
        'Cookie': `JSESSIONID=${jsessionId}; refreshToken=${refreshToken}`
      }
    })

    console.log('백엔드 응답:', response.status)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch user info' }, { status: response.status })
    }

    const userData = await response.json()
    console.log('✅ 사용자 데이터:', userData)
    return NextResponse.json(userData)

  } catch (error) {
    console.error('❌ API Route 에러:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}