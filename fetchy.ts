async function maybeThrowError<T>(response: Response) {
  if (response.ok) {
    return response.headers.get("content-type")?.includes("json")
      ? { ...response, data: (await response.json()) as T }
      : { ...response, data: null }
  }

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

  return await maybeThrowError<T>(response)
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

type CallbackConfig = {
  status?: {
    [key: number]: (e?: any) => void
    other?: (e?: any) => void
    all?: (e?: any) => void
  }
  field?: {
    [key: string | number]: (e?: any, value?: any) => void
  }
  onFailure?: {
    fetch?: (e?: any) => void
    network?: (e?: any) => void
    abort?: (e?: any) => void
    security?: (e?: any) => void
    syntax?: (e?: any) => void
    all?: (e?: any) => void
  }
}

export function handleError(e: any, callbacks: CallbackConfig) {
  // Handle non-server errors

  if (callbacks["onFailure"]) {
    const allFailureCallback = callbacks["onFailure"]["all"]

    // Handle specific TypeErrors

    if (e instanceof TypeError) {
      let callback: (e?: any) => void = () => {}

      const fetchFailCallback = callbacks["onFailure"]["fetch"]
      const networkFailCallback = callbacks["onFailure"]["network"]

      const { message } = e

      if (message.toLowerCase().includes("failed") && !!fetchFailCallback) {
        callback = fetchFailCallback
      }

      if (message.toLowerCase().includes("network") && !!networkFailCallback) {
        callback = networkFailCallback
      }
      callback(e)

      if (!!allFailureCallback) allFailureCallback(e)
    }

    // Handle specific DOMExceptions

    if (e instanceof DOMException) {
      let callback: (e?: any) => void = () => {}

      const abortCallback = callbacks["onFailure"]["abort"]
      const securityCallback = callbacks["onFailure"]["security"]

      const { message } = e

      if (message.toLowerCase().includes("abort") && !!abortCallback) {
        callback = abortCallback
      }

      if (message.toLowerCase().includes("security") && !!securityCallback) {
        callback = securityCallback
      }
      callback(e)
    }

    // Handle SyntaxErrors

    const syntaxCallback = callbacks["onFailure"]["syntax"]
    if (e instanceof SyntaxError && !!syntaxCallback) {
      syntaxCallback(e)
    }

    if (
      (e instanceof TypeError ||
        e instanceof DOMException ||
        e instanceof SyntaxError) &&
      !!allFailureCallback
    ) {
      return allFailureCallback(e)
    }
  }

  // Handle specific status errors

  if (e.status && callbacks.status && callbacks.status[e.status]) {
    const callback = callbacks.status[e.status]
    callback(e)
  }

  // Handle other status errors

  if (
    e.status &&
    callbacks.status &&
    !callbacks.status[e.status] &&
    callbacks.status.other
  ) {
    const callback = callbacks.status.other
    callback(e)
  }

  // Handle all status errors

  if (e.status && callbacks.status && callbacks.status.all) {
    const callback = callbacks.status.all
    callback(e)
  }

  // Handle any custom field server errors

  Object.keys(e).forEach((key) => {
    if (key !== "status" && callbacks.field && callbacks.field[key]) {
      const callback = callbacks.field[key]
      callback(e, e[key])
    }
  })
}

export default fetchy
