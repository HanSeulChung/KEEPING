import KeepingPassAuth from '@/components/auth/KeepingPassAuth'

export default function KeepingPassPage() {
  return (
    <KeepingPassAuth
      purpose="REGISTER"
      redirectTo="/owner/register/step1"
      userRole="OWNER"
    />
  )
}
