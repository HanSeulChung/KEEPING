// 정부 사업자등록번호 진위확인 API

// 요청 데이터 타입
export interface BusinessVerificationRequest {
  b_no: string     // 사업자등록번호 (필수)
  start_dt: string // 개업일자 (필수, YYYYMMDD)
  p_nm: string     // 대표자성명 (필수)
}

// 응답 데이터 타입
export interface BusinessVerificationResponse {
  status_code: string // "OK" 등
  request_cnt: number
  valid_cnt: number
  data: BusinessData[]
}

export interface BusinessData {
  b_no: string // 사업자등록번호
  valid: string // 진위확인 결과 ("01": 유효)
  valid_msg: string // 진위확인 메시지
  request_param: BusinessRequestParam // 요청했던 파라미터
  status: BusinessStatus // 사업자 상태 정보
}

export interface BusinessRequestParam {
  b_no: string
  start_dt: string
  p_nm: string
  p_nm2: string
  b_nm: string
  corp_no: string
  b_sector: string
  b_type: string
  b_adr: string
}

export interface BusinessStatus {
  b_no: string // 사업자등록번호
  b_stt: string // 납세자상태 (계속사업자, 휴업자, 폐업자)
  b_stt_cd: string // 납세자상태코드 (01, 02, 03)
  tax_type: string // 과세유형메시지
  tax_type_cd: string // 과세유형코드
  end_dt: string // 폐업일자
  utcc_yn: string // 단위과세전환폐업여부
  tax_type_change_dt: string // 과세유형전환일자
  invoice_apply_dt: string // 세금계산서적용일자
  rbf_tax_type: string // 직전과세유형메시지
  rbf_tax_type_cd: string // 직전과세유형코드
}

// 사업자등록번호 진위확인 API (정부 API 직접 호출)
export const verifyBusinessRegistration = async (
  businessData: BusinessVerificationRequest
): Promise<BusinessVerificationResponse> => {
  try {
    const serviceKey = process.env.NEXT_PUBLIC_BUSINESS_VERIFY_SERVICE_KEY

    if (!serviceKey) {
      throw new Error('사업자 검증 서비스 키가 설정되지 않았습니다.')
    }

    // 사업자등록번호에서 '-' 제거
    const cleanBusinessNo = businessData.b_no.replace(/-/g, '')
    // 개업일자에서 '-' 제거
    const cleanStartDate = businessData.start_dt.replace(/-/g, '')

    const requestData = {
      businesses: [
        {
          b_no: cleanBusinessNo,
          start_dt: cleanStartDate,
          p_nm: businessData.p_nm,
          p_nm2: "", // 외국인이 아닌 경우 빈값
          b_nm: "", // 상호 (선택사항)
          corp_no: "", // 법인등록번호 (선택사항)
          b_sector: "", // 주업태명 (선택사항)
          b_type: "", // 주종목명 (선택사항)
          b_adr: "" // 사업장주소 (선택사항)
        }
      ]
    }

    const url = `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${serviceKey}&returnType=JSON`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('사업자등록번호 진위확인 실패:', error)
    throw error
  }
}