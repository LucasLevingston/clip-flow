# C4 — Nível 1: Contexto

```mermaid
C4Context
title Clip Flow — Diagrama de Contexto

Person(tenantUser, "Usuário do Tenant", "Criador solo ou agência que assina nichos e recebe canais publicando automaticamente")
Person(platformAdmin, "Administrador da Plataforma", "Cura nichos e pool de vídeos-fonte, monitora saúde do sistema")

System(clipFlow, "Clip Flow", "SaaS de automação de criação e publicação de vídeos curtos por nicho")

System_Ext(youtube, "YouTube API", "Publicação de Shorts e coleta de métricas")
System_Ext(tiktok, "TikTok Content Posting API", "Publicação de vídeos e coleta de métricas")
System_Ext(claude, "Claude (Anthropic API)", "Seleção de trechos e geração de copy")
System_Ext(openai, "OpenAI API", "Fallback de IA generativa e tarefas auxiliares")
System_Ext(whisper, "Whisper", "Transcrição de áudio dos vídeos-fonte")
System_Ext(stripe, "Stripe", "Cobrança recorrente de planos SaaS")
System_Ext(email, "Provedor de E-mail Transacional", "Notificações por e-mail")

Rel(tenantUser, clipFlow, "Configura nichos, contas sociais e agenda; acompanha dashboard", "HTTPS")
Rel(platformAdmin, clipFlow, "Cura nichos, aprova conteúdo-fonte, monitora saúde", "HTTPS")

Rel(clipFlow, youtube, "Publica vídeos, coleta métricas", "OAuth2 / REST")
Rel(clipFlow, tiktok, "Publica vídeos, coleta métricas", "OAuth2 / REST")
Rel(clipFlow, claude, "Seleciona trechos, gera título/legenda", "REST")
Rel(clipFlow, openai, "Fallback de IA / tarefas auxiliares", "REST")
Rel(clipFlow, whisper, "Transcreve vídeo-fonte", "REST/local")
Rel(clipFlow, stripe, "Processa assinaturas e cobranças", "REST/Webhook")
Rel(clipFlow, email, "Envia notificações transacionais", "REST/SMTP")
```

## Atores e sistemas externos

| Ator/Sistema | Papel |
|---|---|
| Usuário do Tenant | Configura o produto; nunca interage diretamente com o pipeline de geração |
| Administrador da Plataforma | Opera o catálogo de nichos e a saúde operacional; não é tenant |
| YouTube API | Publicação (YouTube Shorts) e leitura de métricas |
| TikTok Content Posting API | Publicação e leitura de métricas |
| Claude / OpenAI | Provedores duais de IA generativa (ver [ADR-0008](../adr/0008-ai-provider-strategy-claude-openai.md)) |
| Whisper | Transcrição de áudio dos vídeos-fonte |
| Stripe | Gateway de pagamento e assinaturas recorrentes |
| Provedor de e-mail | Envio de notificações transacionais (ex.: Resend/SendGrid) |
