import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// MSW Worker 설정
export const worker = setupWorker(...handlers)

// Service Worker 등록
if (typeof window !== 'undefined') {
  worker.start({
    onUnhandledRequest: 'bypass',
  })
}
