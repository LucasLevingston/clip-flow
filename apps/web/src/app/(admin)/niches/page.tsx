import { NicheManager, PromptTemplateForm, SourceVideoCuration } from "@/features/admin-niches"

export default function AdminNichesPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Administração de nichos
      </h1>
      <NicheManager />
      <PromptTemplateForm />
      <SourceVideoCuration />
    </main>
  )
}
