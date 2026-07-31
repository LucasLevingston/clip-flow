import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { AnalyticsSummary } from "../../types"

const PLATFORM_COLOR: Record<"YouTube" | "TikTok", string> = {
  YouTube: "#2563eb",
  TikTok: "#f59e0b",
}

export function PlatformChart({ byPlatform }: { byPlatform: AnalyticsSummary["byPlatform"] }) {
  const data = [
    { platform: "YouTube", views: byPlatform.YOUTUBE.views, videos: byPlatform.YOUTUBE.videos },
    { platform: "TikTok", views: byPlatform.TIKTOK.views, videos: byPlatform.TIKTOK.videos },
  ]

  return (
    <div>
      <div className="h-64" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <XAxis dataKey="platform" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="views" name="Visualizações">
              {data.map((entry) => (
                <Cell
                  key={entry.platform}
                  fill={PLATFORM_COLOR[entry.platform as "YouTube" | "TikTok"]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Visualizações por plataforma</caption>
        <thead>
          <tr>
            <th>Plataforma</th>
            <th>Vídeos</th>
            <th>Visualizações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.platform}>
              <td>{row.platform}</td>
              <td>{row.videos}</td>
              <td>{row.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
