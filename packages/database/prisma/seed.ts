import "dotenv/config"
import { prisma } from "../src/prismaClient"

// Development/staging seed only — production never runs this (see
// docs/database/migrations.md).
async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed must never run against production")
  }

  const plans = [
    {
      name: "TRIAL",
      maxChannels: 1,
      maxVideosPerDayPerChannel: 1,
      priceCents: 0,
    },
    {
      name: "STARTER",
      maxChannels: 1,
      maxVideosPerDayPerChannel: 3,
      priceCents: 4900,
    },
    {
      name: "PRO",
      maxChannels: 3,
      maxVideosPerDayPerChannel: 5,
      priceCents: 14900,
    },
    {
      name: "AGENCY",
      maxChannels: 10,
      maxVideosPerDayPerChannel: 10,
      priceCents: 49900,
    },
  ]
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    })
  }

  const niches = [
    {
      name: "Futebol",
      slug: "futebol",
      category: "Esportes",
      description: "Melhores momentos e jogadas de futebol.",
    },
    {
      name: "NBA",
      slug: "nba",
      category: "Esportes",
      description: "Melhores momentos e jogadas da NBA.",
    },
    {
      name: "Valorant",
      slug: "valorant",
      category: "Games",
      description: "Highlights e jogadas de Valorant.",
    },
  ]

  for (const niche of niches) {
    const created = await prisma.niche.upsert({
      where: { slug: niche.slug },
      update: {},
      create: {
        name: niche.name,
        slug: niche.slug,
        category: niche.category,
        description: niche.description,
        status: "ACTIVE",
      },
    })

    for (let i = 1; i <= 2; i += 1) {
      await prisma.sourceVideo.create({
        data: {
          nicheId: created.id,
          durationSeconds: 1800,
          licenseType: "PUBLIC_DOMAIN",
          licenseReference: `seed-${niche.slug}-${i}`,
          status: "APPROVED",
          storageUrl: `https://example-storage.local/seed/${niche.slug}-${i}.mp4`,
        },
      })
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
