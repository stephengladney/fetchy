export type FetchyResponse<T> =
  | [data: T, error: undefined, response: Response]
  | [data: undefined, error: FetchyError, response: Response]

export type FetchyError = Error | ({ status: number } & Record<string, any>)

async function getResponseData<T>(response: Response) {
  const contentType = response.headers.get("content-type")?.split(";")[0]

  switch (contentType) {
    case "application/json":
      return (await response.json()) as T
    case "text/plain":
    case "text/html":
      return (await response.text()) as T
    default:
      return {} as T
  }
}

async function maybeReturnError<T>(
  response: Response
): Promise<FetchyResponse<T>> {
  const isJsonResponse = response.headers.get("content-type")?.includes("json")

  if (response.ok) {
    return [await getResponseData<T>(response), undefined, response]
  } else if (isJsonResponse) {
    const parsedResponse = await response.json()
    return [undefined, { status: response.status, ...parsedResponse }, response]
  } else return [undefined, response, response]
}

function returnError<T>(response: Response, e: any): FetchyResponse<T> {
  return [undefined, e, response]
}

async function makeRequest<T>(
  url: string,
  method: "GET" | "PUT" | "POST" | "DELETE",
  options?: Omit<RequestInit, "method">
) {
  let response: Response | null = null
  try {
    response = await fetch(url, { ...options, method })
    return maybeReturnError<T>(response)
  } catch (e) {
    return returnError<T>(response!, e)
  }
}

const fetchy = {
  get: async <T = unknown>(
    url: string,
    options?: Omit<RequestInit, "method">
  ) => {
    return makeRequest<T>(url, "GET", options)
  },
  put: async <T = unknown>(
    url: string,
    options?: Omit<RequestInit, "method">
  ) => {
    return makeRequest<T>(url, "PUT", options)
  },
  post: async <T = unknown>(
    url: string,
    options?: Omit<RequestInit, "method">
  ) => {
    return makeRequest<T>(url, "POST", options)
  },
  delete: async <T = unknown>(
    url: string,
    options?: Omit<RequestInit, "method">
  ) => {
    return makeRequest<T>(url, "DELETE", options)
  },
  handleError,
}

export type CallbackConfig = {
  status?: {
    [key: number]: (e?: any) => void
    other?: (e?: any) => void
    all?: (e?: any) => void
  }
  body?: {
    [key: string]: (value?: any, e?: any) => void
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

export function handleError(error: FetchyError, callbacks: CallbackConfig) {
  let errorThrown = false
  // Handle non-server errors

  if (callbacks.client) {
    const allFailureCallback = callbacks.client["all"]

    // Handle specific TypeErrors

    if (error instanceof TypeError) {
      let callback: (e?: any) => void = () => {}

      const fetchFailCallback = callbacks.client["fetch"]
      const networkFailCallback = callbacks.client["network"]

      const { message } = error

      if (message.toLowerCase().includes("failed") && !!fetchFailCallback) {
        callback = fetchFailCallback
      }

      if (message.toLowerCase().includes("network") && !!networkFailCallback) {
        callback = networkFailCallback
      }
      callback(error)
      errorThrown = true
    }

    // Handle specific DOMExceptions

    const isDOMExceptionError =
      error instanceof DOMException &&
      (error.message?.toLowerCase().includes("abort") ||
        error.message?.toLowerCase().includes("security"))

    if (isDOMExceptionError) {
      const abortCallback = callbacks.client["abort"]
      const securityCallback = callbacks.client["security"]

      if (error.message?.toLowerCase().includes("abort") && !!abortCallback) {
        const callback = abortCallback
        callback(error)
        errorThrown = true
      }

      if (
        error.message?.toLowerCase().includes("security") &&
        !!securityCallback
      ) {
        const callback = securityCallback
        callback(error)
        errorThrown = true
      }
    }

    // Handle SyntaxErrors

    const syntaxCallback = callbacks.client["syntax"]
    if (error instanceof SyntaxError && !!syntaxCallback) {
      syntaxCallback(error)
      errorThrown = true
    }

    if (
      (error instanceof TypeError ||
        isDOMExceptionError ||
        error instanceof SyntaxError) &&
      !!allFailureCallback
    ) {
      errorThrown = true
      allFailureCallback(error)
    }
  }

  // Handle specific status errors

  const isResponse = !(error instanceof Error) && error.status

  if (isResponse && callbacks.status && callbacks.status[error.status]) {
    const callback = callbacks.status[error.status]
    callback(error)
    errorThrown = true
  }

  // Handle other status errors

  if (
    isResponse &&
    callbacks.status &&
    !callbacks.status[error.status] &&
    callbacks.status.other
  ) {
    const callback = callbacks.status.other
    callback(error)
    errorThrown = true
  }

  // Handle all status errors

  if (isResponse && callbacks.status && callbacks.status.all) {
    const callback = callbacks.status.all
    callback(error)
    errorThrown = true
  }

  // Handle any custom field server errors

  if (error instanceof Object) {
    Object.keys(error).forEach((key) => {
      if (key !== "status" && callbacks.body && callbacks.body[key]) {
        const callback = callbacks.body[key]
        callback(error[key as keyof typeof error], error)
        errorThrown = true
      }
    })
  }

  // Handle other errors
  if (!errorThrown && callbacks.other) {
    const callback = callbacks.other
    callback(error)
  }

  // Handle all errors
  if (callbacks.all) {
    const callback = callbacks.all
    callback(error)
  }
}

export default fetchy
