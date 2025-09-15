import StoreManagePage from '@/components/owner/StoreManagePage'

export default function ManagePage() {
  // 임시 매장 데이터 (실제로는 URL 파라미터나 상태에서 가져와야 함)
  const store = {
    id: '1',
    name: '서울 초밥',
    images: []
  }

  return <StoreManagePage store={store} />
}
