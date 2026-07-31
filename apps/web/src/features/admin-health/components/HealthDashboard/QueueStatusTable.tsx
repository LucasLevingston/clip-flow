import { Badge } from "@/components/ui"
import type { QueueStatus } from "../../types"

export function QueueStatusTable({ queues }: { queues: QueueStatus[] }) {
  if (queues.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum dado de fila ainda.</p>
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800">
          <th className="py-2">Fila</th>
          <th>Aguardando</th>
          <th>Ativos</th>
          <th>Falhas</th>
        </tr>
      </thead>
      <tbody>
        {queues.map((queue) => (
          <tr key={queue.name} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-2 text-slate-900 dark:text-slate-100">{queue.name}</td>
            <td>
              <Badge tone={queue.waiting > 50 ? "warning" : "neutral"}>{queue.waiting}</Badge>
            </td>
            <td>{queue.active}</td>
            <td>
              <Badge tone={queue.failed > 0 ? "danger" : "neutral"}>{queue.failed}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
