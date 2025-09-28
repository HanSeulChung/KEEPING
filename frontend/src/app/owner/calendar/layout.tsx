import React from 'react'

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="bg-keeping-beige min-h-screen">{children}</div>
}
