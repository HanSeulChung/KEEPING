import React from "react";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-keeping-beige">
      {children}
    </div>
  );
}
