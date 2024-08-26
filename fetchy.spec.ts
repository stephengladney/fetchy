import { handleError } from "./fetchy"

async function mockResponse(body: any) {
  return new Promise((_, reject) => reject(body))
}

describe("handleError", () => {
  it("calls specific status callbacks", async () => {
    const callback401 = jest.fn()
    const callback409 = jest.fn()
    try {
      await mockResponse({ status: 401 })
    } catch (e: any) {
      handleError(e, { status: { 401: callback401, 409: callback409 } })
    }

    expect(callback401).toHaveBeenCalled()
    expect(callback409).not.toHaveBeenCalled()
  })

  it("calls status.other callbacks", async () => {
    const callback401 = jest.fn()
    const otherCallback = jest.fn()
    try {
      await mockResponse({ status: 500 })
    } catch (e: any) {
      handleError(e, { status: { 401: callback401, other: otherCallback } })
    }

    expect(callback401).not.toHaveBeenCalled()
    expect(otherCallback).toHaveBeenCalled()
  })

  it("calls status.all callbacks", async () => {
    const callback401 = jest.fn()
    const callback409 = jest.fn()
    const callbackAll = jest.fn()
    try {
      await mockResponse({ status: 409 })
    } catch (e: any) {
      handleError(e, {
        status: { 401: callback401, 409: callback409, all: callbackAll },
      })
    }

    expect(callback409).toHaveBeenCalled()
    expect(callbackAll).toHaveBeenCalled()
    expect(callback401).not.toHaveBeenCalled()
  })

  it("calls specific key/value callbacks", async () => {
    const badThingCallback = jest.fn()
    const otherBadThingCallback = jest.fn()
    try {
      await mockResponse({ status: 500, error_message: "BAD_THING" })
    } catch (e: any) {
      handleError(e, {
        field: {
          error_message: badThingCallback,
        },
      })
    }

    expect(badThingCallback).toHaveBeenCalledWith(
      { status: 500, error_message: "BAD_THING" },
      "BAD_THING"
    )
    expect(otherBadThingCallback).not.toHaveBeenCalled()
  })

  it("calls onFailure.fetch callback", () => {
    const fetchFailCallback = jest.fn()
    try {
      throw new TypeError("fetch failed")
    } catch (e) {
      handleError(e, {
        onFailure: { fetch: fetchFailCallback },
      })
    }

    expect(fetchFailCallback).toHaveBeenCalled()
  })

  it("calls onFailure.network callback", () => {
    const networkFailCallback = jest.fn()
    try {
      throw new TypeError("Network error")
    } catch (e) {
      handleError(e, {
        onFailure: { network: networkFailCallback },
      })
    }

    expect(networkFailCallback).toHaveBeenCalled()
  })

  it("calls onFailure.abort callback", () => {
    const abortCallback = jest.fn()
    try {
      throw new DOMException("abort")
    } catch (e) {
      handleError(e, {
        onFailure: { abort: abortCallback },
      })
    }

    expect(abortCallback).toHaveBeenCalled()
  })

  it("calls onFailure.security callback", () => {
    const securityCallback = jest.fn()
    try {
      throw new DOMException("security")
    } catch (e) {
      handleError(e, {
        onFailure: { security: securityCallback },
      })
    }

    expect(securityCallback).toHaveBeenCalled()
  })

  it("calls onFailure.syntax callback", () => {
    const syntaxFailureCallback = jest.fn()
    try {
      throw new SyntaxError("Unexpected token")
    } catch (e) {
      handleError(e, {
        onFailure: { syntax: syntaxFailureCallback },
      })
    }

    expect(syntaxFailureCallback).toHaveBeenCalled()
  })

  it("calls onFailure.all callback", () => {
    const allFailureCallback = jest.fn()
    try {
      throw new DOMException("security")
    } catch (e) {
      handleError(e, {
        onFailure: { all: allFailureCallback },
      })
    }

    expect(allFailureCallback).toHaveBeenCalled()
  })

  it("does not call status or key/valuecallbacks on failure", () => {
    const allFailureCallback = jest.fn()
    const statusAllCallback = jest.fn()
    const customAllCallback = jest.fn()
    try {
      throw new DOMException("security")
    } catch (e) {
      handleError(e, {
        onFailure: { all: allFailureCallback },
        status: { all: statusAllCallback },
        field: { myKey: customAllCallback },
      })
    }

    expect(allFailureCallback).toHaveBeenCalled()
    expect(statusAllCallback).not.toHaveBeenCalled()
    expect(customAllCallback).not.toHaveBeenCalled()
  })

  it("does not call onFailure callbacks on success", async () => {
    const callback401 = jest.fn()
    const fetchFailureCallback = jest.fn()
    try {
      await mockResponse({ status: 401 })
    } catch (e: any) {
      handleError(e, {
        status: { 401: callback401 },
        onFailure: { fetch: fetchFailureCallback },
      })
    }

    expect(callback401).toHaveBeenCalled()
    expect(fetchFailureCallback).not.toHaveBeenCalled()
  })
})
