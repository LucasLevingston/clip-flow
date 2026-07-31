"use client"

import type { ContentSourceProviderType } from "../../types"
import type { ProviderSettingsState } from "./useProviderSettingsState"

const FIELDS_BY_PROVIDER: Record<
  ContentSourceProviderType,
  Array<{ key: string; label: string }>
> = {
  RSS_FEED: [{ key: "feedUrl", label: "URL do feed" }],
  LOCAL_FOLDER: [
    { key: "folderPath", label: "Caminho da pasta" },
    { key: "baseUrl", label: "URL base (servida via HTTP)" },
  ],
  PARTNER_API: [
    { key: "apiUrl", label: "URL da API" },
    { key: "apiKey", label: "Chave da API" },
  ],
}

export function ProviderSettingsFields({ state }: { state: ProviderSettingsState }) {
  return (
    <>
      {FIELDS_BY_PROVIDER[state.providerType].map((field) => (
        <input
          key={field.key}
          value={state.fields[field.key] ?? ""}
          onChange={(event) => state.setField(field.key, event.target.value)}
          placeholder={field.label}
          required
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      ))}
    </>
  )
}
