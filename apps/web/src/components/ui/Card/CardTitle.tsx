import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-slate-900 dark:text-slate-100", className)}
      {...props}
    />
  )
}
