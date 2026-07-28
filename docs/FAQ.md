# FAQ

**O produto grava vídeo do zero ou usa vídeo existente?**
Usa vídeo-fonte existente, licenciado/autorizado, curado por nicho pela administração da plataforma. Não é geração 100% sintética — ver [ADR-0006](adr/0006-content-source-strategy.md).

**O usuário pode criar seu próprio nicho?**
Não no MVP. O catálogo é fixo, curado pela administração. A arquitetura já suporta extensão futura (novo nicho é cadastro administrativo, sem deploy de código), e criação por tenant é candidata a fase 2 — ver [product/vision.md](product/vision.md) seção 4.

**Dois canais podem apontar para o mesmo nicho e usar o mesmo vídeo-fonte?**
Sim, inclusive dois canais do mesmo tenant. A transcrição é compartilhada (cache), mas a seleção de trecho e a copy variam entre canais (`HighlightDiversityPolicy`) para reduzir risco de conteúdo duplicado — ver [ADR-0006](adr/0006-content-source-strategy.md).

**O que acontece se o pool de vídeos-fonte de um nicho acabar?**
O Scheduler Worker gera o máximo possível com as fontes disponíveis para aquele canal e alerta a administração (FA1) — não falha silenciosamente nem reusa vídeo já publicado para o mesmo canal.

**Quais plataformas são suportadas no MVP?**
YouTube (Shorts) e TikTok. Instagram Reels e outras são fase 2 — ver [product/vision.md](product/vision.md) seção 4.

**Como o sistema evita publicar o mesmo vídeo duas vezes?**
Constraint única `(generated_video_id, social_account_id)` em `PublishRecord`, verificada antes de cada tentativa de publicação (RNF-34) — ver [architecture/upload-flow.md](architecture/upload-flow.md).

**O que é o "Administrador da Plataforma" e como difere de um Owner de tenant?**
`PLATFORM_ADMIN` é um papel de operação da plataforma em si (curadoria de nichos, moderação, saúde), independente de qualquer tenant. `OWNER` é o papel máximo dentro de um tenant específico. Um usuário pode ser um sem ser o outro — ver [security/authentication-authorization.md](security/authentication-authorization.md).

**Onde encontro o custo estimado de IA por vídeo?**
No dashboard operacional administrativo, agregado por execução (RNF-21) — ver [observability/observability.md](observability/observability.md).

**Preciso de aprovação da TikTok para publicar em produção?**
Sim, o app precisa sair do modo sandbox — processo com lead time externo, tratado como risco de cronograma (R-06 em [risks/risk-matrix.md](risks/risk-matrix.md)), a iniciar já na Sprint 4 do roadmap.

**Onde fica documentado o processo de exercício de direitos LGPD (DPO, canal de contato)?**
Definição do canal formal é responsabilidade do processo legal da empresa, fora do escopo técnico — a implementação técnica de suporte (exclusão, anonimização, exportação) está em [security/lgpd-compliance.md](security/lgpd-compliance.md).
