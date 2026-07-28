# ADR-0013 — Thumbnail via Extração de Frame (não geração sintética)

## Status
Aceito.

## Problema
O produto deve oferecer thumbnail opcional para cada corte gerado. É preciso decidir entre gerar uma imagem sintética (nova chamada de IA generativa de imagem) ou extrair um frame do próprio vídeo já processado.

## Alternativas
1. **Geração sintética via IA de imagem** (ex.: DALL-E, Midjourney API) — visual customizado, porém nova integração, novo custo por vídeo (RNF-21/22) e novo risco de inconsistência entre thumbnail e conteúdo real do vídeo.
2. **Extração do melhor frame do próprio corte**, reaproveitando a mesma detecção de foco já usada no reenquadramento (OpenCV — ver [ADR-0009](0009-video-processing-ffmpeg-opencv.md)), com critério de nitidez/composição.

## Escolha
**Alternativa 2** — `ThumbnailExtractionService`, parte do Video Worker, seleciona o frame com maior score de nitidez (variância de Laplaciano) dentre os frames amostrados durante a detecção de foco já existente, sem nenhuma chamada de rede adicional.

## Consequências
- Nenhuma nova integração externa é necessária — reaproveita 100% do pipeline FFmpeg/OpenCV já implementado (ADR-0009).
- Custo adicional por vídeo é ~0 (processamento local, mesmo frame amostrado da etapa de reenquadramento).
- `thumbnailEnabled` no `Channel` apenas liga/desliga a etapa; quando desligado, plataformas usam a thumbnail automática padrão delas (YouTube/TikTok já geram uma se nenhuma for enviada).
- `GeneratedVideo.thumbnailUrl` é opcional (`null` quando `thumbnailEnabled = false`).

## Trade-offs
- Thumbnail extraída do próprio vídeo é sempre fiel ao conteúdo, mas não permite composições customizadas (texto grande, elementos gráficos) que uma geração sintética permitiria — aceitável para o MVP; geração sintética fica como possível evolução de fase 2 caso vire pedido recorrente de usuários.
