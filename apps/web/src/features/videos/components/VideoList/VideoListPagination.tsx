export interface VideoListPaginationProps {
  page: number
  pageSize: number
  total: number
  onPrevious: () => void
  onNext: () => void
}

export function VideoListPagination({
  page,
  pageSize,
  total,
  onPrevious,
  onNext,
}: VideoListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
      <button
        type="button"
        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page <= 1}
        onClick={onPrevious}
      >
        Anterior
      </button>
      <span>
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page * pageSize >= total}
        onClick={onNext}
      >
        Próxima
      </button>
    </div>
  )
}
