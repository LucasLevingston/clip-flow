"use client"

import { useState } from "react"
import { Button, Select } from "@/components/ui"
import { useIngestSourceVideo } from "../../hooks/useIngestSourceVideo"
import { useNichesAdmin } from "../../hooks/useNichesAdmin"
import type { LicenseType } from "../../types"

export function IngestSourceVideoForm() {
  const { data } = useNichesAdmin()
  const [nicheId, setNicheId] = useState("")
  const [storageUrl, setStorageUrl] = useState("")
  const [durationSeconds, setDurationSeconds] = useState("")
  const [licenseType, setLicenseType] = useState<LicenseType>("PUBLIC_DOMAIN")
  const [licenseReference, setLicenseReference] = useState("")
  const ingestSourceVideo = useIngestSourceVideo()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    ingestSourceVideo.mutate(
      {
        nicheId,
        storageUrl,
        durationSeconds: Number(durationSeconds),
        licenseType,
        licenseReference,
      },
      {
        onSuccess: () => {
          setStorageUrl("")
          setDurationSeconds("")
          setLicenseReference("")
        },
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
    >
      <Select value={nicheId} onChange={(event) => setNicheId(event.target.value)} required>
        <option value="">Nicho</option>
        {data?.data.map((niche) => (
          <option key={niche.id} value={niche.id}>
            {niche.name}
          </option>
        ))}
      </Select>
      <input
        value={storageUrl}
        onChange={(event) => setStorageUrl(event.target.value)}
        placeholder="URL de armazenamento"
        required
        className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <input
        type="number"
        value={durationSeconds}
        onChange={(event) => setDurationSeconds(event.target.value)}
        placeholder="Duração (s)"
        required
        className="h-10 w-32 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <Select
        value={licenseType}
        onChange={(event) => setLicenseType(event.target.value as LicenseType)}
      >
        <option value="PUBLIC_DOMAIN">Domínio público</option>
        <option value="CREATIVE_COMMONS">Creative Commons</option>
        <option value="PARTNER_AGREEMENT">Acordo com parceiro</option>
      </Select>
      <input
        value={licenseReference}
        onChange={(event) => setLicenseReference(event.target.value)}
        placeholder="Referência da licença"
        required
        className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <Button type="submit" disabled={ingestSourceVideo.isPending || !nicheId}>
        Adicionar vídeo-fonte
      </Button>
    </form>
  )
}
