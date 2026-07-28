import { buildServer } from "./interface/http/buildServer"

const port = process.env.PORT ? Number(process.env.PORT) : 3000
const app = buildServer()

app.listen({ port, host: "0.0.0.0" }).catch((error: unknown) => {
  app.log.error(error)
  process.exit(1)
})
