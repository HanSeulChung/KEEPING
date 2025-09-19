import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 regSessionId 추출
    const regSessionId = request.cookies.get('regSessionId')?.value
    
    if (!regSessionId) {
      return NextResponse.json(
        { success: false, error: 'regSessionId가 없습니다.' },
        { status: 400 }
      )
    }

    console.log('세션에서 regSessionId 추출:', regSessionId)

    return NextResponse.json({
      success: true,
      data: {
        regSessionId: regSessionId
      }
    })

  } catch (error) {
    console.error('세션 정보 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '세션 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
