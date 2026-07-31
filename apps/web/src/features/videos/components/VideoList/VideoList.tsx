"use client"

import { useState } from "react"
import { useVideos } from "../../hooks/useVideos"
import { VideoFilters } from "./VideoFilters"
import { VideoListContent } from "./VideoListContent"
import type { VideoFiltersValue } from "./VideoFilters"

const PAGE_SIZE = 20

export function VideoList({ channelId }: { channelId: string }) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<VideoFiltersValue>({ platform: "", status: "" })

  const { data, isLoading, isError } = useVideos(page, PAGE_SIZE, {
    channelId,
    ...(filters.platform ? { platform: filters.platform } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  })

  function handleFiltersChange(next: VideoFiltersValue) {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <VideoFilters value={filters} onChange={handleFiltersChange} />
      <VideoListContent
        isLoading={isLoading}
        isError={isError}
        data={data}
        onPreviousPage={() => setPage((current) => current - 1)}
        onNextPage={() => setPage((current) => current + 1)}
      />
    </div>
  )
}
