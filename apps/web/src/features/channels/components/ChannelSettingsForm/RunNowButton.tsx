"use client"

import { Button } from "@/components/ui"
import { useTriggerGeneration } from "../../hooks/useTriggerGeneration"

export function RunNowButton({ channelId }: { channelId: string }) {
  const trigger = useTriggerGeneration(channelId)

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" onClick={() => trigger.mutate()} disabled={trigger.isPending}>
        Executar agora
      </Button>
      {trigger.isSuccess && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Geração disparada — acompanhe o progresso na lista de vídeos.
        </p>
      )}
      {trigger.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Não foi possível disparar a geração agora.
        </p>
      )}
    </div>
  )
}
