import { ChannelSettingsForm } from "@/features/channels"

export default async function ChannelSettingsPage({
  params,
}: {
  params: Promise<{ channelId: string }>
}) {
  const { channelId } = await params

  return (
    <main>
      <h1>Configurações do canal</h1>
      <ChannelSettingsForm channelId={channelId} />
    </main>
  )
}
