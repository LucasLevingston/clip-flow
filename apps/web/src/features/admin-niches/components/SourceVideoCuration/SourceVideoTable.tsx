"use client"

import { Badge, Button } from "@/components/ui"
import { useReviewSourceVideo } from "../../hooks/useReviewSourceVideo"
import type { SourceVideoAdmin, SourceVideoStatus } from "../../types"

const STATUS_LABELS: Record<SourceVideoStatus, string> = {
  PENDING_REVIEW: "Aguardando revisão",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  ARCHIVED: "Arquivado",
}

export function SourceVideoTable({ sourceVideos }: { sourceVideos: SourceVideoAdmin[] }) {
  const reviewSourceVideo = useReviewSourceVideo()

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800">
          <th className="py-2">Vídeo</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {sourceVideos.map((sourceVideo) => (
          <tr key={sourceVideo.id} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-2 text-slate-900 dark:text-slate-100">{sourceVideo.storageUrl}</td>
            <td>
              <Badge tone={sourceVideo.status === "APPROVED" ? "success" : "neutral"}>
                {STATUS_LABELS[sourceVideo.status]}
              </Badge>
            </td>
            <td className="flex justify-end gap-2 py-2">
              {sourceVideo.status === "PENDING_REVIEW" && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      reviewSourceVideo.mutate({
                        id: sourceVideo.id,
                        input: { decision: "APPROVED" },
                      })
                    }
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      reviewSourceVideo.mutate({
                        id: sourceVideo.id,
                        input: { decision: "REJECTED" },
                      })
                    }
                  >
                    Rejeitar
                  </Button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
