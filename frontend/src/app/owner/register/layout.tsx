import { RegistrationProvider } from '@/contexts/RegistrationContext'

export default function OwnerRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RegistrationProvider>
      {children}
    </RegistrationProvider>
  )
}