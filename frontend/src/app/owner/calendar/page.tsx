import Calendar from '@/components/owner/Calendar'

export default async function Page() {
  const year = 2025
  const month = 6
  const stats = [
    { label: '선결제 금액', value: '10,000,000 원' },
    { label: '개인 고객', value: '16명' },
    { label: '그룹 고객', value: '10팀' },
  ] as const

  const highlights = [
    { day: 2, variant: 'event' }, // 노랑
    { day: 4, variant: 'today' }, // 파랑
  ] as const

  return (
    <>
      <Calendar
        year={year}
        month={month}
        stats={stats as any}
        highlights={[...highlights]}
      />
    </>
  )
}
