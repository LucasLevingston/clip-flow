"use client"

import { useState } from "react"
import { Button, Select } from "@/components/ui"
import { useCreateContentSourceConfig } from "../../hooks/useCreateContentSourceConfig"
import type { ContentSourceProviderType, LicenseType } from "../../types"
import { ProviderSettingsFields } from "./ProviderSettingsFields"
import { useProviderSettingsState } from "./useProviderSettingsState"

const inputClassName =
  "h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"

export function CreateContentSourceConfigForm({ nicheId }: { nicheId: string }) {
  const [providerType, setProviderType] = useState<ContentSourceProviderType>("RSS_FEED")
  const [name, setName] = useState("")
  const [licenseType, setLicenseType] = useState<LicenseType>("PARTNER_AGREEMENT")
  const [licenseReference, setLicenseReference] = useState("")
  const settings = useProviderSettingsState(providerType)
  const createContentSourceConfig = useCreateContentSourceConfig()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    createContentSourceConfig.mutate(
      {
        nicheId,
        input: { providerType, name, settings: settings.value, licenseType, licenseReference },
      },
      { onSuccess: () => setName("") },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
    >
      <Select
        value={providerType}
        onChange={(event) => setProviderType(event.target.value as ContentSourceProviderType)}
      >
        <option value="RSS_FEED">Feed RSS</option>
        <option value="LOCAL_FOLDER">Pasta local</option>
        <option value="PARTNER_API">API de parceiro</option>
      </Select>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nome da fonte"
        required
        className={inputClassName}
      />
      <ProviderSettingsFields state={settings} />
      <Select
        value={licenseType}
        onChange={(event) => setLicenseType(event.target.value as LicenseType)}
      >
        <option value="PARTNER_AGREEMENT">Acordo com parceiro</option>
        <option value="CREATIVE_COMMONS">Creative Commons</option>
        <option value="PUBLIC_DOMAIN">Domínio público</option>
      </Select>
      <input
        value={licenseReference}
        onChange={(event) => setLicenseReference(event.target.value)}
        placeholder="Referência da licença"
        required
        className={inputClassName}
      />
      <Button type="submit" disabled={createContentSourceConfig.isPending || !nicheId}>
        Adicionar fonte
      </Button>
    </form>
  )
}
