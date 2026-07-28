import { createServer, type Server } from "node:http"

/**
 * Minimal liveness endpoint every worker exposes (workers/health-worker.md
 * distinguishes this process liveness check from the Health Worker's own
 * business-level monitoring of queues/integrations).
 */
export function startHealthzServer(port: number): Server {
  const server = createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" })
      res.end(JSON.stringify({ status: "ok" }))
      return
    }
    res.writeHead(404)
    res.end()
  })

  server.listen(port)
  return server
}
