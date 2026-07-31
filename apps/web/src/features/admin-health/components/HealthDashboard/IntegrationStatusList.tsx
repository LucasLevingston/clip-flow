import { Badge } from "@/components/ui"
import type { IntegrationStatus } from "../../types"

export function IntegrationStatusList({ integrations }: { integrations: IntegrationStatus[] }) {
  if (integrations.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum dado de integração ainda.</p>
    )
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {integrations.map((integration) => (
        <li
          key={integration.name}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
        >
          <span className="text-sm text-slate-900 dark:text-slate-100">{integration.name}</span>
          <Badge tone={integration.status === "UP" ? "success" : "danger"}>
            {integration.status === "UP" ? "Operacional" : "Degradado"}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
