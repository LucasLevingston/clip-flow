# Fixtures, Builders, Factories e Test Utils

## Estrutura compartilhada

```
test-utils/
  render.tsx
  renderWithProviders.tsx        # frontend — todos os providers (Theme, QueryClient, Router, i18n, Auth)
  factories/
    createTenant.ts
    createUser.ts
    createNiche.ts
    createSourceVideo.ts
    createGeneratedVideo.ts
    createPublishRecord.ts
  builders/
    GeneratedVideoBuilder.ts     # para cenários com múltiplos atributos combinados
  mocks/
    api.ts
    router.ts
    auth.ts
    localStorage.ts
  msw/
    handlers/
      niches.ts
      videos.ts
      auth.ts
    server.ts
  setup.ts
```

## Factories — exemplo

```ts
// test-utils/factories/createGeneratedVideo.ts
export function createGeneratedVideo(overrides: Partial<GeneratedVideoProps> = {}): GeneratedVideo {
  return GeneratedVideo.create({
    id: overrides.id ?? generateId(),
    tenantId: overrides.tenantId ?? generateId(),
    channelId: overrides.channelId ?? generateId(),
    sourceVideoId: overrides.sourceVideoId ?? generateId(),
    batchRunId: overrides.batchRunId ?? generateId(),
    status: overrides.status ?? "SOURCING",
    ...overrides,
  })
}
```

Uso: `createGeneratedVideo({ status: "READY_TO_PUBLISH" })` — nunca repetir objeto completo em cada teste.

## Builder — exemplo (cenário complexo)

```ts
GeneratedVideoBuilder
  .forTenant(tenantA.id)
  .forNiche(nicheX.id)
  .withStatus("PENDING_MODERATION")
  .withFlagReason("possible_sensitive_content")
  .build()
```

## MSW (frontend)

```ts
// test-utils/msw/handlers/videos.ts
import { http, HttpResponse } from "msw"

export const videoHandlers = [
  http.get("/v1/videos", () => HttpResponse.json({ data: [createGeneratedVideoDTO()], meta: { page: 1, pageSize: 20, total: 1 } })),
]
```

```ts
// jest.setup.ts
beforeAll(() => server.listen())
afterEach(() => { server.resetHandlers(); jest.clearAllMocks() })
afterAll(() => server.close())
```

## Regras

- Nenhum objeto de domínio complexo é montado manualmente dentro de um teste — sempre via factory/builder.
- Centralização de mocks: um único `test-utils/mocks/router.ts`, nunca um mock de router diferente por arquivo de teste.
- Limpeza automática de mocks configurada globalmente (`afterEach(() => jest.clearAllMocks())`) — nunca repetida por arquivo.
- `renderWithProviders` é obrigatório para qualquer componente React testado que consome contexto (Theme/Query/Auth) — nunca `render()` puro nesses casos.
