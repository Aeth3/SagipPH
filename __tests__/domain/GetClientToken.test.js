import { makeGetClientToken } from "../../package/src/domain/usecases/GetClientToken";

describe("makeGetClientToken", () => {
  it("returns cached token when available", async () => {
    const authRepository = {
      getClientToken: jest.fn(),
    };
    const sessionRepository = {
      getClientToken: jest.fn().mockResolvedValue("cached-token"),
      saveClientToken: jest.fn(),
    };

    const getClientToken = makeGetClientToken({
      authRepository,
      sessionRepository,
      name: "SagipPH",
    });

    const result = await getClientToken();

    expect(result).toEqual({ ok: true, value: { client_token: "cached-token" }, error: null });
    expect(authRepository.getClientToken).not.toHaveBeenCalled();
    expect(sessionRepository.saveClientToken).not.toHaveBeenCalled();
  });

  it("fetches and saves token when cache is empty", async () => {
    const authRepository = {
      getClientToken: jest.fn().mockResolvedValue("fresh-token"),
    };
    const sessionRepository = {
      getClientToken: jest.fn().mockResolvedValue(null),
      saveClientToken: jest.fn().mockResolvedValue(undefined),
    };

    const getClientToken = makeGetClientToken({
      authRepository,
      sessionRepository,
      name: "SagipPH",
    });

    const result = await getClientToken();

    expect(authRepository.getClientToken).toHaveBeenCalledWith("SagipPH");
    expect(sessionRepository.saveClientToken).toHaveBeenCalledWith("fresh-token");
    expect(result).toEqual({ ok: true, value: { client_token: "fresh-token" }, error: null });
  });

  it("returns fail when repository returns non-string token", async () => {
    const authRepository = {
      getClientToken: jest.fn().mockResolvedValue({ token: "invalid-shape" }),
    };
    const sessionRepository = {
      getClientToken: jest.fn().mockResolvedValue(null),
      saveClientToken: jest.fn(),
    };

    const getClientToken = makeGetClientToken({
      authRepository,
      sessionRepository,
      name: "SagipPH",
    });

    const result = await getClientToken();

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({
      code: "AUTH_ERROR",
      message: "Invalid client token format received from auth provider",
    });
    expect(sessionRepository.saveClientToken).not.toHaveBeenCalled();
  });

  it("returns fail when repository throws", async () => {
    const authRepository = {
      getClientToken: jest.fn().mockRejectedValue(new Error("Request failed")),
    };
    const sessionRepository = {
      getClientToken: jest.fn().mockResolvedValue(null),
      saveClientToken: jest.fn(),
    };

    const getClientToken = makeGetClientToken({
      authRepository,
      sessionRepository,
      name: "SagipPH",
    });

    const result = await getClientToken();

    expect(result).toEqual({
      ok: false,
      value: null,
      error: { code: "AUTH_ERROR", message: "Request failed" },
    });
  });
});
