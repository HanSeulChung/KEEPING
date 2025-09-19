'use client'
import { GroupSettings } from '@/components/customer/GroupSettings'

// 예시 데이터
const exampleData = {
  groupName: 'A509',
  groupDescription: 'A509 모임입니다',
  members: ['혜은', '혜으니', '혜응응', '김고객'],
  pendingRequests: [
    { id: '1', name: '새로운사용자1' },
    { id: '2', name: '새로운사용자2' },
  ],
}

export default function GroupSettingsPage() {
  return <GroupSettings {...exampleData} />
}
