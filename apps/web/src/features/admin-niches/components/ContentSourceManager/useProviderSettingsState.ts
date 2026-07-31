import { useMemo, useState } from "react"
import type { ContentSourceProviderType, ContentSourceSettings } from "../../types"

export interface ProviderSettingsState {
  providerType: ContentSourceProviderType
  fields: Record<string, string>
  setField: (key: string, value: string) => void
  value: ContentSourceSettings
}

/** Keeps one small string-field bag per providerType so switching types doesn't leak stale values into the submitted settings shape. */
export function useProviderSettingsState(
  providerType: ContentSourceProviderType,
): ProviderSettingsState {
  const [fieldsByProvider, setFieldsByProvider] = useState<Record<string, Record<string, string>>>(
    {},
  )
  const fields = fieldsByProvider[providerType] ?? {}

  function setField(key: string, value: string): void {
    setFieldsByProvider((prev) => ({
      ...prev,
      [providerType]: { ...prev[providerType], [key]: value },
    }))
  }

  const value = useMemo(() => buildSettingsValue(providerType, fields), [providerType, fields])

  return { providerType, fields, setField, value }
}

function buildSettingsValue(
  providerType: ContentSourceProviderType,
  fields: Record<string, string>,
): ContentSourceSettings {
  if (providerType === "RSS_FEED") {
    return { feedUrl: fields.feedUrl ?? "" }
  }
  if (providerType === "LOCAL_FOLDER") {
    return { folderPath: fields.folderPath ?? "", baseUrl: fields.baseUrl ?? "" }
  }
  return { apiUrl: fields.apiUrl ?? "", apiKey: fields.apiKey ?? "" }
}
