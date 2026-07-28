# ADR-0008 — Estratégia Dual de Provedores de IA (Claude + OpenAI)

## Status
Aceito

## Problema
O pipeline depende de IA generativa para duas tarefas distintas: (1) seleção do melhor trecho do vídeo-fonte a partir da transcrição, e (2) geração de título/legenda/hashtags. É preciso decidir provedor(es) e estratégia de fallback, já que ambos (Claude, OpenAI) foram listados como integrações do produto.

## Alternativas
1. **Um único provedor fixo** (só Claude ou só OpenAI) — mais simples, porém single point of failure de fornecedor.
2. **Estratégia dual com abstração de provedor** (`AiCompletionProvider` — Strategy Pattern), provedor primário configurável + fallback automático em caso de indisponibilidade/erro/limite de custo.
3. **Round-robin entre provedores** por custo, sem conceito de primário/fallback.

## Escolha
**Estratégia dual com abstração de provedor (alternativa 2)**: Claude como provedor primário para tarefas de raciocínio/seleção de conteúdo (melhor aderência a instruções longas e contexto de transcrição extensa); OpenAI como fallback automático e como provedor primário para tarefas auxiliares mais simples e baratas (ex.: geração de hashtags), configurável por tipo de tarefa.

## Consequências
- `AiCompletionProvider` é uma interface de domínio (Dependency Inversion); `ClaudeProvider` e `OpenAiProvider` são adapters de infraestrutura, ambos implementando o mesmo contrato de entrada/saída.
- Falha, timeout ou rate limit do provedor primário aciona fallback automático (RNF-32/33), registrado em log/observabilidade para acompanhamento de custo e confiabilidade por provedor.
- Custo por vídeo (RNF-21) é registrado por execução, por provedor, permitindo trocar o primário por dados reais de custo/qualidade no futuro sem mudar o domínio.
- Prompts são versionados e associados ao `Niche` (templates por nicho — RF-15), não hardcoded no código do worker.

## Trade-offs
- Maior complexidade inicial (dois SDKs, dois adapters) comparado a um único provedor fixo (alternativa 1); aceito porque resiliência de um serviço crítico do pipeline (RNF-33) supera o custo de manter dois adapters finos.
- Round-robin puro (alternativa 3) foi rejeitado por não permitir otimizar cada tipo de tarefa pelo provedor mais adequado, tratando ambos como intercambiáveis quando não são equivalentes em todas as tarefas.
