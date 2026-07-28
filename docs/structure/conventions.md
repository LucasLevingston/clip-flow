# Convenções

## Naming

| Artefato | Convenção | Exemplo |
|---|---|---|
| Componente React | PascalCase | `NicheCard.tsx` |
| Hook | camelCase + `use` | `useChannelInsights.ts` |
| Use Case (backend) | PascalCase + `UseCase` | `CreateChannelUseCase.ts` |
| Repository (interface) | PascalCase + `Repository` | `GeneratedVideoRepository.ts` |
| Repository (implementação) | PascalCase + `PrismaRepository` | `GeneratedVideoPrismaRepository.ts` |
| Entity | PascalCase | `GeneratedVideo.ts` |
| Value Object | PascalCase | `HighlightSelection.ts` |
| DTO | PascalCase + `Dto` | `CreateScheduleDto.ts` |
| Schema Zod | camelCase + `Schema` | `createScheduleSchema.ts` |
| Evento de domínio | PascalCase, fato passado | `VideoPublished.ts` |
| Comando | PascalCase, imperativo | `PublishVideo.ts` |
| Pasta de feature (frontend) | kebab-case | `social-accounts/` |
| Pasta de bounded context (backend) | kebab-case | `content-generation/` |

## Commits

Conventional Commits, sempre em português no corpo quando o repositório for majoritariamente consumido pela equipe local, título curto (≤ 50 caracteres):

```
feat(scheduling): adiciona pausa de agenda por nicho
fix(upload-worker): corrige retry duplicando publicação
docs(adr): registra decisão de estratégia multi-tenant
```

Tipos aceitos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.

## Branches (ver detalhamento em [git-workflow.md](git-workflow.md) — GitFlow obrigatório)

```
main                     # produção
develop                  # integração
feature/<epic>-<slug>    # ex.: feature/EPIC-06-pipeline-geracao
fix/<slug>
release/<version>
hotfix/<slug>
```

## Versionamento

SemVer (`MAJOR.MINOR.PATCH`) para releases de `apps/api` (contrato público) e `packages/shared-schemas`. `apps/web` e `apps/workers` seguem a mesma tag de release do monorepo (release conjunta por sprint — ver [roadmap/roadmap.md](../roadmap/roadmap.md)).

## ESLint / Prettier

- Configuração compartilhada em `packages/config/eslint-preset` e `packages/config/prettier-preset`, estendida por cada `apps/*`.
- Regras adicionais: `no-explicit-any` (erro), `no-floating-promises` (erro), `import/no-relative-parent-imports` fora de `features/**/index.ts` (erro — reforça contrato público).

## Imports e Aliases

- Sempre `@/` dentro de cada app (`apps/web/tsconfig.json` mapeia `@/*` → `src/*`).
- Entre pacotes do monorepo, sempre pelo nome do pacote (`@clip-flow/shared-types`), nunca caminho relativo cruzando `apps/`/`packages/`.
- Nunca importar de sub-caminho interno de uma `feature/` ou de um bounded context de domínio — sempre via `index.ts` (contrato público, ver [domain/bounded-contexts.md](../domain/bounded-contexts.md)).

## Arquivos

- Um componente/classe por arquivo; arquivo nomeado igual ao export principal.
- Teste sempre ao lado do arquivo testado (`Foo.ts` + `Foo.test.ts`), nunca em pasta `__tests__` espelhada.
- Componente React: máximo 100 linhas — extrair subcomponente/hook ao ultrapassar.

## DTOs, Entities, Repositories, Use Cases — regra de fronteira

- **DTO** nunca vaza para o domínio — Use Case converte DTO → parâmetros de domínio na entrada, e Entity/VO → DTO de saída na saída.
- **Entity** nunca é serializada diretamente como resposta HTTP — sempre passa por um mapeamento explícito para DTO de resposta (evita vazar campo interno não intencional, ex.: `encryptedTokens`).
- **Repository** nunca retorna tipo de infraestrutura (ex.: modelo gerado do Prisma) para fora de `infrastructure/` — sempre mapeia para Entity de domínio antes de retornar ao Use Case.
- **Use Case** é sempre nomeado como uma ação de negócio, nunca como operação CRUD genérica (`PauseChannelUseCase`, não `UpdateChannelStatusUseCase`, quando a ação tem significado de negócio específico).
