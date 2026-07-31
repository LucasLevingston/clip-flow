"use client"

import { Badge, Button } from "@/components/ui"
import { useUpdateNiche } from "../../hooks/useUpdateNiche"
import type { NicheAdmin } from "../../types"

export function NicheTable({ niches }: { niches: NicheAdmin[] }) {
  const updateNiche = useUpdateNiche()

  function toggleStatus(niche: NicheAdmin) {
    updateNiche.mutate({
      id: niche.id,
      input: { status: niche.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
    })
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800">
          <th className="py-2">Nome</th>
          <th>Categoria</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {niches.map((niche) => (
          <tr key={niche.id} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-2 text-slate-900 dark:text-slate-100">{niche.name}</td>
            <td className="text-slate-600 dark:text-slate-400">{niche.category}</td>
            <td>
              <Badge tone={niche.status === "ACTIVE" ? "success" : "neutral"}>
                {niche.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </Badge>
            </td>
            <td className="text-right">
              <Button variant="ghost" onClick={() => toggleStatus(niche)}>
                {niche.status === "ACTIVE" ? "Desativar" : "Ativar"}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
