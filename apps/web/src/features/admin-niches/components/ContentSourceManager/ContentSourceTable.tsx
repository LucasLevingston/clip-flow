"use client"

import { Badge } from "@/components/ui"
import type { ContentSourceConfigAdmin } from "../../types"

const PROVIDER_LABELS: Record<ContentSourceConfigAdmin["providerType"], string> = {
  RSS_FEED: "Feed RSS",
  LOCAL_FOLDER: "Pasta local",
  PARTNER_API: "API de parceiro",
}

export function ContentSourceTable({ sources }: { sources: ContentSourceConfigAdmin[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800">
          <th className="py-2">Fonte</th>
          <th>Tipo</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {sources.map((source) => (
          <tr key={source.id} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-2 text-slate-900 dark:text-slate-100">{source.name}</td>
            <td>{PROVIDER_LABELS[source.providerType]}</td>
            <td>
              <Badge tone={source.isActive ? "success" : "neutral"}>
                {source.isActive ? "Ativa" : "Inativa"}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
