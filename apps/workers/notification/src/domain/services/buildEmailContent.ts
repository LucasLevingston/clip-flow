import type { EmailContent, NotificationEvent } from "../types"

export function buildEmailContent(event: NotificationEvent): EmailContent {
  switch (event.category) {
    case "TenantCreated":
      return { subject: "Bem-vindo ao Clip Flow!", body: "Sua conta foi criada com sucesso." }
    case "SocialAccountConnected":
      return {
        subject: "Conta social conectada com sucesso",
        body: `A plataforma ${event.payload.platform} foi conectada ao seu canal.`,
      }
    case "SocialAccountNeedsReauth":
      return {
        subject: "Ação necessária: reconecte sua conta social",
        body: "Uma das suas contas sociais precisa ser reautenticada para continuar publicando.",
      }
    case "VideoContentGenerationFailed":
      return {
        subject: "Falha ao gerar conteúdo de vídeo",
        body: `A geração do vídeo falhou: ${event.payload.reason}`,
      }
    case "VideoFlaggedForModeration":
      return {
        subject: "Vídeo aguardando moderação",
        body: `Um vídeo foi sinalizado para moderação: ${event.payload.flagReason}`,
      }
    case "VideoProcessingFailed":
      return {
        subject: "Falha ao processar vídeo",
        body: `O processamento do vídeo falhou: ${event.payload.reason}`,
      }
    case "VideoPublished":
      return {
        subject: "Vídeo publicado com sucesso",
        body: `Seu vídeo foi publicado em ${event.payload.platform}.`,
      }
    case "VideoPublishFailed":
      return {
        subject: "Falha ao publicar vídeo",
        body: `A publicação em ${event.payload.platform} falhou: ${event.payload.reason}`,
      }
    case "PlanLimitReached":
      return {
        subject: "Limite do plano atingido",
        body: `Você atingiu o limite do seu plano: ${event.payload.limitType}`,
      }
  }
}
