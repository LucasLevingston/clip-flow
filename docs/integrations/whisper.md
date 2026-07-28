# Integração — Whisper

## Propósito
Transcrição de áudio dos vídeos-fonte para texto com timestamps por segmento, base para seleção de trecho e geração de legenda.

## Modo de uso
Via API (ex.: Whisper API da OpenAI) — preferido a rodar modelo local no worker no MVP, para evitar custo de GPU/infra própria (alinhado a [ADR-0007](../adr/0007-deploy-target-vercel-railway.md)). Migração para modelo local/self-hosted é um caminho de growth caso o custo por minuto se torne relevante (RNF-21).

## Uso no pipeline
`WhisperAdapter` implementa a interface de domínio `TranscriptionProvider`. Resultado é normalizado para `Transcript.segments` (`[{ startMs, endMs, text }]`) e cacheado por `sourceVideoId` — nunca re-transcrito para o mesmo vídeo-fonte (ver [architecture/ai-flow.md](../architecture/ai-flow.md)).

## Erros tratados
| Erro | Tratamento |
|---|---|
| Timeout (vídeo muito longo) | Falha da etapa, retry; após esgotar, `GeneratedVideo.status = FAILED` |
| Áudio inaudível/silencioso | Falha definitiva, marca `SourceVideo` para revisão administrativa (conteúdo-fonte de baixa qualidade) |

## Custo
Custo por minuto de áudio transcrito, registrado por `sourceVideoId` (compartilhado entre canais via cache — custo pago uma única vez por vídeo-fonte).

## Segredos necessários
`WHISPER_API_KEY` (ou reaproveita `OPENAI_API_KEY` se usando Whisper via OpenAI).
