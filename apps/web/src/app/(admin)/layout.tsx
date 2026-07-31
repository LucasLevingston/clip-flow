import type { ReactNode } from "react"
import { AdminGate } from "@/features/auth"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGate>{children}</AdminGate>
}
