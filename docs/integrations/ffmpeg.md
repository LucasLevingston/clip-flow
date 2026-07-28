# Integração — FFmpeg

## Propósito
Corte de trecho, encode final, aplicação de crop dinâmico e legenda queimada — ver [ADR-0009](../adr/0009-video-processing-ffmpeg-opencv.md).

## Modo de uso
Binário FFmpeg instalado na imagem Docker do Video Worker, invocado via `child_process` a partir de um `VideoProcessingService` de infraestrutura (nunca chamado diretamente de código de domínio/aplicação — DIP).

## Comandos-chave (referência de implementação)
- Corte: `-ss <start> -to <end> -c copy` (corte rápido sem re-encode quando possível) seguido de encode final com filtros.
- Crop dinâmico: filtro `crop=w:h:x:y` calculado a partir da detecção do OpenCV.
- Legenda queimada: filtro `subtitles=` (arquivo `.srt` gerado a partir de `Transcript.segments`) ou `drawtext` para estilo customizado.
- Encode final: `-c:v libx264 -preset veryfast -c:a aac`, resolução/proporção conforme [integrations/youtube.md](youtube.md)/[integrations/tiktok.md](tiktok.md).

## Erros tratados
| Erro | Tratamento |
|---|---|
| Exit code ≠ 0 | Captura stderr, log estruturado, retry 1x (ver [workers/video-worker.md](../workers/video-worker.md)) |
| Arquivo de entrada corrompido | Falha definitiva, marca `SourceVideo` para revisão administrativa |

## Segredos necessários
Nenhum (processamento local, sem chamada de rede).

## Nota de infraestrutura
Imagem Docker do Video Worker deve fixar versão do FFmpeg (ex.: `ffmpeg:6.x`) para evitar comportamento divergente entre ambientes — documentado no Dockerfile do worker.
