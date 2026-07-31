"use client"

import { useState } from "react"
import { Button, Select } from "@/components/ui"
import { useCreatePromptTemplate } from "../../hooks/useCreatePromptTemplate"
import { useNichesAdmin } from "../../hooks/useNichesAdmin"
import type { PromptTemplateType } from "../../types"

export function PromptTemplateForm() {
  const { data } = useNichesAdmin()
  const [nicheId, setNicheId] = useState("")
  const [type, setType] = useState<PromptTemplateType>("HIGHLIGHT_SELECTION")
  const [content, setContent] = useState("")
  const createPromptTemplate = useCreatePromptTemplate()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    createPromptTemplate.mutate(
      { nicheId, input: { type, content } },
      { onSuccess: () => setContent("") },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Novo prompt</h2>
      <div className="flex flex-wrap gap-3">
        <Select value={nicheId} onChange={(event) => setNicheId(event.target.value)} required>
          <option value="">Selecione um nicho</option>
          {data?.data.map((niche) => (
            <option key={niche.id} value={niche.id}>
              {niche.name}
            </option>
          ))}
        </Select>
        <Select
          value={type}
          onChange={(event) => setType(event.target.value as PromptTemplateType)}
        >
          <option value="HIGHLIGHT_SELECTION">Seleção de destaque</option>
          <option value="COPY_GENERATION">Geração de copy</option>
        </Select>
      </div>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        required
        rows={4}
        placeholder="Conteúdo do prompt"
        className="rounded-md border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <Button
        type="submit"
        disabled={createPromptTemplate.isPending || !nicheId}
        className="self-start"
      >
        Salvar prompt
      </Button>
      {createPromptTemplate.isSuccess && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Prompt salvo como versão {createPromptTemplate.data.version}.
        </p>
      )}
      {createPromptTemplate.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">Não foi possível salvar o prompt.</p>
      )}
    </form>
  )
}
