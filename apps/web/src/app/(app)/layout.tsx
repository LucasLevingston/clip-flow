import type { ReactNode } from "react"
import { AppHeader, RequireAuth } from "@/features/auth"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppHeader />
      {children}
    </RequireAuth>
  )
}
