# fetchy

Fetchy is a wrapper for JavaScript's fetch method that automatically throws an error on non 200-300 statuses and accepts TypeScript generics for type-safe returns. It also includes a `handleError` method for executing different callbacks to specific error statuses and responses.

## Docmentation

### Functions

```typescript
function get<T>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<T>

function post<T>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<T>

function put<T>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<T>

function delete<T>(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<T>

function handleError(e: any, callbacks?: CallbackConfig)

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
```

### How to Use

```typescript
import fetchy, { handleError } from "@gladknee/fetchy"

// Try/catch

try {
  const result = await fetchy.get<T>(url, options)
} catch (e: any) {
  handleError(e, callbackConfig)
}

// .then/.catch

fetchy
  .get<T>(url, options)
  .then((response: T) => {})
  .catch((e) => handleError(e, callbackConfig))
```

### Example

```typescript
// We have a User type and greetUser function that accepts a User

type User = { id: number; name: string }

function greetUser(user: User) {
  alert(`Hello ${user.name}`)
}
```

Using status codes for error handling:

```typescript
async function getUserAndGreet() {
  try {
    const myUser = await fetchy.get<User>("https://server.com/api/users/me", {
      headers: { Authorization: "Bearer XXXXXX" },
    })

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

Using a custom key/value response for error handling:

```typescript
async function getUserAndGreet() {
  try {
    const myUser = await fetchy.get<User>("https://server.com/api/users/me", {
      headers: { Authorization: "Bearer XXXXXX" },
    })

    greetUser(myUser)
  } catch (e: any) {
    handleError(e, {
      field: {
        errorMessage: (e, value: any) => {
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

Using both status code and custom key/value for error handling:

_NOTE: If a status code and custom/key value condition overlap, both callbacks will be executed._

```typescript
async function getUserAndGreet() {
  try {
    const myUser = await fetchy.get<User>("https://server.com/api/users/me", {
      headers: { Authorization: "Bearer XXXXXX" },
    })

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
      },
      field: {
        errorMessage: (e, value: any) => {
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
