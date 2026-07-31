import { Select } from "@/components/ui"
import { STATUS_LABEL } from "../../constants"
import type { GeneratedVideoStatus, SocialPlatform } from "../../types"

export interface VideoFiltersValue {
  platform: SocialPlatform | ""
  status: GeneratedVideoStatus | ""
}

export interface VideoFiltersProps {
  value: VideoFiltersValue
  onChange: (value: VideoFiltersValue) => void
}

export function VideoFilters({ value, onChange }: VideoFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        aria-label="Filtrar por plataforma"
        value={value.platform}
        onChange={(event) =>
          onChange({ ...value, platform: event.target.value as VideoFiltersValue["platform"] })
        }
      >
        <option value="">Todas as plataformas</option>
        <option value="YOUTUBE">YouTube</option>
        <option value="TIKTOK">TikTok</option>
      </Select>
      <Select
        aria-label="Filtrar por status"
        value={value.status}
        onChange={(event) =>
          onChange({ ...value, status: event.target.value as VideoFiltersValue["status"] })
        }
      >
        <option value="">Todos os status</option>
        {Object.entries(STATUS_LABEL).map(([status, label]) => (
          <option key={status} value={status}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  )
}
