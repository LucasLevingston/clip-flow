import { ChannelList } from "@/features/channels"

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Clip Flow</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Crie um canal, escolha um nicho e deixe a automação publicar por você.
        </p>
      </div>
      <ChannelList />
    </main>
  )
}
