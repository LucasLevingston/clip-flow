"use client"

import { useDisconnectSocialAccount } from "../../hooks/useDisconnectSocialAccount"
import { useStartOAuthConnection } from "../../hooks/useStartOAuthConnection"
import type { ChannelDetail, SocialAccountSummary } from "../../types"
import { platformsToShow } from "./platformsToShow"
import { SocialAccountRow } from "./SocialAccountRow"

export function SocialAccountsPanel({ channel }: { channel: ChannelDetail }) {
  const startConnection = useStartOAuthConnection()
  const disconnect = useDisconnectSocialAccount(channel.id)

  function findAccount(platform: "YOUTUBE" | "TIKTOK"): SocialAccountSummary | undefined {
    return channel.socialAccounts.find((account) => account.platform === platform)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Contas conectadas
      </h2>
      <ul className="flex flex-col gap-2">
        {platformsToShow(channel.platforms).map((platform) => {
          const account = findAccount(platform)
          return (
            <SocialAccountRow
              key={platform}
              platform={platform}
              account={account}
              isMutating={startConnection.isPending || disconnect.isPending}
              onConnect={() =>
                startConnection.mutate({ channelId: channel.id, platform, accountId: null })
              }
              onReauth={() =>
                account &&
                startConnection.mutate({ channelId: channel.id, platform, accountId: account.id })
              }
              onDisconnect={() => account && disconnect.mutate(account.id)}
            />
          )
        })}
      </ul>
      {disconnect.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Não foi possível desconectar a conta.
        </p>
      )}
    </section>
  )
}
