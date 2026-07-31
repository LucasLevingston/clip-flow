import { Badge } from "@/components/ui"
import { PLATFORM_LABEL, STATUS_LABEL, STATUS_TONE } from "../../constants"
import type { VideoSummary } from "../../types"

export function VideoTable({ videos }: { videos: VideoSummary[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <tr>
          <th className="py-2 pr-4 font-medium">Status</th>
          <th className="py-2 pr-4 font-medium">Plataformas</th>
          <th className="py-2 pr-4 font-medium">Publicação agendada</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {videos.map((video) => (
          <tr key={video.id}>
            <td className="py-2 pr-4">
              <Badge tone={STATUS_TONE[video.status]}>{STATUS_LABEL[video.status]}</Badge>
            </td>
            <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
              {video.publishRecords.length === 0
                ? "—"
                : video.publishRecords.map((record) => PLATFORM_LABEL[record.platform]).join(", ")}
            </td>
            <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
              {new Date(video.scheduledPublishAt).toLocaleString("pt-BR")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
