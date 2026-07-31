import { Badge } from "@/components/ui"
import { STATUS_LABEL, STATUS_TONE } from "../../constants"
import type { VideoSummary } from "../../types"
import { PIPELINE_STAGE_ORDER } from "./stageOrder"

export function PipelineStageBreakdown({ videos }: { videos: VideoSummary[] }) {
  const countByStatus = videos.reduce<Partial<Record<string, number>>>((acc, video) => {
    acc[video.status] = (acc[video.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-wrap gap-2">
      {PIPELINE_STAGE_ORDER.filter((status) => countByStatus[status]).map((status) => (
        <Badge key={status} tone={STATUS_TONE[status]}>
          {STATUS_LABEL[status]}: {countByStatus[status]}
        </Badge>
      ))}
    </div>
  )
}
