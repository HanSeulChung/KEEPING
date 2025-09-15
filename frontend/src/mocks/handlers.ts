import { http, HttpResponse } from 'msw'

// ===== Mock 데이터 =====

// 사용자 Mock 데이터
const mockUsers = {
  customer: {
    id: '1',
    accountName: 'customer123',
    name: '김고객',
    phone: '010-1234-5678',
    email: 'customer@example.com',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  owner: {
    id: '2',
    accountName: 'owner123',
    name: '박사장',
    phone: '010-9876-5432',
    email: 'owner@example.com',
    businessNumber: '123-45-67890',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  }
}

// 매장 정보 Mock 데이터
const mockStores: any[] = [
  {
    id: '1',
    name: '서울 초밥',
    ownerId: '2',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    description: '신선한 생선으로 만드는 정통 초밥집',
    images: [
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
    ],
    isLiked: false,
    likeCount: 15
  },
  {
    id: '2',
    name: '부산 회집',
    ownerId: '2',
    address: '부산시 해운대구 해운대로 456',
    phone: '051-2345-6789',
    description: '부산 바다의 신선한 회를 맛볼 수 있는 곳',
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop'
    ],
    isLiked: true,
    likeCount: 23
  }
]

// 그룹 Mock 데이터
const mockGroups: any[] = [
  {
    id: '1',
    name: '초밥러버스',
    description: '초밥을 사랑하는 사람들의 모임',
    leaderId: '1',
    memberCount: 5,
    maxMembers: 10,
    isPrivate: false,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: '회식 모임',
    description: '직장 동료들과의 회식 모임',
    leaderId: '1',
    memberCount: 8,
    maxMembers: 12,
    isPrivate: true,
    createdAt: '2024-01-20T14:30:00Z'
  }
]

// 그룹 멤버 Mock 데이터
const mockGroupMembers: any[] = [
  { id: '1', groupId: '1', userId: '1', role: 'LEADER', joinedAt: '2024-01-15T10:00:00Z' },
  { id: '2', groupId: '1', userId: '3', role: 'MEMBER', joinedAt: '2024-01-16T09:00:00Z' },
  { id: '3', groupId: '1', userId: '4', role: 'MEMBER', joinedAt: '2024-01-17T11:00:00Z' }
]

// 그룹 가입 요청 Mock 데이터
const mockGroupRequests: any[] = [
  {
    id: '1',
    groupId: '1',
    userId: '5',
    status: 'PENDING',
    requestedAt: '2024-01-18T15:00:00Z'
  }
]

// 메뉴 Mock 데이터
const mockMenus: any[] = [
  {
    id: '1',
    storeId: '1',
    name: '도미정식 1人',
    price: 39000,
    description: '도라지탕 + 도미숙성회 + 도미머리구이 + 모듬튀김 + 도미해물라면 OR 도미덮밥',
    category: '식사',
    isAvailable: true
  },
  {
    id: '2',
    storeId: '1',
    name: '연어정식 1人',
    price: 35000,
    description: '연어숙성회 + 연어머리구이 + 모듬튀김 + 연어해물라면 OR 연어덮밥',
    category: '식사',
    isAvailable: true
  },
  {
    id: '3',
    storeId: '1',
    name: '특선초밥 12貫', 
    price: 25000,
    description: '계절 생선으로 구성된 특선 초밥 12개',
    category: '초밥',
    isAvailable: true
  },
  {
    id: '4',
    storeId: '1',
    name: '우니초밥 1貫',
    price: 8000,
    description: '프리미엄 우니(성게알) 초밥',
    category: '초밥',
    isAvailable: false
  }
]

// 메뉴 카테고리 Mock 데이터
const mockCategories: any[] = [
  { id: '1', storeId: '1', name: '식사', order: 1 },
  { id: '2', storeId: '1', name: '초밥', order: 2 },
  { id: '3', storeId: '1', name: '사시미', order: 3 }
]

// 할인/포인트 설정 Mock 데이터
const mockDiscountPoints: any[] = [
  { id: '1', storeId: '1', points: 50000, discount: 5 },
  { id: '2', storeId: '1', points: 100000, discount: 10 },
  { id: '3', storeId: '1', points: 150000, discount: 15 },
  { id: '4', storeId: '1', points: 200000, discount: 20 },
  { id: '5', storeId: '1', points: 250000, discount: 25 }
]

