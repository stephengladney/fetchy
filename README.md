# fetchy

Fetchy is an open source, zero dependency wrapper for JavaScript's fetch function. It provides the following benefits:

1. Simple get, post, put and delete functions
2. Accepts TypeScript generics for type-safe returns.
3. Returns errors rather than throwing them, removing the need to use try/catch blocks. (version ≥2.0.0)
4. Easily detects and handles different types of fetch errors.

## Documentation

### Quick Start

1. Install the package.

   `npm i @gladknee/fetchy`

2. Import the default export from the library.

   `import fetchy from "@gladknee/fetchy"`

3. The imported object provides four functions for making requests: `get`, `post`, `put`, `delete`.

```typescript
import fetchy from "@gladknee/fetchy"

async function yourFunction() {
  const [data, error, response] = await fetchy.get(
    "https://server.com/api/endpoint"
  )

  if (data) {
    // handle returned data
  } else {
    // handle error
  }
}

// You can also pass config options like a normal fetch call...

const [data, error] = await fetchy.get("https://server.com/api/endpoint", {
  headers: { Authorization: "Bearer XXXXXX" },
})
```

_NOTE: For versions <2.0.0, the function returns an object with a `data` key. If an error occurs, the error is thrown._

### HTTP Methods

```typescript
function get<T = unknown>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>> {}

function post<T = unknown>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>> {}

function put<T = unknown>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>> {}

function delete<T = unknown>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>> {}

```

### Types

```typescript
type FetchyResponse<T> =
  | [data: T, error: undefined, response: Response]
  | [data: undefined, error: FetchyError, response: Response]

export type FetchyError = Error | ({ status: number } & Record<string, any>)
```

### Error Handling

The imported `fetchy` object also contains a `handleError` method. You can call this function by passing two required parameters: the error and your error handling callback configuration.

_NOTE: If you are using versions <2.0.0, you will need to import `handleError` separately from the fetchy default export. You will also need to call the function inside your catch block._

```typescript
function handleError(e: FetchyError, callbacks: CallbackConfig)

type CallbackConfig = {
  status?: {
    [key: number]: (e?: FetchyError) => void
    other?: (e?: FetchyError) => void
    all?: (e?: FetchyError) => void
  }
  body?: {
    [key: string]: (value?: any, e?: FetchyError) => void
  }
  client?: {
    fetch?: (e?: FetchyError) => void
    network?: (e?: FetchyError) => void
    abort?: (e?: FetchyError) => void
    security?: (e?: FetchyError) => void
    syntax?: (e?: FetchyError) => void
    all?: (e?: FetchyError) => void
  }
  other?: (e?: FetchyError) => void
  all?: (e?: FetchyError) => void
}
```

#### Handling status codes

```typescript
async function getAndGreetUser() {
  const [data, error] = await fetchy.get("https://api.com/users/1")

  if (data) {
    greetUser(data)
  } else {
    fetchy.handleError(error, {
      status: {
        401: (error) => {
          /* Do something if 401 response */
        },
        500: (error) => {
          /* Do something if 500 response */
        },
        other: (error) => {
          /* Do something on any other non 200-300 statuses */
        },
        all: (error) => {
          /* Do something on any non 200-300 status */
        },
      },
    })
  }
}
```

#### Handling response body

```typescript
async function getAndGreetUser() {
  const [data, error] = await fetchy.get("https://api.com/users/1")

  if (data) {
    greetUser(data)
  } else {
    fetchy.handleError(error, {
      body: {
        fieldName: (value, error) => {
          switch (value) {
            case "SOME_VALUE":
              // Do something if response includes { fieldName: "SOME_VALUE" }
              break
            case "SOME_OTHER_VALUE":
              // Do something if response includes { fieldName: "SOME_OTHER_VALUE "}
              break
            default:
            // Do something if response includes { fieldName: <anything else> }
          }
        },
      },
    })
  }
}
```

#### Handling client-side errors

