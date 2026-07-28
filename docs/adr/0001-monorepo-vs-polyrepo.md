# ADR-0001 — Monorepo vs. Polyrepo

## Status
Aceito

## Problema
O Clip Flow tem múltiplos artefatos deployáveis: frontend Next.js, API HTTP, 7 workers assíncronos, e pacotes compartilhados (schemas Zod, tipos, contratos de domínio). É preciso decidir se cada um vive em repositório próprio ou em um único repositório.

## Alternativas
1. **Polyrepo** — um repositório por artefato (frontend, api, workers, shared-types).
2. **Monorepo** — um único repositório com workspaces (pnpm/Turborepo), pacotes isolados por responsabilidade.
3. **Monolito de pastas sem workspace** — tudo em um repo, sem isolamento formal de pacotes.

## Escolha
**Monorepo com pnpm workspaces + Turborepo.**

## Consequências
- Tipos e schemas Zod compartilhados entre API, workers e frontend sem duplicação nem publicação de pacote npm privado.
- Um único PR pode alterar contrato de API e seu consumidor atomicamente.
- Pipeline de CI único, com cache de build por pacote (Turborepo) para não rebuildar tudo a cada push.
- Deploy continua independente por artefato (Vercel para `apps/web`, Railway/Render para `apps/api` e `apps/workers`), configurado via build filtrado por pacote.

## Trade-offs
- Monorepo exige disciplina de fronteiras entre pacotes (evitar acoplamento implícito) — mitigado por convenções em [structure/conventions.md](../structure/conventions.md).
- Alternativa 3 (sem workspace) foi rejeitada por não impor fronteiras de módulo, favorecendo acoplamento acidental — viola SRP/DIP exigidos pela stack.
- Polyrepo foi rejeitado nesta fase por aumentar overhead operacional (versionamento de pacote compartilhado, múltiplos pipelines) sem benefício claro para uma equipe pequena em MVP.