// OTP Mock 데이터
const mockOtpData = {
  '010-1234-5678': '123456',
  '010-9876-5432': '654321'
}

export const handlers = [
  // ===== 인증 관련 API =====
  
  // 로그아웃
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: '로그아웃 성공' })
  }),

  // 토큰 갱신
  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({ 
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    })
  }),

  // 소셜 로그인 (카카오, 구글)
  http.post('/api/auth/:provider/login', async ({ params, request }) => {
    const { provider } = params
    const body = await request.json()
    
    console.log(`MSW: 소셜 로그인 요청 - Provider: ${provider}`, body)
    
    // Mock 응답
    const response = {
      accessToken: `${provider}-access-token`,
      refreshToken: `${provider}-refresh-token`,
      user: provider === 'kakao' ? mockUsers.customer : mockUsers.owner
    }
    
    console.log('MSW: 소셜 로그인 응답:', response)
    return HttpResponse.json(response)
  }),

  // OTP 요청
  http.post('/api/otp/request', async ({ request }) => {
    const body = await request.json() as { phone: string }
    const { phone } = body
    
    // Mock OTP 저장
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    ;(mockOtpData as any)[phone] = otp
    
    return HttpResponse.json({ message: 'OTP가 전송되었습니다.' })
  }),

  // OTP 인증
  http.post('/api/otp/verify', async ({ request }) => {
    const body = await request.json() as { phone: string; otp: string }
    const { phone, otp } = body
    
    if ((mockOtpData as any)[phone] === otp) {
      return HttpResponse.json({ 
        message: '인증 성공',
        accessToken: 'otp-access-token',
        refreshToken: 'otp-refresh-token'
      })
    }
    
    return HttpResponse.json({ error: '인증 실패' }, { status: 400 })
  }),

  // ===== 고객/사장 관련 API =====
  
  // 고객 회원가입
  http.post('/api/customers', async ({ request }) => {
    const newCustomer = await request.json() as Record<string, any>
    return HttpResponse.json({
      id: Date.now().toString(),
      ...newCustomer
    }, { status: 201 })
  }),

  // 고객 정보 조회
  http.get('/api/customers/me', () => {
    return HttpResponse.json(mockUsers.customer)
  }),

  // 사장 회원가입
  http.post('/api/owners', async ({ request }) => {
    const newOwner = await request.json() as Record<string, any>
    return HttpResponse.json({
      id: Date.now().toString(),
      ...newOwner
    }, { status: 201 })
  }),

  // ===== 그룹 관련 API =====
  
  // 그룹 생성
  http.post('/api/groups', async ({ request }) => {
    const newGroup = await request.json() as Record<string, any>
    const createdGroup = {
      id: Date.now().toString(),
      ...newGroup,
      memberCount: 1,
      createdAt: new Date().toISOString()
    }
    mockGroups.push(createdGroup)
    return HttpResponse.json(createdGroup, { status: 201 })
  }),

  // 그룹 조회
  http.get('/api/groups/:groupId', ({ params }) => {
    const { groupId } = params
    const group = mockGroups.find(g => g.id === groupId)
    if (group) {
      return HttpResponse.json(group)
    }
    return HttpResponse.json({ error: 'Group not found' }, { status: 404 })
  }),

  // 그룹 멤버 목록 조회
  http.get('/api/groups/:groupId/group-members', ({ params }) => {
    const { groupId } = params
    const members = mockGroupMembers.filter(m => m.groupId === groupId)
    return HttpResponse.json(members)
  }),

  // 그룹 가입 요청
  http.post('/api/groups/:groupId/add-requests', async ({ params, request }) => {
    const { groupId } = params
    const requestData = await request.json() as Record<string, any>
    const newRequest = {
      id: Date.now().toString(),
      groupId: groupId as string,
      ...requestData,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    }
    mockGroupRequests.push(newRequest)
    return HttpResponse.json(newRequest, { status: 201 })
  }),

  // 그룹 가입 요청 목록 조회 (대기 중)
  http.get('/api/groups/:groupId/add-requests', ({ params, request }) => {
    const { groupId } = params
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    
    let requests = mockGroupRequests.filter(r => r.groupId === groupId)
    if (status) {
      requests = requests.filter(r => r.status === status)
    }
    
    return HttpResponse.json(requests)
  }),

  // 그룹 가입 요청 응답
  http.put('/api/groups/:groupId/add-requests/:requestId', async ({ params, request }) => {
    const { groupId, requestId } = params
    const { status } = await request.json() as { status: string }
    
    const requestIndex = mockGroupRequests.findIndex(r => r.id === requestId)
    if (requestIndex !== -1) {
      mockGroupRequests[requestIndex].status = status
      
      if (status === 'APPROVED') {
        // 그룹 멤버로 추가
        const newMember = {
          id: Date.now().toString(),
          groupId: groupId as string,
          userId: mockGroupRequests[requestIndex].userId,
          role: 'MEMBER',
          joinedAt: new Date().toISOString()
        }
        mockGroupMembers.push(newMember)
      }
      
      return HttpResponse.json(mockGroupRequests[requestIndex])
    }
    
    return HttpResponse.json({ error: 'Request not found' }, { status: 404 })
  }),

  // 그룹 입장
  http.post('/api/groups/:groupId/entrance', async ({ params, request }) => {
    const { groupId } = params
    const body = await request.json() as Record<string, any>
    
    const newMember = {
      id: Date.now().toString(),
      groupId: groupId as string,
      ...body,
      role: 'MEMBER',
      joinedAt: new Date().toISOString()
    }
    mockGroupMembers.push(newMember)
    
    return HttpResponse.json(newMember, { status: 201 })
  }),

  // 그룹명으로 검색
  http.get('/api/groups', ({ request }) => {
    const url = new URL(request.url)
    const name = url.searchParams.get('name')
    
    if (name) {
      const filteredGroups = mockGroups.filter(g => 
        g.name.toLowerCase().includes(name.toLowerCase())
      )
      return HttpResponse.json(filteredGroups)
    }
    
    return HttpResponse.json(mockGroups)
  }),

  // 그룹 리더 변경
  http.put('/api/groups/:groupId/group-leader', async ({ params, request }) => {
    const { groupId } = params
    const { newLeaderId } = await request.json() as { newLeaderId: string }
    
    // 기존 리더를 멤버로 변경
    const oldLeader = mockGroupMembers.find(m => m.groupId === groupId && m.role === 'LEADER')
    if (oldLeader) {
      oldLeader.role = 'MEMBER'
    }
    
    // 새 리더 설정
    const newLeader = mockGroupMembers.find(m => m.groupId === groupId && m.userId === newLeaderId)
    if (newLeader) {
      newLeader.role = 'LEADER'
    }
    
    return HttpResponse.json({ message: '리더가 변경되었습니다.' })
  }),

  // 그룹 멤버 제거
  http.delete('/api/groups/:groupId/group-member/:memberId', ({ params }) => {
    const { groupId, memberId } = params
    const index = mockGroupMembers.findIndex(m => m.id === memberId && m.groupId === groupId)
    
    if (index !== -1) {
      mockGroupMembers.splice(index, 1)
      return HttpResponse.json({ message: '멤버가 제거되었습니다.' })
    }
    
    return HttpResponse.json({ error: 'Member not found' }, { status: 404 })
  }),

  // 그룹 탈퇴
  http.delete('/api/groups/:groupId/group-member', ({ params, request }) => {
    const { groupId } = params
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    const index = mockGroupMembers.findIndex(m => m.groupId === groupId && m.userId === userId)
    if (index !== -1) {
      mockGroupMembers.splice(index, 1)
      return HttpResponse.json({ message: '그룹을 탈퇴했습니다.' })
    }
    
    return HttpResponse.json({ error: 'Member not found' }, { status: 404 })
  }),

  // 그룹 삭제
  http.delete('/api/groups/:groupId', ({ params }) => {
    const { groupId } = params
    const index = mockGroups.findIndex(g => g.id === groupId)
    
    if (index !== -1) {
      mockGroups.splice(index, 1)
      // 관련 멤버와 요청도 삭제
      const memberIndices = mockGroupMembers
        .map((m, i) => m.groupId === groupId ? i : -1)
        .filter(i => i !== -1)
        .reverse()
      
      memberIndices.forEach(i => mockGroupMembers.splice(i, 1))
      
      const requestIndices = mockGroupRequests
        .map((r, i) => r.groupId === groupId ? i : -1)
        .filter(i => i !== -1)
        .reverse()
      
      requestIndices.forEach(i => mockGroupRequests.splice(i, 1))
      
      return HttpResponse.json({ message: '그룹이 삭제되었습니다.' })
    }
    
    return HttpResponse.json({ error: 'Group not found' }, { status: 404 })
  }),

  // ===== 매장 관련 API =====
  
  // 매장 목록 조회
  http.get('/api/stores', ({ request }) => {
    const url = new URL(request.url)
    const name = url.searchParams.get('name')
    
    if (name) {
      const filteredStores = mockStores.filter(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
      )
      return HttpResponse.json(filteredStores)
    }
    
    return HttpResponse.json(mockStores)
  }),

  // 매장 상세 조회
  http.get('/api/stores/:storeId', ({ params }) => {
    const { storeId } = params
    const store = mockStores.find(s => s.id === storeId)
    if (store) {
      return HttpResponse.json(store)
    }
    return HttpResponse.json({ error: 'Store not found' }, { status: 404 })
  }),

  // 매장 등록
  http.post('/api/owners/stores', async ({ request }) => {
    const newStore = await request.json() as Record<string, any>
    const createdStore = {
      id: Date.now().toString(),
      ...newStore,
      isLiked: false,
      likeCount: 0
    }
    mockStores.push(createdStore)
    return HttpResponse.json(createdStore, { status: 201 })
  }),

  // 매장 삭제
  http.delete('/api/owners/stores/:storeId', ({ params }) => {
    const { storeId } = params
    const index = mockStores.findIndex(s => s.id === storeId)
    
    if (index !== -1) {
      mockStores.splice(index, 1)
      // 관련 메뉴와 카테고리도 삭제
      const menuIndices = mockMenus
        .map((m, i) => m.storeId === storeId ? i : -1)
        .filter(i => i !== -1)
        .reverse()
      
      menuIndices.forEach(i => mockMenus.splice(i, 1))
      
      const categoryIndices = mockCategories
        .map((c, i) => c.storeId === storeId ? i : -1)
        .filter(i => i !== -1)
        .reverse()
      
      categoryIndices.forEach(i => mockCategories.splice(i, 1))
      
      return HttpResponse.json({ message: '매장이 삭제되었습니다.' })
    }
    
    return HttpResponse.json({ error: 'Store not found' }, { status: 404 })
  }),

  // ===== 메뉴 관련 API =====
  
  // 메뉴 목록 조회
  http.get('/api/stores/:storeId/menus', ({ params }) => {
    const { storeId } = params
    const menus = mockMenus.filter(m => m.storeId === storeId)
    return HttpResponse.json(menus)
  }),

  // 메뉴 생성
  http.post('/api/stores/:storeId/menus', async ({ params, request }) => {
    const { storeId } = params
    const newMenu = await request.json() as Record<string, any>
    const createdMenu = {
      id: Date.now().toString(),
      storeId: storeId as string,
      ...newMenu
    }
    mockMenus.push(createdMenu)
    return HttpResponse.json(createdMenu, { status: 201 })
  }),

  // 메뉴 수정
  http.put('/api/stores/:storeId/menus/:menuId', async ({ params, request }) => {
    const { storeId, menuId } = params
    const updatedMenu = await request.json() as Record<string, any>
    const index = mockMenus.findIndex(m => m.id === menuId && m.storeId === storeId)
    
    if (index !== -1) {
      mockMenus[index] = { ...mockMenus[index], ...updatedMenu }
      return HttpResponse.json(mockMenus[index])
    }
    
    return HttpResponse.json({ error: 'Menu not found' }, { status: 404 })
  }),

  // 메뉴 부분 삭제 (비활성화)
  http.patch('/api/stores/:storeId/menus/:menuId', async ({ params, request }) => {
    const { storeId, menuId } = params
    const { isAvailable } = await request.json() as { isAvailable: boolean }
    const index = mockMenus.findIndex(m => m.id === menuId && m.storeId === storeId)
    
    if (index !== -1) {
      mockMenus[index].isAvailable = isAvailable
      return HttpResponse.json(mockMenus[index])
    }
    
    return HttpResponse.json({ error: 'Menu not found' }, { status: 404 })
  }),

  // 메뉴 완전 삭제
  http.delete('/api/stores/:storeId/menus/:menuId', ({ params }) => {
    const { storeId, menuId } = params
    const index = mockMenus.findIndex(m => m.id === menuId && m.storeId === storeId)
    
    if (index !== -1) {
      mockMenus.splice(index, 1)
      return HttpResponse.json({ message: '메뉴가 삭제되었습니다.' })
    }
    
    return HttpResponse.json({ error: 'Menu not found' }, { status: 404 })
  }),

  // 매장의 모든 메뉴 삭제
  http.delete('/api/stores/:storeId/menus', ({ params }) => {
    const { storeId } = params
    const indices = mockMenus
      .map((m, i) => m.storeId === storeId ? i : -1)
      .filter(i => i !== -1)
      .reverse()
    
    indices.forEach(i => mockMenus.splice(i, 1))
    
    return HttpResponse.json({ message: '모든 메뉴가 삭제되었습니다.' })
  }),

  // ===== 메뉴 카테고리 관련 API =====
  
  // 카테고리 생성
  http.post('/api/stores/:storeId/menus/categories', async ({ params, request }) => {
    const { storeId } = params
    const newCategory = await request.json() as Record<string, any>
    const createdCategory = {
      id: Date.now().toString(),
      storeId: storeId as string,
      ...newCategory
    }
    mockCategories.push(createdCategory)
    return HttpResponse.json(createdCategory, { status: 201 })
  }),

  // 카테고리 수정
  http.put('/api/stores/:storeId/menus/categories/:categoryId', async ({ params, request }) => {
    const { storeId, categoryId } = params
    const updatedCategory = await request.json() as Record<string, any>
    const index = mockCategories.findIndex(c => c.id === categoryId && c.storeId === storeId)
    
    if (index !== -1) {
      mockCategories[index] = { ...mockCategories[index], ...updatedCategory }
      return HttpResponse.json(mockCategories[index])
    }
    
    return HttpResponse.json({ error: 'Category not found' }, { status: 404 })
  }),

  // 카테고리 삭제
  http.delete('/api/stores/:storeId/menus/categories/:categoryId', ({ params }) => {
    const { storeId, categoryId } = params
    const index = mockCategories.findIndex(c => c.id === categoryId && c.storeId === storeId)
    
    if (index !== -1) {
      mockCategories.splice(index, 1)
      return HttpResponse.json({ message: '카테고리가 삭제되었습니다.' })
    }
    
    return HttpResponse.json({ error: 'Category not found' }, { status: 404 })
  }),

  // 카테고리 목록 조회
  http.get('/api/stores/:storeId/menus/categories', ({ params }) => {
    const { storeId } = params
    const categories = mockCategories.filter(c => c.storeId === storeId)
    return HttpResponse.json(categories)
  }),

  // ===== 좋아요 관련 API =====
  
  // 매장 좋아요
  http.post('/api/stores/:storeId', ({ params }) => {
    const { storeId } = params
    const store = mockStores.find(s => s.id === storeId)
    
    if (store) {
      store.isLiked = true
      store.likeCount += 1
      return HttpResponse.json({ message: '좋아요가 추가되었습니다.' })
    }
    
    return HttpResponse.json({ error: 'Store not found' }, { status: 404 })
  }),

  // 매장 좋아요 취소
  http.delete('/api/stores/:storeId', ({ params }) => {
    const { storeId } = params
    const store = mockStores.find(s => s.id === storeId)
    
    if (store) {
      store.isLiked = false
      store.likeCount = Math.max(0, store.likeCount - 1)
      return HttpResponse.json({ message: '좋아요가 취소되었습니다.' })
    }
    
    return HttpResponse.json({ error: 'Store not found' }, { status: 404 })
  }),

  // ===== 할인/포인트 설정 API =====
  
  // 할인/포인트 설정 조회
  http.get('/api/stores/:storeId/discount-points', ({ params }) => {
    const { storeId } = params
    const discountPoints = mockDiscountPoints.filter(d => d.storeId === storeId)
    return HttpResponse.json(discountPoints)
  }),

  // ===== Owner 관련 API =====
  
  // Owner 회원가입
  http.post('/api/owner/register', async ({ request }) => {
    const newOwner = await request.json() as Record<string, any>
    return HttpResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      owner: {
        id: Date.now().toString(),
        ...newOwner
      }
    }, { status: 201 })
  }),

  // Owner 정보 조회
  http.get('/api/owners/me', () => {
    return HttpResponse.json(mockUsers.owner)
  }),

  // Owner의 매장 목록 조회
  http.get('/api/owners/stores', ({ request }) => {
    const url = new URL(request.url)
    const ownerId = url.searchParams.get('ownerId') || '2'
    
    const ownerStores = mockStores.filter(s => s.ownerId === ownerId)
    return HttpResponse.json(ownerStores)
  }),

  // Owner의 매장 상세 조회
  http.get('/api/owners/stores/:storeId', ({ params }) => {
    const { storeId } = params
    const store = mockStores.find(s => s.id === storeId)
    if (store) {
      return HttpResponse.json(store)
    }
    return HttpResponse.json({ error: 'Store not found' }, { status: 404 })
  }),

  // Owner의 매장 수정
  http.put('/api/owners/stores/:storeId', async ({ params, request }) => {
    const { storeId } = params
    const updatedStore = await request.json() as Record<string, any>
    const index = mockStores.findIndex(s => s.id === storeId)
    
    if (index !== -1) {
      mockStores[index] = { ...mockStores[index], ...updatedStore }
      return HttpResponse.json(mockStores[index])
    }
    
    return HttpResponse.json({ error: 'Store not found' }, { status: 404 })
  }),

  // ===== 알림 관련 API =====
  
  // 알림 목록 조회
  http.get('/api/notifications', ({ request }) => {
    const url = new URL(request.url)
    const ownerId = url.searchParams.get('ownerId') || '2'
    
    const mockNotifications = [
      {
        id: '1',
        ownerId: '2',
        title: '새로운 예약이 있습니다',
        message: '김고객님이 2024-01-20 19:00 예약을 신청했습니다.',
        isRead: false,
        createdAt: '2024-01-20T10:00:00Z'
      },
      {
        id: '2',
        ownerId: '2',
        title: '리뷰가 등록되었습니다',
        message: '서울 초밥에 새로운 리뷰가 등록되었습니다.',
        isRead: false,
        createdAt: '2024-01-19T15:30:00Z'
      },
      {
        id: '3',
        ownerId: '2',
        title: '매출 리포트',
        message: '이번 주 매출이 전주 대비 15% 증가했습니다.',
        isRead: true,
        createdAt: '2024-01-18T09:00:00Z'
      }
    ]
    
    const ownerNotifications = mockNotifications.filter(n => n.ownerId === ownerId)
    return HttpResponse.json(ownerNotifications)
  }),

  // 읽지 않은 알림 개수 조회
  http.get('/api/notifications/unread-count', ({ request }) => {
    const url = new URL(request.url)
    const ownerId = url.searchParams.get('ownerId') || '2'
    
    const mockNotifications = [
      { id: '1', ownerId: '2', isRead: false },
      { id: '2', ownerId: '2', isRead: false },
      { id: '3', ownerId: '2', isRead: true }
    ]
    
    const unreadCount = mockNotifications.filter(n => n.ownerId === ownerId && !n.isRead).length
    return HttpResponse.json({ unreadCount })
  }),

  // 알림 읽음 처리
  http.patch('/api/notifications/:notificationId/read', ({ params }) => {
    const { notificationId } = params
    return HttpResponse.json({ message: '알림이 읽음 처리되었습니다.' })
  }),

  // ===== 매출/캘린더 관련 API =====
  
  // 매출 캘린더 데이터 조회
  http.get('/api/owners/stores/:storeId/sales/calendar', ({ params, request }) => {
    const { storeId } = params
    const url = new URL(request.url)
    const year = url.searchParams.get('year') || '2024'
    const month = url.searchParams.get('month') || '1'
    
    const mockSalesData = {
      totalPrepaidAmount: 10000000,
      monthlyPrepaidAmount: 2500000,
      personalCustomers: 16,
      groupCustomers: 10,
      dailySales: [
        { date: '2024-01-02', amount: 150000, customers: 3 },
        { date: '2024-01-04', amount: 200000, customers: 4 },
        { date: '2024-01-15', amount: 300000, customers: 6 },
        { date: '2024-01-20', amount: 180000, customers: 3 }
      ]
    }
    
    return HttpResponse.json(mockSalesData)
  }),

  // 매출 통계 조회
  http.get('/api/owners/stores/:storeId/sales/stats', ({ params, request }) => {
    const { storeId } = params
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'
    
    const mockStats = {
      totalSales: 5000000,
      totalCustomers: 120,
      averageOrderValue: 41667,
      topMenu: '도미정식 1人',
      salesByCategory: [
        { category: '식사', amount: 3000000, percentage: 60 },
        { category: '초밥', amount: 1500000, percentage: 30 },
        { category: '사시미', amount: 500000, percentage: 10 }
      ]
    }
    
    return HttpResponse.json(mockStats)
  }),

  // ===== QR 스캔 관련 API =====
  
  // QR 코드 스캔
  http.post('/api/owners/scan-qr', async ({ request }) => {
    const { qrCode } = await request.json() as { qrCode: string }
    
    // Mock QR 데이터 처리
    const mockQrData = {
      customerId: '1',
      customerName: '김고객',
      groupId: '1',
      groupName: '초밥러버스',
      tableNumber: 'A-5',
      scanTime: new Date().toISOString()
    }
    
    return HttpResponse.json({
      success: true,
      data: mockQrData
    })
  }),

  // ===== 설정 관련 API =====
  
  // Owner 설정 조회
  http.get('/api/owners/settings', () => {
    const mockSettings = {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      business: {
        operatingHours: '09:00-22:00',
        breakTime: '15:00-17:00',
        closedDays: ['월요일']
      },
      payment: {
        autoSettlement: true,
        settlementDay: 25
      }
    }
    
    return HttpResponse.json(mockSettings)
  }),

  // Owner 설정 업데이트
  http.put('/api/owners/settings', async ({ request }) => {
    const updatedSettings = await request.json() as Record<string, any>
    return HttpResponse.json({
      success: true,
      message: '설정이 업데이트되었습니다.',
      settings: updatedSettings
    })
  }),

  // ===== 사업자 등록 확인 API =====
  
  // 사업자 등록 확인
  http.post('/api/business/verify', async ({ request }) => {
    const { businessNumber, openDate, ceoName } = await request.json() as {
      businessNumber: string
      openDate: string
      ceoName: string
    }
    
    console.log('사업자 등록 확인 요청:', { businessNumber, openDate, ceoName })
    
    // Mock 사업자 등록 확인 로직
    // 실제로는 정부 API나 사업자 등록 확인 서비스를 사용해야 함
    const isValid = validateBusinessRegistration(businessNumber, openDate, ceoName)
    
    return HttpResponse.json({
      isValid,
      message: isValid ? '사업자 등록 확인이 완료되었습니다.' : '사업자 등록 정보가 올바르지 않습니다.',
      businessInfo: isValid ? {
        businessNumber,
        businessName: '서울 초밥',
        ceoName,
        openDate,
        businessType: '일반음식점',
        businessStatus: '계속사업자'
      } : null
    })
  })
]

// 사업자 등록 확인 함수 (Mock)
function validateBusinessRegistration(businessNumber: string, openDate: string, ceoName: string): boolean {
  // 간단한 검증 로직 (실제로는 더 복잡한 검증 필요)
  const validBusinessNumbers = ['123-45-67890', '987-65-43210']
  const validCeoNames = ['박사장', '김대표', '이사장']
  
  return validBusinessNumbers.includes(businessNumber) && 
         validCeoNames.includes(ceoName) &&
         openDate.length === 10 // YYYY-MM-DD 형식
}
