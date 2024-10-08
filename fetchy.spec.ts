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
        body: {
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

  it("calls client.fetch callback", () => {
    const fetchFailCallback = jest.fn()
    try {
      throw new TypeError("fetch failed")
    } catch (e) {
      handleError(e, {
        client: { fetch: fetchFailCallback },
      })
    }

    expect(fetchFailCallback).toHaveBeenCalled()
  })

  it("calls client.network callback", () => {
    const networkFailCallback = jest.fn()
    try {
      throw new TypeError("Network error")
    } catch (e) {
      handleError(e, {
        client: { network: networkFailCallback },
      })
    }

    expect(networkFailCallback).toHaveBeenCalled()
  })

  it("calls client.abort callback", () => {
    const abortCallback = jest.fn()
    try {
      throw new DOMException("abort")
    } catch (e) {
      handleError(e, {
        client: { abort: abortCallback },
      })
    }

    expect(abortCallback).toHaveBeenCalled()
  })

  it("calls client.security callback", () => {
    const securityCallback = jest.fn()
    try {
      throw new DOMException("security")
    } catch (e) {
      handleError(e, {
        client: { security: securityCallback },
      })
    }

    expect(securityCallback).toHaveBeenCalled()
  })

  it("calls client.syntax callback", () => {
    const syntaxFailureCallback = jest.fn()
    try {
      throw new SyntaxError("Unexpected token")
    } catch (e) {
      handleError(e, {
        client: { syntax: syntaxFailureCallback },
      })
    }

    expect(syntaxFailureCallback).toHaveBeenCalled()
  })

  it("calls client.all callback", () => {
    const allFailureCallback = jest.fn()
    try {
      throw new DOMException("security")
    } catch (e) {
      handleError(e, {
        client: { all: allFailureCallback },
      })
    }

    expect(allFailureCallback).toHaveBeenCalled()
  })

  it("does not call client callbacks on success", async () => {
    const callback401 = jest.fn()
    const fetchFailureCallback = jest.fn()
    try {
      await mockResponse({ status: 401 })
    } catch (e: any) {
      handleError(e, {
        status: { 401: callback401 },
        client: { fetch: fetchFailureCallback },
      })
    }

    expect(callback401).toHaveBeenCalled()
    expect(fetchFailureCallback).not.toHaveBeenCalled()
  })

  it("calls other callback if no other callbacks are triggered", async () => {
    const callback401 = jest.fn()
    const callbackField = jest.fn()
    const callbackFailed = jest.fn()
    const otherCallback = jest.fn()

    try {
      await mockResponse("SOME_RANDOM_ERROR")
    } catch (e) {
      handleError(e, {
        status: { 401: callback401 },
        body: { fieldName: callbackField },
        client: { fetch: callbackFailed },
        other: otherCallback,
      })
    }
    expect(callback401).not.toHaveBeenCalled()
    expect(callbackField).not.toHaveBeenCalled()
    expect(callbackFailed).not.toHaveBeenCalled()
    expect(otherCallback).toHaveBeenCalledWith("SOME_RANDOM_ERROR")
  })

  it("does not call other callback if another callbacks is triggered", async () => {
    const callback401 = jest.fn()
    const otherCallback = jest.fn()

    try {
      await mockResponse({ status: 401 })
    } catch (e) {
      handleError(e, {
        status: { 401: callback401 },

        other: otherCallback,
      })
    }
    expect(callback401).toHaveBeenCalled()
    expect(otherCallback).not.toHaveBeenCalled()
  })

  it("calls all callback if error", () => {
    const callback401 = jest.fn()
    const callbackField = jest.fn()
    const callbackFailed = jest.fn()
    const otherCallback = jest.fn()

    try {
      throw "SOME_RANDOM_ERROR"
    } catch (e) {
      handleError(e, {
        status: { 401: callback401 },
        body: { fieldName: callbackField },
        client: { fetch: callbackFailed },
        other: otherCallback,
      })
    }
    expect(callback401).not.toHaveBeenCalled()
    expect(callbackField).not.toHaveBeenCalled()
    expect(callbackFailed).not.toHaveBeenCalled()
    expect(otherCallback).toHaveBeenCalledWith("SOME_RANDOM_ERROR")
  })
})
