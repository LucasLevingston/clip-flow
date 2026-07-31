"use client"

import { useState } from "react"
import { Button, Select, Skeleton } from "@/components/ui"
import { useContentSourcesAdmin } from "../../hooks/useContentSourcesAdmin"
import { useDiscoverContent } from "../../hooks/useDiscoverContent"
import { useNichesAdmin } from "../../hooks/useNichesAdmin"
import { ContentSourceTable } from "./ContentSourceTable"
import { CreateContentSourceConfigForm } from "./CreateContentSourceConfigForm"

export function ContentSourceManager() {
  const { data: niches } = useNichesAdmin()
  const [nicheId, setNicheId] = useState("")
  const { data: sources, isLoading } = useContentSourcesAdmin(nicheId)
  const discoverContent = useDiscoverContent()

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Fontes de descoberta de conteúdo
      </h2>

      <Select
        value={nicheId}
        onChange={(event) => setNicheId(event.target.value)}
        className="self-start"
      >
        <option value="">Selecione um nicho</option>
        {niches?.data.map((niche) => (
          <option key={niche.id} value={niche.id}>
            {niche.name}
          </option>
        ))}
      </Select>

      {nicheId && (
        <>
          <CreateContentSourceConfigForm nicheId={nicheId} />

          <Button
            variant="secondary"
            className="self-start"
            disabled={discoverContent.isPending}
            onClick={() => discoverContent.mutate(nicheId)}
          >
            Buscar conteúdo agora
          </Button>

          {discoverContent.isSuccess && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {discoverContent.data.discovered} encontrados, {discoverContent.data.ingested} novos,{" "}
              {discoverContent.data.skipped} já existentes
              {discoverContent.data.failedSources.length > 0 &&
                ` — ${discoverContent.data.failedSources.length} fonte(s) falharam`}
              .
            </p>
          )}

          {isLoading && <Skeleton className="h-24" />}
          {sources && sources.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nenhuma fonte configurada para este nicho.
            </p>
          )}
          {sources && sources.length > 0 && <ContentSourceTable sources={sources} />}
        </>
      )}
    </section>
  )
}
