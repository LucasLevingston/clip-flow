# ADR-0014 — Loop de Aprendizado via Aumento de Contexto de Prompt (não treinamento de ML)

## Status
Aceito.

## Problema
O produto deve usar o desempenho passado de cada canal (melhores horários, títulos, hashtags, duração) para melhorar as gerações seguintes — um loop de aprendizado contínuo. É preciso decidir a forma de implementação, dado o estágio MVP/early-stage (RNF de custo e simplicidade — ver [product/requirements-non-functional.md](../product/requirements-non-functional.md)).

## Alternativas
1. **Treinamento/fine-tuning de modelo próprio** por canal ou por nicho — melhor personalização teórica, mas custo de infraestrutura de ML, dado de treino insuficiente por canal no início (cold start), e complexidade operacional incompatível com a escala/orçamento do MVP.
2. **Agregação estatística de desempenho (`ChannelInsights`) + aumento do prompt de IA generativa existente** — sem infraestrutura de ML nova; usa os mesmos provedores já integrados (Claude/OpenAI — [ADR-0008](0008-ai-provider-strategy-claude-openai.md)), passando os insights como contexto adicional no prompt de seleção/geração de copy.

## Escolha
**Alternativa 2.** Um job periódico (diário, antes do horário de geração em lote do canal) calcula `ChannelInsights` a partir do histórico de `AnalyticsSnapshot` dos vídeos publicados daquele canal: melhores horários (por engajamento), padrões de título com melhor desempenho, hashtags mais associadas a bom desempenho, duração média dos vídeos com melhor retenção. Esses insights são passados como contexto adicional para `AiCompletionProvider.selectHighlight`/`generateCopy` na próxima geração.

## Consequências
- Novo Domain Service `ChannelLearningService` (contexto Channel Management) e Use Case `UpdateChannelInsightsUseCase`, executado pelo Analytics Worker (mesmo worker que já lê métricas — evita criar um 8º worker).
- `ChannelInsights` é uma projeção derivada, recalculada periodicamente — nunca editada manualmente, sempre reconstruível a partir de `AnalyticsSnapshot` (não é fonte de verdade, é cache de leitura).
- Canal novo (sem histórico) simplesmente não tem `ChannelInsights` ainda — `GenerateVideoContentUseCase` trata ausência de insights como caso normal (usa apenas o `PromptTemplate` padrão do nicho), não como erro.
- Custo adicional é apenas de agregação local (consulta ao banco), sem chamada de IA extra — o aumento de contexto acontece dentro da mesma chamada de `generateCopy`/`selectHighlight` já planejada.

## Trade-offs
- Não é personalização por aprendizado de máquina real — é heurística estatística mais prompt engineering. É uma limitação consciente para manter custo/complexidade dentro do estágio do produto; se a qualidade percebida não for suficiente, fine-tuning por nicho (não por canal individual, que teria dado insuficiente) é candidato de fase 2.
- Insights são recalculados em lote (não em tempo real) — uma mudança de desempenho muito recente só influencia a geração do dia seguinte, nunca a do mesmo dia.
