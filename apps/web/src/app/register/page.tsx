import { RegisterForm } from "@/features/auth"

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Criar conta no Clip Flow
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Crie um canal, escolha um nicho e deixe a automação publicar por você.
        </p>
      </div>
      <RegisterForm />
    </main>
  )
}
