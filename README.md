# fetchy

Fetchy is a wrapper for JavaScript's fetch method that automatically throws an error on non 200-300 statuses and accepts TypeScript generics for type-safe returns. It also includes a `handleError` method for executing different callbacks to specific error statuses and responses.

## How to Use

```typescript
import fetchy, { handleError } from "@gladknee/fetchy"

// Try/catch

try {

  fetchy.get(url, RequestInit?)
  fetchy.post(url, RequestInit?)
  fetchy.put(url, RequestInit?)
  fetchy.delete(url, RequestInit?)

} catch (e:any) {

  handleError(e, {
    status?: {
      [number]: (e?) => {},
      all?: (e?) => {}
    },
    customKey?: {
      [string | number]: (e?) => {},
      all?: (e?) => {}
    }
  })

}

// .then/.catch

fetchy
  .get(url, RequestInit?)
  .then((response) => {})
  .catch((e) =>
    handleError(e, {
      status?: {
        [number]: (e?) => {},
        all?: (e?) => {}
      },
      customKey?: {
        [string | number]: (e?) => {},
        all?: (e?) => {}
      }
    })
  )


// Example

type User = { id: number; name: string }

function greetUser(user: User) {
  console.log(`Hello ${user.name}`)
}

async function getUserAndGreet() {
  try {
    const myUser = await fetchy.get<User>("https://server.com/api/users/me", {
      headers: { Authorization: "Bearer XXXXXX" },
    })

    greetUser(myUser)
  } catch (e: any) {
    handleError(e, {
      errorMessage: {
        USER_NOT_ACTIVE: (e) => {
          /* Do something if error response includes { errorMessage: "USER_NOT_ACTIVE" */
        },
        all: (e) => {
          /* Do something if error response includes { errorMessage: <anything> } */
        }
      },
      status: {
        401: (e) => { /* Do something if 401 response */ },
        500: (e) => { /* Do something if 500 response */ },
        all: (e) => { /* Do something on any non 200-300 status */ }
      },
    })
  }
}
```
