import Dashboard from '@/components/owner/Dashboard'
import { Suspense } from 'react'

export default function OwnerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  )
}
