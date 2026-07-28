# ADR-0002 — Next.js como Frontend (App Router)

## Status
Aceito

## Problema
O dashboard do tenant precisa de renderização rápida (LCP < 2.5s — RNF-03), SEO mínimo para páginas públicas (landing, pricing) e uma base de componentes consistente com TypeScript estrito.

## Alternativas
1. **Next.js 14+ (App Router)** — Server Components por padrão, roteamento por arquivo, Route Handlers para API interna do frontend (BFF leve).
2. **SPA Vite + React Router** — sem SSR, tudo client-side.
3. **Remix** — SSR alternativo com foco em web fundamentals.

## Escolha
**Next.js 14+ com App Router**, conforme padrão de stack definido em `nextjs-stack-skill` (TypeScript strict, Zod, TanStack Query v5, shadcn/ui, Zustand).

## Consequências
- Páginas públicas (landing, pricing, login) usam Server Components para LCP baixo e SEO.
- Dashboard autenticado usa Client Components onde há interatividade real (formulários, listas com filtro), com dados remotos via TanStack Query — nunca fetch manual em `useEffect`.
- Route Handlers do Next.js **não** hospedam lógica de negócio; atuam apenas como proxy tipado (BFF) para a API real (ver [ADR-0003](0003-node-workers-bullmq.md)), mantendo a lógica de domínio fora do processo de frontend.

## Trade-offs
- SPA (alternativa 2) foi rejeitada por não atender RNF-03 (LCP) nem SEO das páginas públicas.
- Remix foi rejeitado por menor aderência ao ecossistema já padronizado da equipe (shadcn/ui, TanStack Query, convenções da `nextjs-stack-skill`).
- Acoplar lógica de negócio em Route Handlers do Next.js foi explicitamente descartado — API e workers continuam sendo a única fonte de verdade de domínio, para não duplicar regras entre frontend e backend.
