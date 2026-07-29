import { useFormContext } from "react-hook-form"
import type { CreateChannelInput } from "../../../types"

const PLATFORM_OPTIONS: { value: CreateChannelInput["platforms"]; label: string }[] = [
  { value: "SHORTS_ONLY", label: "Apenas YouTube Shorts" },
  { value: "TIKTOK_ONLY", label: "Apenas TikTok" },
  { value: "BOTH", label: "YouTube Shorts + TikTok" },
]

export function PlatformsStep() {
  const { register } = useFormContext<CreateChannelInput>()

  return (
    <fieldset>
      <legend>Plataformas de publicação</legend>
      {PLATFORM_OPTIONS.map((option) => (
        <label key={option.value}>
          <input type="radio" value={option.value} {...register("platforms")} />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
