# Video Worker

## Responsabilidade
Transformar o conteúdo selecionado pela IA (`HighlightSelection`) em um arquivo de vídeo final pronto para publicação: corte por timestamp, reenquadramento inteligente 9:16, legenda queimada, thumbnail opcional, e agendamento da publicação atrasada até `scheduledPublishAt` (ver [architecture/ai-flow.md](../architecture/ai-flow.md), [ADR-0009](../adr/0009-video-processing-ffmpeg-opencv.md), [ADR-0012](../adr/0012-batch-generation-delayed-publish.md), [ADR-0013](../adr/0013-thumbnail-frame-extraction.md)).

## Entradas
- Job da fila `video`, payload: `{ generatedVideoId, tenantId, channelId, scheduledPublishAt, traceId, attempt }`.
- Lê de banco: `GeneratedVideo` (com `highlight`), `SourceVideo.storageUrl`, `Transcript.segments` (para legenda), `Channel.thumbnailEnabled`.

## Saídas
- Arquivo de vídeo final em `Object Storage` (`GeneratedVideo.finalAssetUrl`) e, se habilitado, `GeneratedVideo.thumbnailUrl`.
- Atualização de `GeneratedVideo.status` para `READY_TO_PUBLISH` ou `FAILED`.
- Job de publicação enfileirado na fila `upload` com `delay` até `scheduledPublishAt` (evento `VideoReadyToPublish`), ou `VideoProcessingFailed` (falha) publicado na fila `notification`.

## Fila
- Consome: `video`
- Produz: `upload`, `notification` (em caso de falha)

## Eventos
- Consumido: `VideoContentGenerated`
- Publicado: `VideoReadyToPublish`, `VideoProcessingFailed`

## Etapas internas
1. Download do `SourceVideo` do Object Storage para disco temporário do worker.
2. `FFmpeg`: corte do trecho `[highlight.startMs, highlight.endMs]`.
3. `OpenCV`: detecção de foco (rosto/sujeito principal) por amostragem de frames do trecho cortado.
4. Cálculo do crop dinâmico 9:16 a partir do foco detectado (fallback: crop central se detecção falhar).
5. `FFmpeg`: aplica crop, queima legenda sincronizada (`VideoCopy`/`Transcript`).
6. Encode final (H.264, especificações por plataforma — ver [integrations/youtube.md](../integrations/youtube.md), [integrations/tiktok.md](../integrations/tiktok.md)).
7. Se `Channel.thumbnailEnabled`: `ThumbnailFrameSelector` escolhe o frame de maior nitidez entre os amostrados na etapa 3 e o salva como `thumbnailUrl` (nenhuma chamada de rede adicional — ver [ADR-0013](../adr/0013-thumbnail-frame-extraction.md)).
8. Upload do(s) artefato(s) final(is) para Object Storage; limpeza de arquivos temporários (sempre executada, inclusive em falha — `finally`).
9. Enfileira job de publicação na fila `upload` com `delay = max(0, scheduledPublishAt - now)`.

## Tratamento de erros
| Erro | Ação |
|---|---|
| Falha de download do vídeo-fonte | Retry; após esgotar, `GeneratedVideo.status = FAILED`, `VideoProcessingFailed` |
| Falha de detecção de foco (OpenCV) | Fallback para crop central; não é erro fatal (`VideoQualityGate` ainda valida o resultado) |
| Falha de encode FFmpeg (exit code ≠ 0) | Retry 1x; após 2ª falha, `FAILED` |
| Timeout de processamento | Job morto, marcado `FAILED`, dead-letter |

## Retries
Máximo 2 tentativas, backoff fixo de 30s (processamento é CPU-bound; backoff exponencial longo não ajuda aqui).

## Timeout
10 minutos por job (RNF-02 reserva o restante do orçamento de 15 min para as demais etapas do pipeline).

## Recursos
CPU-bound — réplica dedicada com limite de concorrência 1 job simultâneo por réplica (evita contenção de CPU entre jobs); escalar horizontalmente via número de réplicas (RNF-12).
