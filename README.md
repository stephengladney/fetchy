# fetchy

Fetchy is a wrapper for JavaScript's fetch method that automatically throws an error on 400-500 statuses and accepts generics for type-safe returns. It also includes a `handleStatus` method for

## How to Use

```typescript
import fetchy, { handleStatus } from "@gladknee/fetchy"

fetchy.get(url, RequestInit?)
fetchy.post(url, RequestInit?)
fetchy.put(url, RequestInit?)
fetchy.delete(url, RequestInit?)

async function exampleRequest() {
  try {
    return await fetchy.get("https://server.com/api/route", {
      headers: { Authorization: "Bearer XXXXXX" },
    })
  } catch (e: any) {
    handleStatus(e, {
      401: (e) => { /* Do something if 401 response */},
      500: (e) => { /* Do something if 500 response */},
      // ...etc
    })
  }
}

```
