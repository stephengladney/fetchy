import fetchy from "./fetchy"

async function mockResponse(body: any) {
  return new Promise((_, reject) => reject(body))
}

describe("fetchy.handleError", () => {
  it("calls specific status callbacks", async () => {
    const callback401 = jest.fn()
    const callback409 = jest.fn()

    const error = { status: 401 }

    fetchy.handleError(error, {
      status: { 401: callback401, 409: callback409 },
    })

    expect(callback401).toHaveBeenCalled()
    expect(callback409).not.toHaveBeenCalled()
  })

  it("calls status.other callbacks", async () => {
    const callback401 = jest.fn()
    const otherCallback = jest.fn()

    const error = { status: 500 } as Response

    fetchy.handleError(error, {
      status: { 401: callback401, other: otherCallback },
    })

    expect(callback401).not.toHaveBeenCalled()
    expect(otherCallback).toHaveBeenCalled()
  })

  it("calls status.all callbacks", async () => {
    const callback401 = jest.fn()
    const callback409 = jest.fn()
    const callbackAll = jest.fn()

    const error = { status: 409 } as Response

    fetchy.handleError(error, {
      status: { 401: callback401, 409: callback409, all: callbackAll },
    })

    expect(callback409).toHaveBeenCalled()
    expect(callbackAll).toHaveBeenCalled()
    expect(callback401).not.toHaveBeenCalled()
  })

  it("calls specific key/value callbacks", async () => {
    const badThingCallback = jest.fn()
    const otherBadThingCallback = jest.fn()

    const error = { status: 500, error_message: "BAD_THING" }

    fetchy.handleError(error, {
      body: {
        error_message: badThingCallback,
      },
    })

    expect(badThingCallback).toHaveBeenCalledWith("BAD_THING", {
      status: 500,
      error_message: "BAD_THING",
    })
    expect(otherBadThingCallback).not.toHaveBeenCalled()
  })

  it("calls client.fetch callback", () => {
    const fetchFailCallback = jest.fn()

    const error = new TypeError("fetch failed")

    fetchy.handleError(error, {
      client: { fetch: fetchFailCallback },
    })

    expect(fetchFailCallback).toHaveBeenCalled()
  })

  it("calls client.network callback", () => {
    const networkFailCallback = jest.fn()
    const error = new TypeError("Network error")

    fetchy.handleError(error, {
      client: { network: networkFailCallback },
    })

    expect(networkFailCallback).toHaveBeenCalled()
  })

  it("calls client.abort callback", () => {
    const abortCallback = jest.fn()

    const error = new DOMException("abort")

    fetchy.handleError(error, {
      client: { abort: abortCallback },
    })

    expect(abortCallback).toHaveBeenCalled()
  })

  it("calls client.security callback", () => {
    const securityCallback = jest.fn()

    const error = new DOMException("security")

    fetchy.handleError(error, {
      client: { security: securityCallback },
    })

    expect(securityCallback).toHaveBeenCalled()
  })

  it("calls client.syntax callback", () => {
    const syntaxFailureCallback = jest.fn()

    const error = new SyntaxError("Unexpected token")

    fetchy.handleError(error, {
      client: { syntax: syntaxFailureCallback },
    })

    expect(syntaxFailureCallback).toHaveBeenCalled()
  })

  it("calls client.all callback", () => {
    const allFailureCallback = jest.fn()
    const error = new DOMException("security")

    fetchy.handleError(error, {
      client: { all: allFailureCallback },
    })

    expect(allFailureCallback).toHaveBeenCalled()
  })

  it("does not call client callbacks on success", async () => {
    const callback401 = jest.fn()
    const fetchFailureCallback = jest.fn()

    const error = { status: 401 }

    fetchy.handleError(error, {
      status: { 401: callback401 },
      client: { fetch: fetchFailureCallback },
    })

    expect(callback401).toHaveBeenCalled()
    expect(fetchFailureCallback).not.toHaveBeenCalled()
  })

  it("calls other callback if no other callbacks are triggered", async () => {
    const callback401 = jest.fn()
    const callbackField = jest.fn()
    const callbackFailed = jest.fn()
    const otherCallback = jest.fn()

    const error = new Error("SOME_RANDOM_ERROR")

    fetchy.handleError(error, {
      status: { 401: callback401 },
      body: { fieldName: callbackField },
      client: { fetch: callbackFailed },
      other: otherCallback,
    })

    expect(callback401).not.toHaveBeenCalled()
    expect(callbackField).not.toHaveBeenCalled()
    expect(callbackFailed).not.toHaveBeenCalled()
    expect(otherCallback).toHaveBeenCalledWith(Error("SOME_RANDOM_ERROR"))
  })

  it("does not call other callback if another callbacks is triggered", async () => {
    const callback401 = jest.fn()
    const otherCallback = jest.fn()

    const error = { status: 401 }

    fetchy.handleError(error, {
      status: { 401: callback401 },

      other: otherCallback,
    })

    expect(callback401).toHaveBeenCalled()
    expect(otherCallback).not.toHaveBeenCalled()
  })

  it("calls all callback if error", () => {
    const callback401 = jest.fn()
    const callbackField = jest.fn()
    const callbackFailed = jest.fn()
    const otherCallback = jest.fn()

    const error = new Error("SOME_RANDOM_ERROR")

    fetchy.handleError(error, {
      status: { 401: callback401 },
      body: { fieldName: callbackField },
      client: { fetch: callbackFailed },
      other: otherCallback,
    })

    expect(callback401).not.toHaveBeenCalled()
    expect(callbackField).not.toHaveBeenCalled()
    expect(callbackFailed).not.toHaveBeenCalled()
    expect(otherCallback).toHaveBeenCalledWith(Error("SOME_RANDOM_ERROR"))
  })
})
