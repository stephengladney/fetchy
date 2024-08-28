# fetchy

Fetchy is a zero dependency wrapper for JavaScript's fetch method that automatically throws an error on non 200-300 statuses and accepts TypeScript generics for type-safe returns. It also provides error handling that allows you to easily execute different callbacks for different types of errors.

IMPORTANT: The library currently only handles responses with text or JSON (or no) content types. I'll be adding support for other content types in the future.

## Documentation

### Quick Start

1. Install the package with `npm i @gladknee/fetchy`
2. Import the default fetchy export from the library.
3. The fetchy object provides four functions for making requests: `get`, `post`, `put`, `delete`.
4. A successful request returns a native `Response` with an additional `data` key containing any parsed JSON.

```typescript
import fetchy from "@gladknee/fetchy"

// async await method

async function yourFunction() {
  try {
    const { data } = await fetchy.get("https://server.com/api/endpoint")
  } catch (e) {}
}

// Chaining method

fetchy
  .get("https://server.com/api/endpoint")
  .then(({ data }) => {})
  .catch((e: any) => {})
```

### Definitions

```typescript
export type FetchyResponse<T> = Response & { data: T }

function get<T = any>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>> {}

function post<T = any>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>> {}

function put<T = any>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>> {}

function delete<T = any>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>> {}

function handleError(e: any, callbacks: CallbackConfig) {}

type CallbackConfig = {
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
```

### Examples

We have a `User` type and `greetUser()` function that accepts a User. We'll make a GET request to fetch the user and pass it to the greetUser function.

```typescript
type User = { id: number; name: string }

function greetUser(user: User) {
  alert(`Hello ${user.name}`)
}

async function getAndGreetUser() {
  const { data: myUser } = await fetchy.get<User>(
    "https://server.com/api/users/me",
    {
      headers: { Authorization: "Bearer XXXXXX" },
    }
  )

  greetUser(myUser)
}
```

### Error Handling

Import the `handleError` function from the library

```typescript
import fetchy, { handleError } from "@gladknee/fetchy"
```

#### Handling status codes

```typescript
async function getUserAndGreet() {
  try {
    const { data: myUser } = await fetchy.get<User>(
      "https://server.com/api/users/me",
      {
        headers: { Authorization: "Bearer XXXXXX" },
      }
    )

    greetUser(myUser)
  } catch (e: any) {
    handleError(e, {
      status: {
        401: (e) => {
          /* Do something if 401 response */
        },
        500: (e) => {
          /* Do something if 500 response */
        },
        other: (e) => {
          /* Do something on any other non 200-300 statuses */
        },
        all: (e) => {
          /* Do something on any non 200-300 status */
        },
      },
    })
  }
}
```

#### Handling response body

```typescript
async function getUserAndGreet() {
  try {
    const { data: myUser } = await fetchy.get<User>(
      "https://server.com/api/users/me",
      {
        headers: { Authorization: "Bearer XXXXXX" },
      }
    )

    greetUser(myUser)
  } catch (e: any) {
    handleError(e, {
      body: {
        errorMessage: (e, value) => {
          switch (value) {
            case "USER_NOT_ACTIVE":
              // Do something if response includes { errorMessage: "USER_NOT_ACTIVE "}
              break
            case "USER_NOT_FOUND":
              // Do something if response includes { errorMessage: "USER_NOT_FOUND "}
              break
            default:
            // Do something if response includes { errorMessage: <anything else> }
          }
        },
      },
    })
  }
}
```

#### Handling client-side errors

```typescript
async function getUserAndGreet() {
  try {
    const { data: myUser } = await fetchy.get<User>(
      "https://server.com/api/users/me",
      {
        headers: { Authorization: "Bearer XXXXXX" },
      }
    )

    greetUser(myUser)
  } catch (e: any) {
    handleError(e, {
      client: {
        fetch: (e) => {
          /* Do something if fetch failed */
        },
        network: (e) => {
          /* Do something if network error */
        },
        abort: (e) => {
          /* Do something if user aborted */
        },
        security: (e) => {
          /* Do something if security error */
        },
        syntax: (e) => {
          /* Do something if syntax error */
        },
        all: (e) => {
          /* Do something if any client-side error */
        },
      },
    })
  }
}
```

#### Handling any other errors

```typescript
async function getUserAndGreet() {
  try {
    const { data: myUser } = await fetchy.get<User>(
      "https://server.com/api/users/me",
      {
        headers: { Authorization: "Bearer XXXXXX" },
      }
    )

    greetUser(myUser)
  } catch (e: any) {
    handleError(e, {
      status: {
        401: (e) => {
          /* Do something if 401 response */
        },
      },
      other: (e) => {
        /* Do something if any other error thrown */
      },
    })
  }
}
```

#### Handling all errors

```typescript
async function getUserAndGreet() {
  try {
    const { data: myUser } = await fetchy.get<User>(
      "https://server.com/api/users/me",
      {
        headers: { Authorization: "Bearer XXXXXX" },
      }
    )

    greetUser(myUser)
  } catch (e: any) {
    handleError(e, {
      all: (e) => {
        /* Do something if any error */
      },
    })
  }
}
```

#### Example: Combined error handling

_NOTE: If multiple error handling conditions are triggered, each of their callbacks will be executed._

```typescript
async function getUserAndGreet() {
  try {
    const { data: myUser } = await fetchy.get<User>(
      "https://server.com/api/users/me",
      {
        headers: { Authorization: "Bearer XXXXXX" },
      }
    )

    greetUser(myUser)
  } catch (e: any) {
    handleError(e, {
      status: {
        401: () => redirect("/auth"),
      },
      body: {
        errorMessage: (e, value) => {
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
      all: (e) => logError(e),
    })
  }
}
```

### Use with TanStack Query (react-query)

Fetchy works great with Tanstack Query. Below is a popular implementation.

_NOTE: You may want to extract `data` from the response in your function to avoid referencing `data.data` in your frontend code._

```typescript
export async function someRequest() {
  const { data } = await fetchy.get("url")
  return data
}

export function SomeComponent() {
  const { data, isError, error } = useQuery({
    queryKey: ["yourkey"]
    queryFn: someRequest
  })

  useEffect(() => {
    if (isError) {
      handleError(error, callbackConfig)
    }
  }, [isError, error])
}
```

### Helpful tips

Combining multiple types of error handling can lead to bulky code. One helpful tip is to separate out your error handling logic into their own objects and pass them in to your handleError callbacks.

Example:

```typescript
const handleStatusErrors = {
  401: () => router.push("/auth/signin"),
  402: () => router.push("/upgrade"),
  500: (e: any?) => logInternalServerError(e),
  // ...etc
}

const handleClientErrors = {
  fetch: () => alert("Please check your internet connection."),
  network: () => alert("We experienced a network error. Please try again."),
}

const handleErrorMessages = (e: any, message: string) => {
  switch (message) {
    case "USER_NOT_FOUND":
      alert("You do not have an account.")
      break
    case "USER_DEACTIVED":
      alert("Your account has been deactivated.")
      break
    default:
      alert(`Error: ${message}`)
  }
}

function logError(e: any) {
  // do something to log any errors
}

const myErrorHandlers = {
  status: handleStatusErrors,
  client: handleClientErrors,
  body: {
    errorMessage: handleErrorMessages,
  },
  all: logError,
}

async function someRequest() {
  try {
    const { data } = await fetchy.get("url")
  } catch (e: any) {
    handleErrors(e, myErrorHandlers)
  }
}
```
