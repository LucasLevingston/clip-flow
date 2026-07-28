# Integração — OpenAI

## Propósito
Provedor de fallback de IA generativa (quando Claude falha/indisponível) e provedor primário para tarefas auxiliares mais simples (ex.: geração de hashtags) — ver [ADR-0008](../adr/0008-ai-provider-strategy-claude-openai.md).

## API utilizada
OpenAI Chat Completions / Responses API.

## Uso no pipeline
`OpenAiAdapter` implementa a mesma interface `AiCompletionProvider`. Contrato de entrada/saída idêntico ao `ClaudeAdapter` — o Use Case (`GenerateVideoContentUseCase`) não sabe qual dos dois está respondendo.

## Erros tratados
| Erro | Tratamento |
|---|---|
| Timeout/5xx/429 | Job entra em retry padrão do AI Worker; se ambos os provedores falharem, `GeneratedVideo.status = FAILED` |
| Resposta fora do schema esperado | 1 retry com instrução reforçada; se persistir, falha definitiva da etapa |

## Custo
Tokens registrados por chamada, associados a `generatedVideoId` (RNF-21).

## Segredos necessários
`OPENAI_API_KEY`.
