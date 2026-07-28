# Desenvolvimento — Ambiente Local

## Pré-requisitos
- Node.js LTS atual, pnpm.
- Docker (para Postgres/Redis locais via `docker-compose`, e para Testcontainers nos testes de integração).
- Conta de desenvolvedor nas integrações necessárias para o que você for trabalhar (Whisper/Claude/OpenAI/Stripe têm modo de teste; YouTube/TikTok exigem app OAuth próprio de desenvolvimento — ver [integrations/](integrations/)).

## Setup inicial

```bash
git clone <repo>
cd clip-flow
pnpm install
cp .env.example .env.local   # preencher com credenciais de desenvolvimento (ver ENVIRONMENT.md)
docker compose up -d          # sobe Postgres + Redis locais
pnpm --filter @clip-flow/database prisma migrate dev
pnpm --filter @clip-flow/database prisma db seed
pnpm dev                      # sobe apps/web, apps/api e apps/workers em modo watch (Turborepo)
```

## Comandos frequentes

| Comando | Efeito |
|---|---|
| `pnpm dev` | Sobe todos os apps em modo desenvolvimento (Turborepo, paralelo) |
| `pnpm build` | Build de produção de todos os pacotes |
| `pnpm lint` | ESLint em todos os pacotes |
| `pnpm type-check` | `tsc --noEmit` em todos os pacotes |
| `pnpm test` | Testes unitários + integração (sobe Testcontainers automaticamente) |
| `pnpm test:e2e` | Testes Playwright contra ambiente local/staging |
| `pnpm --filter apps/api dev` | Sobe apenas a API |
| `pnpm --filter apps/workers/video dev` | Sobe apenas o Video Worker |

## Rodando um worker isoladamente

Cada worker é um processo independente (ver [structure/folder-structure.md](structure/folder-structure.md)). Para depurar apenas o AI Worker, por exemplo:

```bash
pnpm --filter apps/workers/ai dev
```

Ele consumirá jobs reais da fila `ai` do Redis local — para gerar um job de teste, use o endpoint administrativo de trigger manual (documentado como ferramenta de desenvolvimento, não exposto em produção) ou insira um job diretamente via script em `packages/database/scripts/`.

## Testando processamento de vídeo localmente

FFmpeg e OpenCV precisam estar disponíveis no ambiente onde o Video Worker roda. Use a imagem Docker do worker (`apps/workers/video/Dockerfile`) mesmo em desenvolvimento local, para evitar divergência de versão de binário entre máquinas da equipe (ver [integrations/ffmpeg.md](integrations/ffmpeg.md)).

## Antes de abrir um PR

Ver checklist completo em [structure/git-workflow.md](structure/git-workflow.md#checklist-obrigatório-antes-de-qualquer-commit).
