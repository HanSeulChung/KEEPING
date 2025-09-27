import { NextRequest, NextResponse } from 'next/server'

import { buildURL } from '@/api/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('OTP 검증 (원본):', body)

    // 백엔드 API 호출 (v1 우선, 404 시 구경로 폴백)
    const callBackend = async (path: string) => {
      return fetch(buildURL(path), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
      })
    }

    const base = buildURL('')
    const baseHasApi = base.endsWith('/api')
    const candidates = baseHasApi
      ? ['/v1/otp/verify', '/otp/verify', '/api/otp/verify']
      : ['/api/v1/otp/verify', '/api/otp/verify', '/otp/verify']

    let response: Response | null = null
    let lastError: any = null
    let tried: string[] = []
    for (const p of candidates) {
      try {
        tried.push(p)
        const r = await callBackend(p)
        if (r.status !== 404) {
          response = r
          break
        }
      } catch (e) {
        lastError = e
      }
    }

    if (!response) {
      console.error(
        'OTP 검증: 백엔드 호출 실패, base=',
        base,
        'tried=',
        tried,
        'err=',
        lastError
      )
      return NextResponse.json(
        { success: false, message: '백엔드 연결 실패' },
        { status: 502 }
      )
    }
    console.log(
      'OTP 검증: 선택된 백엔드 경로',
      tried[tried.length - 1],
      'status=',
      response.status
    )

    const data = await response.json().catch(() => ({}))

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
