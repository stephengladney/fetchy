# fetchy

Fetchy is a zero dependency wrapper for JavaScript's fetch method that automatically throws an error on non 200-300 statuses and accepts TypeScript generics for type-safe returns. It also provides error handling that allows you to easily execute different callbacks for different types of errors.

## Documentation

### Quick Start

1. Install the package with `npm i @gladknee/fetchy`
2. Import the default fetchy export from the library.
3. The fetchy object provides four functions for making requests: `get`, `post`, `put`, `delete`.
4. A successful request returns a native `Response` with additional keys of `data` and `text`, which contain any parsed JSON or decoded text respectively.

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
type FetchyResponse<T = any> = Response & { data: T; text: string }

function get<T = any>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>>

function post<T = any>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>>

function put<T = any>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>>

function delete<T = any>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<FetchyResponse<T>>

function handleError(e: any, callbacks: CallbackConfig)

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
        }
      }
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
