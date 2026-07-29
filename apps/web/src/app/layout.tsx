import type { Metadata } from "next"
import type { ReactNode } from "react"
import { QueryProvider } from "@/providers/QueryProvider"

export const metadata: Metadata = {
  title: "Clip Flow",
  description: "Automação de criação e publicação de vídeos curtos por nicho",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
