'use client'
import { GroupSettings } from '@/components/customer/GroupSettings'
import { useSearchParams } from 'next/navigation'

// 예시 데이터
const exampleData = {
  groupName: 'A509',
  groupDescription: 'A509 모임입니다',
  members: ['혜은', '혜으니', '혜응응', '김고객'],
}

export default function GroupSettingsPage() {
  const searchParams = useSearchParams()
  // URL 파라미터에서 groupId를 가져오거나 기본값 3 사용
  const groupId = parseInt(searchParams.get('groupId') || '3')
  
  return <GroupSettings groupId={groupId} {...exampleData} />
}
