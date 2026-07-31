"use client"

import Link from "next/link"
import { Skeleton } from "@/components/ui"
import { useChannels } from "../../hooks/useChannels"
import { ChannelCard } from "./ChannelCard"

export function ChannelList() {
  const { data, isLoading, isError } = useChannels()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-32" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Não foi possível carregar seus canais.
      </p>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Você ainda não tem nenhum canal.
        </p>
        <Link
          href="/channels/new"
          className="inline-flex h-10 min-w-[44px] cursor-pointer items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-700"
        >
          Criar meu primeiro canal
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.data.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  )
}
