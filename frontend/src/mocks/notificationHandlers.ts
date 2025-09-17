import { http, HttpResponse } from 'msw'

// 모의 알림 데이터
const mockNotifications = [
  {
    id: '1',
    type: 'payment',
    title: '새로운 주문이 들어왔습니다',
    message: '서울 초밥에서 2인분 주문이 접수되었습니다.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
    isRead: false,
    data: { storeId: '1', orderId: 'order_123' }
  },
  {
    id: '2',
    type: 'payment',
    title: '결제 완료 알림',
    message: '일식비 마곡점에서 15,000원 결제가 완료되었습니다.',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12분 전
    isRead: false,
    data: { storeId: '2', amount: 15000 }
  },
  {
    id: '3',
    type: 'review',
    title: '리뷰 등록 알림',
    message: '서울 초밥에 새로운 리뷰가 등록되었습니다.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1시간 전
    isRead: false,
    data: { storeId: '1', reviewId: 'review_456' }
  },
  {
    id: '4',
    type: 'order',
    title: '주문 취소 알림',
    message: '대구 갈비집에서 주문이 취소되었습니다.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    isRead: true,
    data: { storeId: '3', orderId: 'order_789' }
  }
]

// SSE 연결을 위한 클라이언트 저장소
const sseClients = new Map<string, ReadableStreamDefaultController>()

// 알림 전송 함수
const sendNotificationToClient = (userId: string, notification: any) => {
  const client = sseClients.get(userId)
  if (client) {
    try {
      client.enqueue(`data: ${JSON.stringify(notification)}\n\n`)
    } catch (error) {
      console.error('SSE 전송 오류:', error)
      sseClients.delete(userId)
    }
  }
}

// 주기적으로 알림 생성 (테스트용)
setInterval(() => {
  const testNotifications = [
    {
      id: `test_${Date.now()}`,
      type: 'payment',
      title: '테스트 주문 알림',
      message: `새로운 주문이 들어왔습니다. (${new Date().toLocaleTimeString()})`,
      timestamp: new Date().toISOString(),
      isRead: false,
      data: { storeId: '1', orderId: `order_${Date.now()}` }
    }
  ]

  // 모든 연결된 클라이언트에게 알림 전송
  sseClients.forEach((client, userId) => {
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)]
    sendNotificationToClient(userId, randomNotification)
  })
}, 30000) // 30초마다 테스트 알림 전송

export const notificationHandlers = [
  // SSE 연결
  http.get('/api/notifications/sse', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    console.log('SSE 연결 요청:', { userId, url: request.url })
    
    if (!userId) {
      console.error('SSE 연결 실패: userId 없음')
      return new HttpResponse(null, { status: 400 })
    }

    const stream = new ReadableStream({
      start(controller) {
        console.log('SSE 스트림 시작:', userId)
        
        // 클라이언트 등록
        sseClients.set(userId, controller)
        
        // 연결 확인 메시지
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'connection',
            message: 'SSE 연결됨',
            timestamp: new Date().toISOString()
          })}\n\n`)
        } catch (error) {
          console.error('SSE 초기 메시지 전송 오류:', error)
        }

        // 연결 해제 시 정리
        request.signal.addEventListener('abort', () => {
          console.log('SSE 연결 해제:', userId)
          sseClients.delete(userId)
          try {
            controller.close()
          } catch (error) {
            console.error('SSE 컨트롤러 닫기 오류:', error)
          }
        })
      },
      cancel() {
        console.log('SSE 스트림 취소:', userId)
        sseClients.delete(userId)
      }
    })

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Accel-Buffering': 'no' // Nginx 버퍼링 방지
      }
    })
  }),

  // 알림 목록 조회
  http.get('/api/notifications', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new HttpResponse(null, { status: 400 })
    }

    return HttpResponse.json({
      success: true,
      notifications: mockNotifications
    })
  }),

  // 알림 읽음 처리
  http.post('/api/notifications/:id/read', ({ params, request }) => {
    const { id } = params
    const body = request.json()
    
    // 모의 데이터에서 해당 알림 찾아서 읽음 처리
    const notification = mockNotifications.find(n => n.id === id)
    if (notification) {
      notification.isRead = true
    }

    return HttpResponse.json({
      success: true,
      message: '알림이 읽음 처리되었습니다.'
    })
  }),

  // 모든 알림 읽음 처리
  http.post('/api/notifications/read-all', ({ request }) => {
    const body = request.json()
    
    // 모든 알림 읽음 처리
    mockNotifications.forEach(notification => {
      notification.isRead = true
    })

    return HttpResponse.json({
      success: true,
      message: '모든 알림이 읽음 처리되었습니다.'
    })
  }),

  // Web Push 구독
  http.post('/api/notifications/subscribe', ({ request }) => {
    const body = request.json()
    
    console.log('Web Push 구독:', body)
    
    return HttpResponse.json({
      success: true,
      message: 'Web Push 구독이 완료되었습니다.'
    })
  }),

  // 알림 동기화
  http.post('/api/notifications/sync', ({ request }) => {
    return HttpResponse.json({
      success: true,
      message: '알림 동기화가 완료되었습니다.'
    })
  }),

  // 테스트 알림 전송
  http.post('/api/notifications/test', ({ request }) => {
    const testNotification = {
      id: `test_${Date.now()}`,
      type: 'system',
      title: '테스트 알림',
      message: '이것은 테스트 알림입니다.',
      timestamp: new Date().toISOString(),
      isRead: false,
      data: { test: true }
    }

    // 모든 연결된 클라이언트에게 테스트 알림 전송
    sseClients.forEach((client, userId) => {
      sendNotificationToClient(userId, testNotification)
    })

    return HttpResponse.json({
      success: true,
      message: '테스트 알림이 전송되었습니다.'
    })
  })
]
