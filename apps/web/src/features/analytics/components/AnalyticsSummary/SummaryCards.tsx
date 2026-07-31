import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import type { AnalyticsSummary } from "../../types"

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

export function SummaryCards({ summary }: { summary: AnalyticsSummary }) {
  const tiles: { label: string; value: number }[] = [
    { label: "Vídeos publicados", value: summary.totalVideos },
    { label: "Visualizações", value: summary.totalViews },
    { label: "Curtidas", value: summary.totalLikes },
    { label: "Comentários", value: summary.totalComments },
    { label: "Compartilhamentos", value: summary.totalShares },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardHeader>
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {tile.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {formatNumber(tile.value)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
