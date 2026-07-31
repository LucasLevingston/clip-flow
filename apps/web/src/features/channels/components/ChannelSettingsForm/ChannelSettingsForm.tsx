"use client"

import { useChannel } from "../../hooks/useChannel"
import { useChangeChannelStatus } from "../../hooks/useChangeChannelStatus"
import { useUpdateChannelConfig } from "../../hooks/useUpdateChannelConfig"
import { SocialAccountsPanel } from "../SocialAccountsPanel"
import { ConfigForm } from "./ConfigForm"
import { StatusControl } from "./StatusControl"

export function ChannelSettingsForm({ channelId }: { channelId: string }) {
  const { data: channel, isLoading, isError } = useChannel(channelId)
  const updateConfig = useUpdateChannelConfig(channelId)
  const changeStatus = useChangeChannelStatus(channelId)

  if (isLoading) return <p>Carregando canal...</p>
  if (isError || !channel) return <p role="alert">Não foi possível carregar o canal.</p>

  return (
    <div>
      <StatusControl
        channel={channel}
        isPending={changeStatus.isPending}
        error={changeStatus.error}
        onToggle={() =>
          changeStatus.mutate({ status: channel.status === "ACTIVE" ? "PAUSED" : "ACTIVE" })
        }
      />

      <ConfigForm
        channel={channel}
        isPending={updateConfig.isPending}
        onSubmit={(input) => updateConfig.mutate(input)}
      />

      {updateConfig.isSuccess && <p>Configuração salva!</p>}
      {updateConfig.isError && <p role="alert">Não foi possível salvar a configuração.</p>}

      <SocialAccountsPanel channel={channel} />
    </div>
  )
}
