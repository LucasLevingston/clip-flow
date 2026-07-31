"use client"

import { useState } from "react"
import { apiClient } from "@/lib/apiClient"
import { videosService } from "../../services/videosService"
import type { VideoFilters } from "../../types"

export function ExportButton({ filters }: { filters: VideoFilters }) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const blob = await apiClient.getBlob(videosService.exportVideosUrl(filters))
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "videos.csv"
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      type="button"
      disabled={isExporting}
      onClick={() => {
        void handleExport()
      }}
      className="inline-flex h-10 min-w-[44px] cursor-pointer items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-medium text-slate-900 transition-colors duration-150 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      {isExporting ? "Exportando..." : "Exportar CSV"}
    </button>
  )
}
