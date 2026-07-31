"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "@clip-flow/shared-schemas"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui"
import { useRegister } from "../../hooks/useRegister"

type FormInput = z.input<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const registerTenant = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(registerSchema) })

  function onSubmit(input: FormInput) {
    registerTenant.mutate(input, { onSuccess: () => router.push("/") })
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-sm">
        Nome da organização
        <input
          {...register("tenantName")}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        {errors.tenantName && (
          <span role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.tenantName.message}
          </span>
        )}
      </label>

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

      <Button type="submit" disabled={registerTenant.isPending}>
        Criar conta
      </Button>

      {registerTenant.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Não foi possível criar sua conta.
        </p>
      )}

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  )
}
