"use client"

import { useState } from "react"
import { Button } from "@/components/ui"
import { useCreateNiche } from "../../hooks/useCreateNiche"

export function CreateNicheForm() {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const createNiche = useCreateNiche()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    createNiche.mutate(
      { name, slug, description, category },
      {
        onSuccess: () => {
          setName("")
          setSlug("")
          setDescription("")
          setCategory("")
        },
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
    >
      <label className="flex flex-col gap-1 text-sm">
        Nome
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Slug
        <input
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Categoria
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Descrição
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <Button type="submit" disabled={createNiche.isPending}>
        Criar nicho
      </Button>
      {createNiche.isError && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">
          Não foi possível criar o nicho.
        </p>
      )}
    </form>
  )
}
