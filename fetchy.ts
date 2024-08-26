async function maybeThrowError(response: Response) {
  if (response.ok) return await response.json()

  if (response.headers.get("content-type")?.includes("json")) {
    const parsedResponse = await response.json()
    throw { status: response.status, ...parsedResponse }
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

  await maybeThrowError(response)
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

export function handleError(
  e: any,
  callbacks?: {
    [key: string]: { [key: number | string]: (e?: any) => void }
  }
) {
  Object.keys(callbacks ?? {}).forEach((key) => {
    if (e[key] && callbacks && callbacks[key][e[key]]) {
      const callback = callbacks[key][e[key]]
      callback(e)
    }

    if (e[key] && callbacks && callbacks[key] && callbacks[key]["all"]) {
      const callback = callbacks[key]["all"]
      callback(e)
    }
  })
}

export default fetchy
