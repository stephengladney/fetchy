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
      await mockResponse({ error_message: "BAD_THING" })
    } catch (e: any) {
      handleError(e, {
        error_message: {
          BAD_THING: badThingCallback,
          OTHER_BAD_THING: otherBadThingCallback,
        },
      })
    }

    expect(badThingCallback).toHaveBeenCalled()
    expect(otherBadThingCallback).not.toHaveBeenCalled()
  })

  it("calls key.all callbacks", async () => {
    const allThingCallback = jest.fn()
    const badThingCallback = jest.fn()
    const otherBadThingCallback = jest.fn()
    try {
      await mockResponse({ error_message: "ANOTHER_BAD_THING" })
    } catch (e: any) {
      handleError(e, {
        error_message: {
          BAD_THING: badThingCallback,
          OTHER_BAD_THING: otherBadThingCallback,
          all: allThingCallback,
        },
      })
    }

    expect(allThingCallback).toHaveBeenCalled()
    expect(badThingCallback).not.toHaveBeenCalled()
    expect(otherBadThingCallback).not.toHaveBeenCalled()
  })
})
