# Integração — OpenCV

## Propósito
Detecção de foco (rosto/sujeito principal) em frames amostrados do trecho cortado, para calcular o crop dinâmico 9:16 — diferencial de qualidade do produto (ver [ADR-0009](../adr/0009-video-processing-ffmpeg-opencv.md)).

## Modo de uso
Binding Node (`opencv4nodejs` ou equivalente mantido) na imagem Docker do Video Worker, usado por um componente de infraestrutura (`FocusDetectionService`) atrás de uma interface de domínio (`FocusDetector`), nunca chamado diretamente por Use Cases.

## Algoritmo (referência de implementação)
1. Amostra N frames uniformemente distribuídos ao longo do trecho cortado.
2. Aplica detector de rosto (Haar Cascade ou DNN leve) por frame amostrado.
3. Calcula centro de massa dos rostos detectados ao longo dos frames (posição mediana, para suavizar ruído entre frames).
4. Se nenhum rosto detectado em nenhum frame, aplica fallback de crop central (documentado como comportamento esperado, não erro).

## Erros tratados
| Erro | Tratamento |
|---|---|
| Falha de carregamento de modelo de detecção | Log de erro, fallback para crop central (não bloqueia o pipeline) |
| Nenhum rosto detectado | Fallback para crop central (comportamento normal, não é falha) |

## Segredos necessários
Nenhum (processamento local).

## Nota de infraestrutura
Modelo de detecção (arquivo de pesos) é empacotado na imagem Docker do Video Worker, versionado junto ao código — trocar de modelo é uma mudança de build, não de configuração em runtime.
