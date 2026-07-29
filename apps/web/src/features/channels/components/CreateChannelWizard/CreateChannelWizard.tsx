"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { createChannelSchema } from "@clip-flow/shared-schemas"
import { useState } from "react"
import { FormProvider, useForm, type Path } from "react-hook-form"
import type { z } from "zod"
import type { CreateChannelInput } from "../../types"
import { useCreateChannel } from "../../hooks/useCreateChannel"
import { ConfigStep } from "./steps/ConfigStep"
import { NicheStep } from "./steps/NicheStep"
import { PlatformsStep } from "./steps/PlatformsStep"
import { SubmitFeedback } from "./SubmitFeedback"
import { WizardNavigation } from "./WizardNavigation"

const STEPS = [NicheStep, ConfigStep, PlatformsStep]

const STEP_FIELDS: Path<z.input<typeof createChannelSchema>>[][] = [
  ["nicheId"],
  ["name", "language", "videosPerDay", "generationTime"],
  ["platforms"],
]

export function CreateChannelWizard() {
  const [step, setStep] = useState(0)
  const form = useForm<z.input<typeof createChannelSchema>, unknown, CreateChannelInput>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: { thumbnailEnabled: true },
  })
  const createChannel = useCreateChannel()
  const CurrentStep = STEPS[step]

  async function handleNext(): Promise<void> {
    const valid = await form.trigger(STEP_FIELDS[step])
    if (valid) setStep((current) => current + 1)
  }

  function handleBack(): void {
    setStep((current) => current - 1)
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => void form.handleSubmit((data) => createChannel.mutate(data))(event)}
      >
        {CurrentStep && <CurrentStep />}

        <SubmitFeedback error={createChannel.error} isSuccess={createChannel.isSuccess} />

        <WizardNavigation
          step={step}
          totalSteps={STEPS.length}
          isSubmitting={createChannel.isPending}
          onBack={handleBack}
          onNext={() => void handleNext()}
        />
      </form>
    </FormProvider>
  )
}
