import type { ChannelDetail } from "../../types"

export function StatusControl({
  channel,
  isPending,
  error,
  onToggle,
}: {
  channel: ChannelDetail
  isPending: boolean
  error: unknown
  onToggle: () => void
}) {
  if (channel.status === "DRAFT") {
    return <p>Conecte ao menos uma conta social para ativar este canal.</p>
  }

  return (
    <div>
      <p>Status atual: {channel.status}</p>
      <button type="button" onClick={onToggle} disabled={isPending}>
        {channel.status === "ACTIVE" ? "Pausar" : "Retomar"}
      </button>
      {error instanceof Error && <p role="alert">{error.message}</p>}
    </div>
  )
}
