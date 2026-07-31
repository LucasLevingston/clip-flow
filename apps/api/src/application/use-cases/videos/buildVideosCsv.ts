import type { VideoExportRow } from "../../../domain/videos/repositories/VideoRepository"

const HEADER = "id,channel,status,platform,publishedAt,views,likes,comments"

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Columns documented at docs/api/videos-api.md — one row per PublishRecord, not per video. */
export function buildVideosCsv(rows: VideoExportRow[]): string {
  const lines = rows.map((row) =>
    [
      row.id,
      escapeCsvField(row.channel),
      row.status,
      row.platform,
      row.publishedAt ? row.publishedAt.toISOString() : "",
      String(row.views),
      String(row.likes),
      String(row.comments),
    ].join(","),
  )
  return [HEADER, ...lines].join("\n")
}
