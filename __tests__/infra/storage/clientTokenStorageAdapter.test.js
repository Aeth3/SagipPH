jest.mock("react-native-keychain", () => ({
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

jest.mock("../../../package/src/infra/storage/asyncStorageAdapter", () => ({
  asyncStorageAdapter: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const Keychain = require("react-native-keychain");
const {
  asyncStorageAdapter,
} = require("../../../package/src/infra/storage/asyncStorageAdapter");
const {
  clientTokenStorageAdapter,
} = require("../../../package/src/infra/storage/clientTokenStorageAdapter");

describe("clientTokenStorageAdapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets token from keychain when available", async () => {
    Keychain.getGenericPassword.mockResolvedValue({ password: "secure-token" });

    const token = await clientTokenStorageAdapter.getItem("client_token");

    expect(token).toBe("secure-token");
    expect(asyncStorageAdapter.getItem).not.toHaveBeenCalled();
  });

  it("falls back to AsyncStorage get when keychain get fails", async () => {
    Keychain.getGenericPassword.mockRejectedValue(new Error("keychain unavailable"));
    asyncStorageAdapter.getItem.mockResolvedValue("fallback-token");

    const token = await clientTokenStorageAdapter.getItem("client_token");

    expect(token).toBe("fallback-token");
    expect(asyncStorageAdapter.getItem).toHaveBeenCalledWith("client_token");
  });

  it("stores token in keychain", async () => {
    Keychain.setGenericPassword.mockResolvedValue(true);

    await clientTokenStorageAdapter.setItem("client_token", "secure-token");

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      "client_token",
      "secure-token",
      expect.objectContaining({ service: "sagipph.client_token" })
    );
    expect(asyncStorageAdapter.setItem).not.toHaveBeenCalled();
  });

  it("falls back to AsyncStorage set when keychain set fails", async () => {
    Keychain.setGenericPassword.mockRejectedValue(new Error("keychain unavailable"));

    await clientTokenStorageAdapter.setItem("client_token", "fallback-token");

    expect(asyncStorageAdapter.setItem).toHaveBeenCalledWith("client_token", "fallback-token");
  });

  it("resets keychain token and clears fallback storage", async () => {
    Keychain.resetGenericPassword.mockResolvedValue(true);

    await clientTokenStorageAdapter.removeItem("client_token");

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(
      expect.objectContaining({ service: "sagipph.client_token" })
    );
    expect(asyncStorageAdapter.removeItem).toHaveBeenCalledWith("client_token");
  });
});
