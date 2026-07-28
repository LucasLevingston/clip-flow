# ADR-0009 — Processamento de Vídeo: FFmpeg + OpenCV

## Status
Aceito

## Problema
É preciso cortar trechos de um vídeo-fonte longo, reenquadrar para 9:16 mantendo o sujeito principal no quadro, queimar legendas sincronizadas e exportar no formato exigido por YouTube Shorts/TikTok.

## Alternativas
1. **FFmpeg (corte, encode, legenda) + OpenCV (detecção de foco/rosto para reenquadramento inteligente)**, ambos invocados a partir do Video Worker Node via processo/binding.
2. **Serviço de vídeo gerenciado de terceiro** (ex.: Shotstack, Cloudinary Video) — menos código próprio, porém custo por vídeo mais alto e menor controle sobre o algoritmo de reenquadramento (diferencial do produto).
3. **Somente FFmpeg, sem OpenCV** (crop central fixo, sem detecção inteligente) — mais simples, qualidade inferior.

## Escolha
**FFmpeg + OpenCV (alternativa 1)**, encapsulados atrás de um `VideoProcessingService` de infraestrutura, com etapas: corte por timestamp → detecção de foco (OpenCV, cascade/DNN de rosto) → cálculo de crop dinâmico 9:16 → encode final com legenda queimada (FFmpeg `drawtext`/`subtitles` filter).

## Consequências
- Custo por vídeo previsível (processamento local no worker, sem taxa por minuto de terceiro), alinhado a RNF-21/22.
- Controle total sobre o algoritmo de reenquadramento é um diferencial de qualidade do produto (Objetivo O2).
- Video Worker exige imagem Docker com FFmpeg e dependências OpenCV instaladas — documentado em [workers/video-worker.md](../workers/video-worker.md) e no pipeline de deploy.
- Processamento é CPU-bound; timeout e limite de recursos por job são obrigatórios (RNF-35) para não degradar outros jobs na mesma réplica.

## Trade-offs
- Maior esforço de implementação/manutenção do que um serviço gerenciado (alternativa 2); aceito porque o reenquadramento inteligente é core do produto e custo por vídeo de terceiros não escala bem financeiramente em early-stage.
- Crop central fixo (alternativa 3) foi rejeitado por gerar cortes de qualidade inferior (sujeito fora de quadro), impactando diretamente RNF/Objetivo de qualidade sem revisão humana (O2).
