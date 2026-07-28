# Testes Unitários

## O que é testado

| Alvo | Exemplos de comportamento testado |
|---|---|
| Entities/Aggregates | `GeneratedVideo.markFailed()` só é permitido a partir de estados válidos da máquina de estados (ver [domain/entities-value-objects.md](../domain/entities-value-objects.md)) |
| Value Objects | `TimeWindow` rejeita `startHour >= endHour`; `HighlightSelection` rejeita duração fora de 15–90s |
| Domain Services | `HighlightDiversityService` retorna `false` quando sobreposição de tempo > 40% |
| Policies | `PlanLimitsPolicy` bloqueia criação de canal quando `current >= max` |
| Specifications | `IsGeneratedVideoDuplicateSpecification` retorna `true` para `(batchRunId, scheduledPublishAt)` já existente |
| Application Services (Use Cases) | `GenerateVideoContentUseCase.execute()` chama fallback de IA quando provedor primário lança `AiProviderUnavailableError` — testado com dublês de `TranscriptionProvider`/`AiCompletionProvider` |

## Padrão AAA

```ts
describe("HighlightDiversityService", () => {
  it("should reject a highlight when overlap exceeds 40% of previous selections", () => {
    // Arrange
    const previousSelections = [createHighlightSelection({ startMs: 0, endMs: 60000 })]
    const candidate = createHighlightSelection({ startMs: 10000, endMs: 70000 })

    // Act
    const isDiverse = highlightDiversityService.isDiverseEnough(candidate, previousSelections)

    // Assert
    expect(isDiverse).toBe(false)
  })
})
```

## Regras

- Um `describe` por classe/função testada; um `it` por comportamento, nunca testes gigantes que verificam múltiplas coisas.
- Nomes descrevem comportamento esperado (`should reject...`, `should throw...`), nunca `test1`/`works`.
- Nenhum teste unitário toca banco, rede, filesystem ou relógio real — `Clock` é injetado (`FakeClock` em teste) para testes determinísticos (RNF-31).
- Application Services são testados com dublês de repositório em memória (implementação simples da interface, não mock genérico), reforçando que o contrato da interface é o que importa.
