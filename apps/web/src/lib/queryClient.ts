import { QueryClient } from "@tanstack/react-query"

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserClient: QueryClient | undefined

/** SSR-safe singleton: a fresh client per server request, one shared client in the browser. */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient()
  if (!browserClient) browserClient = makeQueryClient()
  return browserClient
}
