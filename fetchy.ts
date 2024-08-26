async function maybeThrowError(response: Response) {
  if (response.ok) return

  if (response.headers.get("content-type")?.includes("json")) {
    const parsedResponse = await response.json()
    throw parsedResponse
  } else {
    throw response
  }
}

async function makeRequest<T>(
  url: string,
  method: "GET" | "PUT" | "POST" | "DELETE",
  options?: Omit<RequestInit, "method">
) {
  const response = await fetch(url, { ...options, method })

  maybeThrowError(response)

  return (await response.json()) as T
}

const fetchy = {
  get: async <T>(url: string, options?: Omit<RequestInit, "method">) => {
    return makeRequest<T>(url, "GET", options)
  },
  put: async <T>(url: string, options?: Omit<RequestInit, "method">) => {
    return makeRequest<T>(url, "PUT", options)
  },
  post: async <T>(url: string, options?: Omit<RequestInit, "method">) => {
    return makeRequest<T>(url, "POST", options)
  },
  delete: async <T>(url: string, options?: Omit<RequestInit, "method">) => {
    return makeRequest<T>(url, "DELETE", options)
  },
}

export function handleStatus(
  e: any,
  callbacks?: { [key: number | string]: (e?: any) => void }
) {
  if (callbacks && callbacks[e.status]) {
    const callback = callbacks[e.status]
    return callback(e)
  }

  if (callbacks && callbacks["all"]) {
    const callback = callbacks["all"]
    callback(e)
  }
}

export default fetchy
