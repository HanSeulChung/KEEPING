import KeepingPassAuth from '@/components/auth/KeepingPassAuth'

export default function KeepingPassPage() {
  return (
    <KeepingPassAuth 
      purpose="LOGIN"
      redirectTo="/owner/dashboard"
    />
  )
}
