"use client"

import Link from "next/link"
import { useCurrentUser } from "../../hooks/useCurrentUser"
import { LogoutButton } from "../LogoutButton"

export function AppHeader() {
  const { data } = useCurrentUser()

  return (
    <header className="border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="font-semibold text-slate-900 dark:text-slate-100">
          Clip Flow
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {data?.tenant.name && (
            <span className="text-slate-600 dark:text-slate-400">{data.tenant.name}</span>
          )}
          {data?.user.isPlatformAdmin && (
            <Link href="/niches" className="text-brand-600 hover:underline">
              Admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
