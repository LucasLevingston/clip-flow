import { HealthDashboard } from "@/features/admin-health"

export default function AdminHealthPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Saúde da plataforma
      </h1>
      <HealthDashboard />
    </main>
  )
}
