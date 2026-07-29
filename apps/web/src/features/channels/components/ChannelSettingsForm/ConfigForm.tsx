"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { updateChannelConfigSchema } from "@clip-flow/shared-schemas"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import type { ChannelDetail, UpdateChannelConfigInput } from "../../types"

type FormInput = z.input<typeof updateChannelConfigSchema>

export function ConfigForm({
  channel,
  isPending,
  onSubmit,
}: {
  channel: ChannelDetail
  isPending: boolean
  onSubmit: (input: UpdateChannelConfigInput) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, UpdateChannelConfigInput>({
    resolver: zodResolver(updateChannelConfigSchema),
    values: {
      name: channel.name,
      language: channel.language,
      promptOverride: channel.promptOverride ?? undefined,
      videosPerDay: channel.videosPerDay,
      generationTime: channel.generationTime,
      platforms: channel.platforms,
      thumbnailEnabled: channel.thumbnailEnabled,
    },
  })

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <label htmlFor="nicheName">Nicho</label>
      <input id="nicheName" value={channel.nicheName} disabled readOnly />

      <label htmlFor="name">Nome do canal</label>
      <input id="name" {...register("name")} />
      {errors.name && <span role="alert">{errors.name.message}</span>}

      <label htmlFor="language">Idioma</label>
      <input id="language" {...register("language")} />

      <label htmlFor="videosPerDay">Vídeos por dia</label>
      <input id="videosPerDay" type="number" min={1} {...register("videosPerDay")} />
      {errors.videosPerDay && <span role="alert">{errors.videosPerDay.message}</span>}

      <label htmlFor="generationTime">Horário de geração</label>
      <input id="generationTime" {...register("generationTime")} />
      {errors.generationTime && <span role="alert">{errors.generationTime.message}</span>}

      <fieldset>
        <legend>Plataformas</legend>
        <label>
          <input type="radio" value="SHORTS_ONLY" {...register("platforms")} />
          Apenas YouTube Shorts
        </label>
        <label>
          <input type="radio" value="TIKTOK_ONLY" {...register("platforms")} />
          Apenas TikTok
        </label>
        <label>
          <input type="radio" value="BOTH" {...register("platforms")} />
          YouTube Shorts + TikTok
        </label>
      </fieldset>

      <label htmlFor="thumbnailEnabled">
        <input id="thumbnailEnabled" type="checkbox" {...register("thumbnailEnabled")} />
        Gerar thumbnail automaticamente
      </label>

      <label htmlFor="promptOverride">Instruções extras para a IA (opcional)</label>
      <textarea id="promptOverride" {...register("promptOverride")} />

      <p>As alterações valem a partir do próximo lote — o lote em andamento não é afetado.</p>

      <button type="submit" disabled={isPending}>
        Salvar alterações
      </button>
    </form>
  )
}
