import { NextRequest, NextResponse } from 'next/server'

import { buildURL } from '@/api/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('OTP 요청 (원본):', body)

    // birth 포맷팅 (YYMMDD -> YYYY-MM-DD)
    if (body.birth && body.birth.length === 6) {
      body.birth = `20${body.birth.slice(0, 2)}-${body.birth.slice(2, 4)}-${body.birth.slice(4, 6)}`
    }

    // purpose 필드 제거 (백엔드에서 인식하지 않음)
    delete body.purpose

    console.log('OTP 요청 (포맷팅 후):', body)

    // 백엔드 API 호출 (경로 자동 폴백: /api/v1 → /v1 → /otp → /api/otp)
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
      ? ['/v1/otp/request', '/otp/request', '/api/otp/request']
      : ['/api/v1/otp/request', '/api/otp/request', '/otp/request']

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
        'OTP 요청: 백엔드 호출 실패, base=',
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
      'OTP 요청: 선택된 백엔드 경로',
      tried[tried.length - 1],
      'status=',
      response.status
    )

    const rawText = await response.text()
    let data: any = {}
    try {
      data = rawText ? JSON.parse(rawText) : {}
    } catch {}

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: response.status,
          message: data?.message || 'OTP 요청 백엔드 오류',
          backend: {
            raw: rawText || null,
          },
        },
        { status: response.status }
      )
    }

    // 백엔드 응답에서 쿠키 읽어서 regSessionId 추출
    const setCookieHeader = response.headers.get('set-cookie')
    let regSessionId = null

    if (setCookieHeader) {
      const cookies = setCookieHeader.split(',')
      const regSessionIdCookie = cookies.find(cookie =>
        cookie.trim().startsWith('regSessionId=')
      )
      if (regSessionIdCookie) {
        regSessionId = regSessionIdCookie.split('=')[1].split(';')[0]
        console.log('백엔드 응답에서 regSessionId 추출:', regSessionId)
      }
    }

    // 응답에 regSessionId 추가
    if (regSessionId) {
      data.data = data.data || {}
      data.data.regSessionId = regSessionId
      console.log('응답에 regSessionId 추가:', regSessionId)
    }

    // 백엔드에서 설정한 쿠키를 프론트엔드로 전달
    const nextResponse = NextResponse.json(data)
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader)
    }

    return nextResponse
  } catch (error) {
    console.error('OTP 요청 오류:', error)
    return NextResponse.json(
      { error: 'OTP 요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