```typescript
async function getAndGreetUser() {
  const [data, error] = await fetchy.get("https://api.com/users/1")

  if (data) {
    greetUser(data)
  } else {
    fetchy.handleError(error, {
      client: {
        fetch: (error) => {
          /* Do something if fetch failed */
        },
        network: (error) => {
          /* Do something if network error */
        },
        abort: (error) => {
          /* Do something if user aborted */
        },
        security: (error) => {
          /* Do something if security error */
        },
        syntax: (error) => {
          /* Do something if syntax error */
        },
        all: (error) => {
          /* Do something if any client-side error */
        },
      },
    })
  }
}
```

#### Handling any other uncaught errors

```typescript
async function getAndGreetUser() {
  const [data, error] = await fetchy.get("https://api.com/users/1")

  if (data) {
    greetUser(data)
  } else {
    fetchy.handleError(error, {
      status: {
        401: (error) => {
          /* Do something if 401 response */
        },
      },
      other: (error) => {
        /* Do something if any other error is thrown */
      },
    })
  }
}
```

#### Handling all errors

You can also execute a callback on any error. This will be executed along with any other triggered callbacks. So in this example, on a 401 error, the user is redirected and the error is logged.

```typescript
async function getAndGreetUser() {
  const [data, error] = await fetchy.get("https://api.com/users/1")

  if (data) {
    greetUser(data)
  } else {
    fetchy.handleError(error, {
      status: {
        401: () => redirect("/auth"),
      },
      all: (error) => {
        logError(error)
      },
    })
  }
}
```

#### Example: Combined error handling

_NOTE: If multiple error handling conditions are triggered, each of their callbacks will be executed._

```typescript
async function getAndGreetUser() {
  const { data, error } = await fetchy.get("https://api.com/users/1")

  if (data) {
    greetUser(data)
  } else {
    fetchy.handleError(error, {
      status: {
        401: () => redirect("/auth"),
      },
      body: {
        errorMessage: (value, error) => {
          switch (value) {
            case "USER_NOT_ACTIVE":
              alert("Your account is no longer active.")
              break
            default:
              alert(`Error: ${value}`)
          }
        },
      },
      client: {
        network: () => alert("There was a network error."),
      },
      all: (error) => logError(error),
    })
  }
}
```

### Helpful tips

As you can see in the previous example, combining multiple types of error handling can lead to bulky code. One helpful tip is to separate out your error handling logic into their own object(s) and pass them in to your handleError callbacks.

Example:

```typescript
import type { CallbackConfig } from "@gladknee/fetchy"

const handleStatusErrors = {
  401: () => router.push("/auth/signin"),
  402: () => router.push("/upgrade"),
  500: (error: any) => logInternalServerError(eror),
  // ...etc
}

const handleClientErrors = {
  fetch: () => alert("Please check your internet connection."),
  network: () => alert("We experienced a network error. Please try again."),
}

const handleErrorMessages = (message: string) => {
  switch (message) {
    case "USER_NOT_FOUND":
      alert("You do not have an account.")
      break
    case "USER_DEACTIVATED":
      alert("Your account has been deactivated.")
      break
    default:
      alert(`Error: ${message}`)
  }
}

function logError(error: any) {
  // do something to log any errors
}

const myErrorHandlers: CallbackConfig = {
  status: handleStatusErrors,
  client: handleClientErrors,
  body: {
    errorMessage: handleErrorMessages,
  },
  all: logError,
}

async function someRequest() {
  const { data, error } = await fetchy.get("https://api.com/users/1")

  if (data) {
    greetUser(data)
  } else {
    fetchy.handleErrors(error, myErrorHandlers)
  }
}
```

### Use with TanStack Query (react-query)

Fetchy works great with Tanstack Query. Below is a popular implementation.

```typescript
export async function getUser() {
  const { data, error } = await fetchy.get("https://api.com/users/1")

  if (data) return data
  else throw error // Throw the error so that it bubbles up to your useQuery hook
}

export function SomeComponent() {
  const { data, isError, error } = useQuery({
    queryKey: ["yourkey"],
    queryFn: getUser,
  })

  useEffect(() => {
    if (isError) {
      fetchy.handleError(error, callbackConfig)
    }
  }, [isError, error])
}
```
