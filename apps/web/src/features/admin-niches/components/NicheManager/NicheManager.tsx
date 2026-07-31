"use client"

import { Skeleton } from "@/components/ui"
import { useNichesAdmin } from "../../hooks/useNichesAdmin"
import { CreateNicheForm } from "./CreateNicheForm"
import { NicheTable } from "./NicheTable"

export function NicheManager() {
  const { data, isLoading, isError } = useNichesAdmin()

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nichos</h2>
      <CreateNicheForm />

      {isLoading && <Skeleton className="h-32" />}
      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Não foi possível carregar os nichos.
        </p>
      )}
      {data && data.data.length === 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum nicho cadastrado ainda.</p>
      )}
      {data && data.data.length > 0 && <NicheTable niches={data.data} />}
    </section>
  )
}
