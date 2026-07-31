# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/). Este arquivo registra mudanças de **produto/plataforma entregues**, não commits individuais — cada entrada corresponde a uma Sprint concluída do [roadmap](roadmap/roadmap.md).

## [Não lançado]

### Added — Sprint MVP-1 (fluxo principal ponta a ponta)

- Sessão real (access token em `localStorage`, refresh token em cookie httpOnly), login/registro pela UI, proteção de rotas via `RequireAuth`.
- Conexão de contas do YouTube/TikTok pela UI, com fluxo OAuth completo (connect/reauth/disconnect) e callback compartilhado.
- Disparo manual do Scheduler pelo Dashboard (botão "Run now" por canal).
- Painel "Próximos agendamentos" no dashboard do canal.
- Ver detalhes em [roadmap/roadmap.md](roadmap/roadmap.md#sprint-mvp-1--fluxo-principal-ponta-a-ponta-happy-path).

### Added — Sprint MVP-2 (Automated Content Pipeline — Core)

- Descoberta de conteúdo por fonte pré-licenciada (RSS/pasta local/API de parceiro), landing como candidato pendente de revisão — curadoria manual continua obrigatória (ADR-0006).
- Ranking por IA do pool de vídeos-fonte candidatos (qualidade, duração, frescor, idioma) antes da geração diária.
- Retry automático com backoff exponencial + fila de dead-letter em todas as filas BullMQ.
- Painel de pipeline em tempo real (polling 5s) no detalhe do canal.
- Ver detalhes, incluindo escopo explicitamente adiado, em [roadmap/roadmap.md](roadmap/roadmap.md#sprint-mvp-2--automated-content-pipeline-core).

### Planejamento

- Fase 0 concluída: documentação completa de produto, arquitetura, domínio, banco, APIs, workers, integrações, segurança, testes, backlog e roadmap. Nenhuma implementação iniciada ainda (ver [product/vision.md](product/vision.md)).

<!--
Convenção para entradas futuras, a partir do início da Sprint 0 de implementação:

## [0.1.0] - Sprint 0
### Added
- Monorepo, schema de banco, deploy inicial dos 8 serviços.

## [0.2.0] - Sprint 1
### Added
- Cadastro, login, RBAC, convite de membros.
-->
