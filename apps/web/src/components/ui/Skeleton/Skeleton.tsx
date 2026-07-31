import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={cn(
        "animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none dark:bg-slate-800",
        className,
      )}
      {...props}
    />
  )
}
