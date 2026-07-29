import { useFormContext } from "react-hook-form"
import type { CreateChannelInput } from "../../../types"

export function ConfigStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateChannelInput>()

  return (
    <fieldset>
      <legend>Configuração do canal</legend>

      <label htmlFor="name">Nome do canal</label>
      <input id="name" {...register("name")} />
      {errors.name && <span role="alert">{errors.name.message}</span>}

      <label htmlFor="language">Idioma</label>
      <input id="language" placeholder="pt-BR" {...register("language")} />
      {errors.language && <span role="alert">{errors.language.message}</span>}

      <label htmlFor="videosPerDay">Vídeos por dia</label>
      <input id="videosPerDay" type="number" min={1} {...register("videosPerDay")} />
      {errors.videosPerDay && <span role="alert">{errors.videosPerDay.message}</span>}

      <label htmlFor="generationTime">Horário de geração</label>
      <input id="generationTime" placeholder="06:00" {...register("generationTime")} />
      {errors.generationTime && <span role="alert">{errors.generationTime.message}</span>}

      <label htmlFor="thumbnailEnabled">
        <input id="thumbnailEnabled" type="checkbox" {...register("thumbnailEnabled")} />
        Gerar thumbnail automaticamente
      </label>
    </fieldset>
  )
}
