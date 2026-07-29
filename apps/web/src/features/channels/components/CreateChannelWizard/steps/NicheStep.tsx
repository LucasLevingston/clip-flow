import { useFormContext } from "react-hook-form"
import type { CreateChannelInput } from "../../../types"
import { useNiches } from "../../../hooks/useNiches"

export function NicheStep() {
  const { register } = useFormContext<CreateChannelInput>()
  const { data, isLoading, isError } = useNiches()

  if (isLoading) return <p>Carregando nichos...</p>
  if (isError) return <p role="alert">Não foi possível carregar os nichos.</p>

  return (
    <fieldset>
      <legend>Escolha um nicho</legend>
      {data?.data.map((niche) => (
        <label key={niche.id}>
          <input type="radio" value={niche.id} {...register("nicheId")} />
          {niche.name}
        </label>
      ))}
    </fieldset>
  )
}
