# ADR-0006 — Estratégia de Aquisição de Conteúdo-Fonte

## Status
Aceito

## Problema
O sistema precisa de vídeos-fonte por nicho para gerar cortes diariamente. Existem várias formas de obter essa matéria-prima, com implicações legais, de custo e de qualidade muito diferentes. Esta é a decisão de maior risco do produto (ver [risks/risk-matrix.md](../risks/risk-matrix.md), risco R-01).

## Alternativas
1. **Scraping automático de plataformas (YouTube/TikTok) por nicho** — sem intervenção humana, mas republicar conteúdo de terceiros sem licença viola Termos de Serviço das plataformas e possivelmente direitos autorais.
2. **Pool curado manualmente pela administração**, com vídeos-fonte licenciados, de domínio público, ou fornecidos por parceiros/criadores com acordo explícito de uso.
3. **Geração 100% sintética** (texto-para-vídeo via IA, sem vídeo-fonte real) — evita todo risco de direito autoral, mas é um produto diferente (não é "repurpose de nicho") e tem custo de IA generativa de imagem/vídeo muito mais alto.

## Escolha
**MVP: pool curado manualmente pela administração (alternativa 2)**, através de:
- Vídeos de domínio público ou licença permissiva (Creative Commons compatível com uso comercial).
- Acordos diretos com criadores/parceiros que autorizam explicitamente o reuso (`SourceVideo.licenseType`, `licenseReference` registrados).
- Nenhum conteúdo é ingerido automaticamente de plataformas de terceiros sem essa cadeia de autorização documentada.

O domínio é desenhado com uma abstração `ContentSourceProvider` (Domain Service com Strategy Pattern) para permitir, no futuro, plugar novas formas de aquisição (API de parceiro licenciado, upload direto de criador parceiro) **sem** alterar o restante do pipeline — mas scraping automático de plataformas de terceiros é explicitamente **fora de escopo permanente** enquanto não houver parceria/licenciamento formal.

## Consequências
- Cada `SourceVideo` carrega metadado obrigatório de licença/autorização — auditável.
- Pipeline de IA (seleção de trecho, geração de copy) varia a saída por tenant mesmo usando o mesmo `SourceVideo`, reduzindo risco de conteúdo duplicado entre canais de tenants diferentes (mitiga também política de "conteúdo duplicado" das próprias plataformas de destino).
- Operação exige um processo administrativo contínuo de curadoria (RF-07) — é custo operacional, não só técnico.
- Catálogo de nichos é fixo/administrado no MVP (conforme decisão de produto), mas a entidade `Niche` já é modelada como catálogo extensível (não enum fixo em código) para permitir criação de novos nichos via admin console sem deploy (Objetivo O5).

## Trade-offs
- Alternativa 1 (scraping) foi rejeitada por risco legal e de ToS considerado inaceitável para um SaaS comercial — é o principal risco técnico/legal do produto e está documentado como tal.
- Alternativa 3 (síntese total) foi descartada do MVP por custo de IA generativa de vídeo/imagem ser proibitivo na escala early-stage e por mudar a proposta de valor do produto (deixaria de ser "automação de nicho a partir de conteúdo real"); fica registrada como possível fase 3.
- A curadoria manual (escolhida) é o gargalo de crescimento mais provável do produto — mitigação e monitoramento tratados em [risks/risk-matrix.md](../risks/risk-matrix.md).
