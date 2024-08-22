# fetchy

Fetchy is a wrapper for JavaScript's fetch method that automatically throws an error on 400-500 statuses and accepts generics for type-safe returns. It also includes a `handleStatus` method for executing different callbacks to specific statuses.

## How to Use

```typescript
import fetchy, { handleStatus } from "@gladknee/fetchy"

fetchy.get(url, RequestInit?)
fetchy.post(url, RequestInit?)
fetchy.put(url, RequestInit?)
fetchy.delete(url, RequestInit?)

// Example of fetching a user from an API

type User = { id: number; name: string }

function greetUser(user: User) {
  console.log(`Hello ${user.name}`)
}

async function exampleRequest() {
  try {
    const myUser = await fetchy.get<User>("https://server.com/api/users/me", {
      headers: { Authorization: "Bearer XXXXXX" },
    })

    greetUser(myUser)
  } catch (e: any) {
    handleStatus(e, {
      401: (e) => { /* Do something if 401 response */ },
      500: (e) => { /* Do something if 500 response */ },
      // ...etc
    })
  }
}
```
