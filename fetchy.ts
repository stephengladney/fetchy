export type FetchyResponse<T = any> = Response & { data: T; text: string }

async function maybeThrowError<T>(response: Response) {
  if (response.ok) {
    return response.headers.get("content-type")?.includes("json")
      ? ({
          ...response,
          data: (await response.json()) as T,
          text: "",
        } as FetchyResponse<T>)
      : ({
          ...response,
          data: {},
          text: await response.text(),
        } as FetchyResponse)
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

  return maybeThrowError<T>(response)
}

const fetchy = {
  get: async <T = any>(url: string, options?: Omit<RequestInit, "method">) => {
    return makeRequest<T>(url, "GET", options)
  },
  put: async <T = any>(url: string, options?: Omit<RequestInit, "method">) => {
    return makeRequest<T>(url, "PUT", options)
  },
  post: async <T = any>(url: string, options?: Omit<RequestInit, "method">) => {
    return makeRequest<T>(url, "POST", options)
  },
  delete: async <T = any>(
    url: string,
    options?: Omit<RequestInit, "method">
  ) => {
    return makeRequest<T>(url, "DELETE", options)
  },
}

export type CallbackConfig = {
  status?: {
    [key: number]: (e?: any) => void
    other?: (e?: any) => void
    all?: (e?: any) => void
  }
  body?: {
    [key: string | number]: (e?: any, value?: any) => void
  }
  client?: {
    fetch?: (e?: any) => void
    network?: (e?: any) => void
    abort?: (e?: any) => void
    security?: (e?: any) => void
    syntax?: (e?: any) => void
    all?: (e?: any) => void
  }
  other?: (e?: any) => void
  all?: (e?: any) => void
}

export function handleError(e: any, callbacks: CallbackConfig) {
  let errorThrown = false
  // Handle non-server errors

  if (callbacks.client) {
    const allFailureCallback = callbacks.client["all"]

    // Handle specific TypeErrors

    if (e instanceof TypeError) {
      let callback: (e?: any) => void = () => {}

      const fetchFailCallback = callbacks.client["fetch"]
      const networkFailCallback = callbacks.client["network"]

      const { message } = e

      if (message.toLowerCase().includes("failed") && !!fetchFailCallback) {
        callback = fetchFailCallback
      }

      if (message.toLowerCase().includes("network") && !!networkFailCallback) {
        callback = networkFailCallback
      }
      callback(e)
      errorThrown = true
    }

    // Handle specific DOMExceptions

    const isDOMExceptionError =
      e.message?.toLowerCase().includes("abort") ||
      e.message?.toLowerCase().includes("security")

    const abortCallback = callbacks.client["abort"]
    const securityCallback = callbacks.client["security"]

    if (e.message?.toLowerCase().includes("abort") && !!abortCallback) {
      const callback = abortCallback
      callback(e)
      errorThrown = true
    }

    if (e.message?.toLowerCase().includes("security") && !!securityCallback) {
      const callback = securityCallback
      callback(e)
      errorThrown = true
    }

    // Handle SyntaxErrors

    const syntaxCallback = callbacks.client["syntax"]
    if (e instanceof SyntaxError && !!syntaxCallback) {
      syntaxCallback(e)
      errorThrown = true
    }

    if (
      (e instanceof TypeError ||
        isDOMExceptionError ||
        e instanceof SyntaxError) &&
      !!allFailureCallback
    ) {
      errorThrown = true
      allFailureCallback(e)
    }
  }

  // Handle specific status errors

  if (e.status && callbacks.status && callbacks.status[e.status]) {
    const callback = callbacks.status[e.status]
    callback(e)
    errorThrown = true
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
    errorThrown = true
  }

  // Handle all status errors

  if (e.status && callbacks.status && callbacks.status.all) {
    const callback = callbacks.status.all
    callback(e)
    errorThrown = true
  }

  // Handle any custom field server errors

  Object.keys(e).forEach((key) => {
    if (key !== "status" && callbacks.body && callbacks.body[key]) {
      const callback = callbacks.body[key]
      callback(e, e[key])
      errorThrown = true
    }
  })

  // Handle other errors
  if (!errorThrown && callbacks.other) {
    const callback = callbacks.other
    callback(e)
  }

  // Handle all errors
  if (callbacks.all) {
    const callback = callbacks.all
    callback(e)
  }
}

export default fetchy
