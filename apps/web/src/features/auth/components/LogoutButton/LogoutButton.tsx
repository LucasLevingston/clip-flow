"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui"
import { useLogout } from "../../hooks/useLogout"

export function LogoutButton() {
  const router = useRouter()
  const logout = useLogout()

  function handleClick() {
    logout.mutate(undefined, { onSettled: () => router.push("/login") })
  }

  return (
    <Button variant="ghost" onClick={handleClick} disabled={logout.isPending}>
      Sair
    </Button>
  )
}
