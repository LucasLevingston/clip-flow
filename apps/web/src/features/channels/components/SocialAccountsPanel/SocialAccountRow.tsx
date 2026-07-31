import { Badge, Button } from "@/components/ui"
import type { SocialAccountSummary } from "../../types"
import type { ConnectablePlatform } from "./platformsToShow"

const PLATFORM_LABELS: Record<ConnectablePlatform, string> = {
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
}

export function SocialAccountRow({
  platform,
  account,
  isMutating,
  onConnect,
  onReauth,
  onDisconnect,
}: {
  platform: ConnectablePlatform
  account: SocialAccountSummary | undefined
  isMutating: boolean
  onConnect: () => void
  onReauth: () => void
  onDisconnect: () => void
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-900 dark:text-slate-100">
          {PLATFORM_LABELS[platform]}
        </span>
        {!account && <Badge tone="neutral">Não conectado</Badge>}
        {account && (
          <Badge tone={account.status === "CONNECTED" ? "success" : "warning"}>
            {account.status === "CONNECTED" ? "Conectado" : "Reconexão necessária"}
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        {!account && (
          <Button variant="secondary" disabled={isMutating} onClick={onConnect}>
            Conectar
          </Button>
        )}
        {account?.status === "NEEDS_REAUTH" && (
          <Button variant="secondary" disabled={isMutating} onClick={onReauth}>
            Reconectar
          </Button>
        )}
        {account && (
          <Button variant="ghost" disabled={isMutating} onClick={onDisconnect}>
            Desconectar
          </Button>
        )}
      </div>
    </li>
  )
}
