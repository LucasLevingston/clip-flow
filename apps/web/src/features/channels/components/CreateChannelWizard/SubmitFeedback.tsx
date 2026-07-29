import { ApiError } from "@/lib/ApiError"

export function SubmitFeedback({ error, isSuccess }: { error: unknown; isSuccess: boolean }) {
  if (error instanceof ApiError && error.code === "PLAN_LIMIT_EXCEEDED") {
    return (
      <div role="alert">
        <p>Limite de canais do seu plano atingido.</p>
        <a href="/billing">Fazer upgrade de plano</a>
      </div>
    )
  }
  if (error) {
    return <p role="alert">Não foi possível criar o canal. Tente novamente.</p>
  }
  if (isSuccess) {
    return <p>Canal criado com sucesso!</p>
  }
  return null
}
