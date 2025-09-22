'use client'
import { GroupSettings } from '@/components/customer/GroupSettings'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// 예시 데이터
const exampleData = {
  groupName: 'A509',
  groupDescription: 'A509 모임입니다',
  members: ['혜은', '혜으니', '혜응응', '김고객'],
}

function GroupSettingsContent() {
  const searchParams = useSearchParams()
  // URL 파라미터에서 groupId를 가져오거나 기본값 3 사용
  const groupId = parseInt(searchParams.get('groupId') || '3')
  
  return <GroupSettings groupId={groupId} {...exampleData} />
}

export default function GroupSettingsPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <GroupSettingsContent />
    </Suspense>
  )
}
