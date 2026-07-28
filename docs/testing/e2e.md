# Testes E2E

## Ferramenta
Playwright, executado contra ambiente `staging` com integrações externas em modo sandbox/teste (YouTube/TikTok sandbox, Stripe test mode, provedores de IA com chave de teste ou dublê de rede controlado via proxy de teste).

## Jornadas cobertas (MVP)

| Jornada | Passos principais |
|---|---|
| Onboarding completo | Cadastro → assina nicho → conecta conta social (fluxo OAuth mockado em staging) → cria agenda → vê estado inicial no dashboard |
| Pipeline de geração (simulado) | Trigger manual de geração (endpoint de teste/admin) → acompanha status do vídeo mudar até `PUBLISHED` no dashboard, via polling da UI |
| Falha de reautenticação | Simula `SocialAccount.status = NEEDS_REAUTH` → usuário vê aviso no dashboard → reconecta → agenda retoma |
| Billing | Troca de plano → checkout Stripe test mode → limites atualizados no dashboard |
| Admin — moderação | Admin vê vídeo em `PENDING_MODERATION` → aprova → vídeo segue pipeline |

## Regras

- E2E não substitui teste de integração pesado — cobre apenas jornada crítica de ponta a ponta, poucos cenários, focados em "o sistema entrega valor real".
- Nenhum teste E2E depende de geração real de vídeo (custaria tempo/dinheiro de IA real) — pipeline de geração é testado via endpoint de simulação controlada, ou por transição de estado direta no banco de staging seguida de verificação da UI.
- Rodam no pipeline de CI apenas no merge para `main` (não em todo PR, por custo de tempo) — ver [cicd/pipeline.md](../cicd/pipeline.md).
