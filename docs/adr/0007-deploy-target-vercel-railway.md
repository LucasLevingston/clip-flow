# ADR-0007 — Deploy: Vercel + Railway/Render

## Status
Aceito

## Problema
MVP precisa de deploy com baixo esforço operacional, custo previsível e crescimento incremental, sem exigir equipe de infraestrutura dedicada.

## Alternativas
1. **Vercel (frontend) + Railway ou Render (API + workers) + Supabase (DB)** — full managed, sem Terraform/IAM/VPC.
2. **AWS (ECS/Fargate + SQS/ElastiCache + RDS)** — controle total, mas alto custo de setup e operação (Terraform, VPC, IAM).
3. **VPS único com Docker Compose** — mais barato, porém operação manual (patch, scaling, backup) recai sobre o time.

## Escolha
**Vercel para o frontend Next.js; Railway ou Render para API HTTP e os 7 workers (containers Docker); Supabase para banco e storage; Redis gerenciado (Railway/Upstash) para filas BullMQ.**

## Consequências
- Deploy contínuo por push/merge em `main`, com preview deployments por PR na Vercel.
- Workers rodam como serviços Docker independentes no Railway/Render, escaláveis individualmente por réplica.
- Sem necessidade de gerenciar VPC, IAM ou patching de SO no MVP — reduz superfície operacional para equipe pequena.
- Observabilidade inicial usa logs/métricas nativos da plataforma gerenciada, complementados por serviço externo leve (ver [observability/observability.md](../observability/observability.md)).

## Trade-offs
- Menor controle fino de infraestrutura e possível custo por unidade mais alto em alta escala do que AWS otimizada — aceitável na escala MVP declarada (dezenas de tenants).
- AWS (alternativa 2) foi rejeitada no MVP pelo custo de setup/operação (Terraform, IAM, VPC) desproporcional ao estágio do produto; fica como caminho de migração natural em growth, já que os workers são containers Docker portáveis.
- VPS único (alternativa 3) foi rejeitado por transferir risco operacional (disponibilidade, scaling, segurança de SO) para o time, contra RNF-15 (uptime 99.5%) e RNF-24/25 (deploy contínuo e rollback rápido).
