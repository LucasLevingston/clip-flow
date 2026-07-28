# ADR-0012 — Geração em Lote Diária + Publicação em Horários Estratégicos

## Status
Aceito.

## Problema
O modelo inicial do Scheduler Worker disparava geração de forma acoplada a cada slot de publicação (um `GenerationScheduled` por horário configurado). O comportamento real esperado é diferente: **todos os X vídeos do dia são gerados de uma vez, cedo pela manhã**, e depois **publicados em horários estratégicos espalhados ao longo do dia** (ex.: 09h, 12h, 16h, 20h) — geração e publicação são desacopladas no tempo.

## Alternativas
1. **Gerar e publicar no mesmo disparo** (modelo anterior) — mais simples, mas não reflete "gera de manhã, publica ao longo do dia" e desperdiça a janela matinal como tempo de processamento/folga para revisão/moderação.
2. **Lote matinal de geração + jobs de publicação com delay individual**: um único disparo diário (`generationTime` do canal, padrão 06:00) gera os N vídeos do dia (N = `videosPerDay`), cada um já nascendo com um `scheduledPublishAt` (um dos `publishTimes` do canal); a publicação de cada vídeo é um job BullMQ com `delay` calculado até seu horário.

## Escolha
**Alternativa 2.**

## Consequências
- `Channel.generationTime` (padrão 06:00, timezone do tenant) dispara **um único** `GenerationScheduled` por canal por dia, com `videosPerDay` como parâmetro — não mais um disparo por slot de publicação.
- `GeneratedVideo` ganha `batchRunId` (substitui `scheduleRunId`) — identifica o lote diário de um canal, e `scheduledPublishAt` — o horário-alvo de publicação daquele vídeo específico dentro do lote.
- Ao concluir o corte (`CutVideoUseCase`), o Video Worker não publica imediatamente: enfileira o job de publicação na fila `upload` com `delay = scheduledPublishAt - now`. Se `scheduledPublishAt` já passou (pipeline atrasou), publica imediatamente.
- A janela entre geração (manhã) e primeira publicação vira **tempo de folga natural para moderação** (RF-11) — vídeos sinalizados têm até a manhã inteira para revisão antes do primeiro horário de publicação, sem pressão de tempo real.
- Idempotência (RNF-34) agora é por `(batchRunId, publishSlotIndex)` em vez de por slot de agenda individual.

## Trade-offs
- Se a geração matinal falhar parcialmente (ex.: 2 de 4 vídeos falham), os horários de publicação daqueles 2 ficam vagos naquele dia — aceito como comportamento esperado (falha parcial não trava os demais, RNF-16), notificado ao usuário.
- Acoplar geração a um único horário diário por canal é menos flexível que gerar sob demanda a qualquer hora, mas está alinhado ao modelo mental do usuário ("de manhã a IA busca os cortes") e simplifica drasticamente o Scheduler Worker (1 trigger/dia/canal em vez de N triggers/dia/canal).
