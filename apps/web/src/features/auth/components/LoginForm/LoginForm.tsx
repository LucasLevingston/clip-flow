"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@clip-flow/shared-schemas"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui"
import { useLogin } from "../../hooks/useLogin"

type FormInput = z.input<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(loginSchema) })

  function onSubmit(input: FormInput) {
    login.mutate(input, { onSuccess: () => router.push("/") })
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          type="email"
          {...register("email")}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        {errors.email && (
          <span role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Senha
        <input
          type="password"
          {...register("password")}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        {errors.password && (
          <span role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </span>
        )}
      </label>

      <Button type="submit" disabled={login.isPending}>
        Entrar
      </Button>

      {login.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          E-mail ou senha inválidos.
        </p>
      )}

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Ainda não tem uma conta?{" "}
        <Link href="/register" className="text-brand-600 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  )
}
