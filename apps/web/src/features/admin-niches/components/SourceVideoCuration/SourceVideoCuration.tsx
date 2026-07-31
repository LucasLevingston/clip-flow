"use client"

import { useState } from "react"
import { Select, Skeleton } from "@/components/ui"
import { useSourceVideosAdmin } from "../../hooks/useSourceVideosAdmin"
import type { SourceVideoStatus } from "../../types"
import { IngestSourceVideoForm } from "./IngestSourceVideoForm"
import { SourceVideoTable } from "./SourceVideoTable"

export function SourceVideoCuration() {
  const [status, setStatus] = useState<SourceVideoStatus | "">("PENDING_REVIEW")
  const { data, isLoading, isError } = useSourceVideosAdmin(status ? { status } : {})

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Curadoria de vídeos-fonte
      </h2>
      <IngestSourceVideoForm />

      <Select
        value={status}
        onChange={(event) => setStatus(event.target.value as SourceVideoStatus | "")}
        className="self-start"
      >
        <option value="">Todos os status</option>
        <option value="PENDING_REVIEW">Aguardando revisão</option>
        <option value="APPROVED">Aprovado</option>
        <option value="REJECTED">Rejeitado</option>
        <option value="ARCHIVED">Arquivado</option>
      </Select>

      {isLoading && <Skeleton className="h-32" />}
      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Não foi possível carregar os vídeos-fonte.
        </p>
      )}
      {data && data.data.length === 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum vídeo-fonte encontrado.</p>
      )}
      {data && data.data.length > 0 && <SourceVideoTable sourceVideos={data.data} />}
    </section>
  )
}
