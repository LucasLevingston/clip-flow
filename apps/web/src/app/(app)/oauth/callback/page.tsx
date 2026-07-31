"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { oauthPendingConnection, useCompleteOAuthConnection } from "@/features/channels"

/** Both YOUTUBE_REDIRECT_URI and TIKTOK_REDIRECT_URI point here — the pending platform/channel/
 * accountId were stashed in sessionStorage right before the redirect (see useStartOAuthConnection). */
export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const completeConnection = useCompleteOAuthConnection()
  const [error, setError] = useState<string | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const pending = oauthPendingConnection.take()

    if (!code || !state || !pending) {
      setError("Não foi possível concluir a conexão.")
      return
    }

    completeConnection.mutate(
      { pending, code, state },
      {
        onSuccess: () => router.replace(`/channels/${pending.channelId}/settings`),
        onError: () => setError("Não foi possível concluir a conexão."),
      },
    )
  }, [searchParams, completeConnection, router])

  return (
    <main className="mx-auto max-w-md p-6 text-center">
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400">Conectando sua conta...</p>
      )}
    </main>
  )
}
