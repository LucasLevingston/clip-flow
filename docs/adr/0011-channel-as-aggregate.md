# ADR-0011 — Channel como Aggregate Root Central

## Status
Aceito. **Substitui parcialmente** o modelo de `NicheSubscription` + `PublishSchedule` descrito nas versões iniciais deste documento (ver histórico em [CHANGELOG.md](../CHANGELOG.md)).

## Problema
O desenho inicial do domínio tratava "assinar um nicho" e "configurar agenda de publicação" como conceitos independentes ligados ao tenant. O uso real do produto, esclarecido pelo usuário após a Fase 0 inicial, é diferente: o usuário cria **Canais**, cada um apontando para exatamente um nicho, com sua própria configuração de geração/publicação e suas próprias credenciais de conta social — um tenant pode ter vários canais, inclusive mais de um para o mesmo nicho.

## Alternativas
1. **Manter `NicheSubscription` + `PublishSchedule` + `SocialAccount` no nível do tenant**, com um agrupamento lógico calculado em memória.
2. **Introduzir `Channel` como Aggregate Root**, unificando nicho + configuração de geração/publicação em uma única entidade; `SocialAccount` passa a referenciar `channelId` (mas permanece seu próprio Aggregate Root, por ter ciclo de vida de token independente).

## Escolha
**Alternativa 2 — `Channel` como Aggregate Root central do produto.**

```
Tenant 1---N Channel 1---N SocialAccount (máx. 1 YouTube + 1 TikTok por canal)
Channel N---1 Niche
```

`Channel` absorve os campos antes espalhados em `NicheSubscription` (vínculo com nicho, status ativo/pausado) e `PublishSchedule` (quantidade de vídeos/dia, horários, janela) — um canal **é** a unidade de configuração de automação, não uma composição de três entidades separadas.

## Consequências
- `NicheSubscription` e `PublishSchedule` são **removidos** como entidades independentes (ver [domain/entities-value-objects.md](../domain/entities-value-objects.md)).
- Limite de plano (RF-08) passa a contar **canais** (`maxChannels`), não "nichos assinados" — um tenant pode ter 2 canais no mesmo nicho, cada um publicando em plataformas diferentes ou com configuração diferente.
- `SocialAccount` migra de `tenantId` para `channelId` como chave de escopo — a conexão OAuth é feita no contexto de um canal específico.
- `GeneratedVideo` referencia `channelId` (e mantém `tenantId` denormalizado para filtro de isolamento — ver [ADR-0005](0005-multi-tenant-strategy.md)).
- Bounded contexts "Social Integration" e "Scheduling" (ver versão anterior de [domain/bounded-contexts.md](../domain/bounded-contexts.md)) são fundidos em um único contexto **Channel Management**.

## Trade-offs
- Migração de modelo mental "nicho como unidade" para "canal como unidade" é mais próxima do produto real (canal de YouTube/TikTok é o conceito que o usuário já entende), tornando UI e API mais intuitivas.
- Um canal com `platforms = BOTH` exige que **ambas** as contas sociais estejam `CONNECTED` antes de ser elegível para o Scheduler (`IsChannelReadyToPublishSpecification`) — mais rígido que permitir publicação parcial, mas evita "espelhamento" incompleto e confuso para o usuário.
