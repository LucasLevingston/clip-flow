import { LoginForm } from "@/features/auth"

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Entrar no Clip Flow
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Acesse sua conta para gerenciar seus canais.
        </p>
      </div>
      <LoginForm />
    </main>
  )
}
