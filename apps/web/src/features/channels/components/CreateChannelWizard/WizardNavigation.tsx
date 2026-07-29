export function WizardNavigation({
  step,
  totalSteps,
  isSubmitting,
  onBack,
  onNext,
}: {
  step: number
  totalSteps: number
  isSubmitting: boolean
  onBack: () => void
  onNext: () => void
}) {
  const isLastStep = step === totalSteps - 1

  return (
    <div>
      {step > 0 && (
        <button type="button" onClick={onBack}>
          Voltar
        </button>
      )}
      {!isLastStep && (
        <button type="button" onClick={onNext}>
          Avançar
        </button>
      )}
      {isLastStep && (
        <button type="submit" disabled={isSubmitting}>
          Criar canal
        </button>
      )}
    </div>
  )
}
