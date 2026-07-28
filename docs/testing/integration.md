# Testes de Integração

## O que é testado

| Alvo | Exemplo |
|---|---|
| Repositórios Prisma | `GeneratedVideoRepository.save()` persiste e `findByScheduleRunId()` recupera corretamente; `UNIQUE (schedule_run_id)` é respeitada (constraint real) |
| **Isolamento multi-tenant** | Tenant A nunca recebe dado de Tenant B em nenhuma query de repositório — suíte dedicada testando cada repositório com 2+ tenants simultâneos (ver [ADR-0005](../adr/0005-multi-tenant-strategy.md)) |
| Migrações | Toda migração nova roda em banco efêmero (Testcontainers) como parte do pipeline, garantindo que aplica sem erro em schema limpo |
| Filas BullMQ | Job publicado por um producer é corretamente consumido pelo worker esperado, com payload íntegro (teste usa Redis efêmero, não mock de fila) |
| Fluxo de Use Case completo (sem I/O externo real) | `TriggerGenerationUseCase` → grava `GeneratedVideo` no banco real → emite job real na fila `ai` (Redis efêmero); integrações externas (Whisper/Claude) continuam mockadas |

## Infraestrutura

- **Testcontainers** sobe Postgres e Redis efêmeros por suíte (ou compartilhado por arquivo de teste, conforme performance), garantindo testes determinísticos e paralelizáveis em CI.
- Banco é migrado do zero a cada execução de suíte (nunca reaproveita estado entre suítes).

## Exemplo — teste de isolamento multi-tenant

```ts
describe("GeneratedVideoRepository — multi-tenant isolation", () => {
  it("should never return another tenant's generated videos", async () => {
    // Arrange
    const tenantA = await createTenant()
    const tenantB = await createTenant()
    await generatedVideoRepository.save(createGeneratedVideo({ tenantId: tenantA.id }))
    await generatedVideoRepository.save(createGeneratedVideo({ tenantId: tenantB.id }))

    // Act
    const resultsForA = await generatedVideoRepository.findByTenant(tenantA.id)

    // Assert
    expect(resultsForA).toHaveLength(1)
    expect(resultsForA[0].tenantId).toBe(tenantA.id)
  })
})
```

## Regra

Testes de integração não substituem testes unitários — regra de negócio complexa é validada unitariamente; integração valida que a "cola" (Prisma, filas, constraints reais) funciona como o domínio espera.
