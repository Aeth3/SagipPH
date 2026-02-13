const loadApiClientModule = () => {
  jest.resetModules();

  let requestOnFulfilled;
  let responseOnFulfilled;
  let responseOnRejected;

  let responseUseCallCount = 0;

  const mockClient = {
    request: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn((onFulfilled) => {
          requestOnFulfilled = onFulfilled;
        }),
      },
      response: {
        use: jest.fn((onFulfilled, onRejected) => {
          // Only capture from the first response interceptor registration
          // (the normalizer). The second call is the 401 refresh interceptor.
          if (responseUseCallCount === 0) {
            responseOnFulfilled = onFulfilled;
            responseOnRejected = onRejected;
          }
          responseUseCallCount++;
        }),
      },
    },
  };

  const create = jest.fn(() => mockClient);

  jest.doMock("axios", () => ({
    __esModule: true,
    default: { create },
    create,
  }));

  let moduleUnderTest;
  jest.isolateModules(() => {
    moduleUnderTest = require("../../../package/src/infra/http/apiClient");
  });

  return {
    moduleUnderTest,
    create,
    requestOnFulfilled,
    responseOnFulfilled,
    responseOnRejected,
  };
};

describe("apiClient", () => {
  it("creates axios client using exported active base URL and timeout", () => {
    const { create, moduleUnderTest } = loadApiClientModule();

    expect(["api", "supabase"]).toContain(moduleUnderTest.ACTIVE_HTTP_BASE_TARGET);
    expect(typeof moduleUnderTest.ACTIVE_HTTP_BASE_URL).toBe("string");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: moduleUnderTest.ACTIVE_HTTP_BASE_URL,
      })
    );
  });

  it("request interceptor adds bearer token when provider returns token", async () => {
    const { moduleUnderTest, requestOnFulfilled } = loadApiClientModule();

    moduleUnderTest.setAccessTokenProvider(async () => "test-token");
    const config = { headers: {} };
    const nextConfig = await requestOnFulfilled(config);

    expect(nextConfig.headers.Authorization).toBe("Bearer test-token");
  });

  it("response success interceptor returns response data", () => {
    const { responseOnFulfilled } = loadApiClientModule();

    const payload = { data: { ok: true } };
    expect(responseOnFulfilled(payload)).toEqual({ ok: true });
  });

  it("response error interceptor normalizes axios-like error shape", async () => {
    const { responseOnRejected } = loadApiClientModule();

    const error = {
      message: "Request failed with status code 400",
      response: {
        status: 400,
        data: {
          message: "Bad Request",
          details: "Invalid payload",
        },
      },
    };

    await expect(responseOnRejected(error)).rejects.toEqual({
      status: 400,
      message: "Bad Request",
      data: {
        message: "Bad Request",
        details: "Invalid payload",
      },
    });
  });
});
