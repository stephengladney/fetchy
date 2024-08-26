# fetchy

Fetchy is a wrapper for JavaScript's fetch method that automatically throws an error on non 200-300 statuses and accepts generics for type-safe returns. It also includes a `handleError` method for executing different callbacks to specific statuses.

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
    status?: { [number]: (e?) => {} },
    customKey?: { [string]: (e?) => {}}
  })
}

// .then/.catch

fetchy
  .get("url", {})
  .then((response) => {})
  .catch((e) =>
    handleError(e, {
      status: { [number]: (e) => {} },
      customKey: { [string]: (e) => {} },
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
          /* Do something if response includes { errorMessage: "USER_NOT_ACTIVE"} */
        },
      },
      status: {
        401: (e) => {
          /* Do something if 401 response */
        },
        500: (e) => {
          /* Do something if 500 response */
        },
      },
      // ...etc
    })
  }
}
```
