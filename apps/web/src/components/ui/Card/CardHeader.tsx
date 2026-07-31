import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 p-4", className)} {...props} />
}
