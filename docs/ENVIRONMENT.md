# Variáveis de Ambiente

Todas as variáveis abaixo devem existir em `.env.example` (sem valores reais) na raiz de cada app que as consome. Nunca commitar `.env.local`/`.env.production` (ver [security/secrets-encryption.md](security/secrets-encryption.md)).

## Compartilhadas (API + Workers)

| Variável | Descrição | Obrigatória |
|---|---|---|
| `DATABASE_URL` | Connection string Postgres (Supabase) | Sim |
| `REDIS_URL` | Connection string Redis (BullMQ) | Sim |
| `APP_ENCRYPTION_KEY` | Chave AES-256-GCM para tokens OAuth | Sim |
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` | Par RSA para assinatura de access token | Sim (API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Acesso a Supabase Storage | Sim |
| `SUPABASE_STORAGE_BUCKET_SOURCE` | Bucket de vídeos-fonte | Sim |
| `SUPABASE_STORAGE_BUCKET_GENERATED` | Bucket de vídeos gerados | Sim |
| `NODE_ENV` | `development` \| `staging` \| `production` | Sim |

## Integrações de IA

| Variável | Usado por |
|---|---|
| `ANTHROPIC_API_KEY` | AI Worker ([integrations/claude.md](integrations/claude.md)) |
| `CLAUDE_MODEL_ID` | AI Worker |
| `OPENAI_API_KEY` | AI Worker ([integrations/openai.md](integrations/openai.md)), Whisper |
| `WHISPER_API_KEY` | AI Worker ([integrations/whisper.md](integrations/whisper.md)) |

## Plataformas sociais

| Variável | Usado por |
|---|---|
| `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` / `YOUTUBE_REDIRECT_URI` | API, Upload/Analytics Worker |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` / `TIKTOK_REDIRECT_URI` | API, Upload/Analytics Worker |

## Billing

| Variável | Usado por |
|---|---|
| `STRIPE_SECRET_KEY` | API |
| `STRIPE_WEBHOOK_SECRET` | API |
| `STRIPE_PUBLISHABLE_KEY` | Frontend |

## E-mail

| Variável | Usado por |
|---|---|
| `EMAIL_PROVIDER_API_KEY` | Notification Worker |
| `EMAIL_FROM_ADDRESS` | Notification Worker |

## Frontend (`apps/web`)

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API |
| `STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe |

## Regras

- Toda variável nova introduzida por um PR é adicionada ao `.env.example` correspondente **no mesmo PR** (ver checklist em [structure/git-workflow.md](structure/git-workflow.md)).
- Segredos de produção só existem no secret manager da plataforma de deploy (ver [DEPLOYMENT.md](DEPLOYMENT.md)) — nunca em arquivo, nunca compartilhados por chat/e-mail.
- `staging` e `production` usam credenciais de integração **completamente separadas** (apps OAuth, chaves de API) — nunca compartilhadas entre ambientes (RNF-26).
