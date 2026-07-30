# Integração — OpenCV

## Propósito

Detecção de foco (rosto/sujeito principal) em frames amostrados do trecho cortado, para calcular o crop dinâmico 9:16 — diferencial de qualidade do produto (ver [ADR-0009](../adr/0009-video-processing-ffmpeg-opencv.md)).

## Modo de uso

OpenCV roda como processo Python separado (`opencv-python`), invocado via `child_process` a partir de um adapter de infraestrutura (`OpenCvFocusDetector`) atrás de uma interface de domínio (`FocusDetector`), nunca chamado diretamente por Use Cases. Preferido a bindings nativos do Node (ex.: `opencv4nodejs`) — evita compilação nativa na imagem Docker/máquina de desenvolvimento, dependência mais simples e estável entre ambientes.

## Algoritmo (referência de implementação)

1. `FfmpegVideoProcessingService` amostra N frames uniformemente distribuídos ao longo do trecho cortado (extraídos como imagens).
2. Script Python (`scripts/analyze_frames.py`) roda sobre os frames amostrados numa única chamada: detector de rosto (`cv2.FaceDetectorYN` — YuNet, leve, ONNX) por frame, e nitidez (variância de Laplaciano, reaproveitada por `ThumbnailFrameSelector` — [ADR-0013](../adr/0013-thumbnail-frame-extraction.md)). Resultado retorna como JSON no stdout.
3. `OpenCvFocusDetector` calcula centro de massa dos rostos detectados ao longo dos frames (posição mediana, para suavizar ruído entre frames).
4. Se nenhum rosto detectado em nenhum frame, aplica fallback de crop central (documentado como comportamento esperado, não erro).

## Erros tratados

| Erro                                        | Tratamento                                                        |
| ------------------------------------------- | ----------------------------------------------------------------- |
| Falha de carregamento de modelo de detecção | Log de erro, fallback para crop central (não bloqueia o pipeline) |
| Nenhum rosto detectado                      | Fallback para crop central (comportamento normal, não é falha)    |

## Segredos necessários

Nenhum (processamento local).

## Nota de infraestrutura

Modelo de detecção (arquivo de pesos) é empacotado na imagem Docker do Video Worker, versionado junto ao código — trocar de modelo é uma mudança de build, não de configuração em runtime.
