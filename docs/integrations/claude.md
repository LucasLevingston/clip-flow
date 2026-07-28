# Integração — Claude (Anthropic API)

## Propósito
Provedor primário de IA generativa para seleção de trecho (`selectHighlight`) e geração de copy (`generateCopy`) — ver [ADR-0008](../adr/0008-ai-provider-strategy-claude-openai.md).

## API utilizada
Anthropic Messages API.

## Uso no pipeline
`ClaudeAdapter` implementa a interface de domínio `AiCompletionProvider` (ver [domain/domain-services-application-services.md](../domain/domain-services-application-services.md)). Recebe `Transcript` + `PromptTemplate` ativo do nicho + contexto de diversidade (trechos já usados por outros canais) + `ChannelInsights` do canal, quando disponível (ver [ADR-0014](../adr/0014-learning-loop-prompt-augmentation.md)), e retorna `HighlightSelection` estruturada (via structured output/tool use, não parsing de texto livre).

## Erros tratados
| Erro | Tratamento |
|---|---|
| Timeout | Fallback para OpenAI (`AiProviderFallbackPolicy`) |
| `429` rate limit | Fallback para OpenAI |
| `5xx` erro de serviço | Fallback para OpenAI |
| Resposta fora do schema esperado | 1 retry com instrução reforçada; se persistir, fallback para OpenAI |

## Custo
Tokens de entrada/saída registrados por chamada, associados a `generatedVideoId` (RNF-21).

## Segredos necessários
`ANTHROPIC_API_KEY`.

## Nota de modelo
Uso de modelo Claude atual recomendado no momento da implementação (ver skill `claude-api` para escolha de modelo/pricing atualizados) — não fixar versão de modelo em documentação estática; configurável via variável de ambiente `CLAUDE_MODEL_ID`.
