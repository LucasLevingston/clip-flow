import { Skeleton } from "@/components/ui"
import { VideoListPagination } from "./VideoListPagination"
import { VideoTable } from "./VideoTable"
import type { ListVideosResult } from "../../types"

export interface VideoListContentProps {
  isLoading: boolean
  isError: boolean
  data: ListVideosResult | undefined
  onPreviousPage: () => void
  onNextPage: () => void
}

export function VideoListContent({
  isLoading,
  isError,
  data,
  onPreviousPage,
  onNextPage,
}: VideoListContentProps) {
  if (isLoading) {
    return <Skeleton className="h-48" />
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">Não foi possível carregar os vídeos.</p>
    )
  }

  if (!data || data.data.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum vídeo encontrado.</p>
  }

  return (
    <>
      <VideoTable videos={data.data} />
      <VideoListPagination
        page={data.meta.page}
        pageSize={data.meta.pageSize}
        total={data.meta.total}
        onPrevious={onPreviousPage}
        onNext={onNextPage}
      />
    </>
  )
}
