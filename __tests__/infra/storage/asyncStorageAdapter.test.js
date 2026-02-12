jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

const AsyncStorage = require("@react-native-async-storage/async-storage");
const { asyncStorageAdapter } = require("../../../package/src/infra/storage/asyncStorageAdapter");

describe("asyncStorageAdapter", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("getItem delegates to AsyncStorage.getItem", async () => {
        AsyncStorage.getItem.mockResolvedValue("value");
        const result = await asyncStorageAdapter.getItem("key");
        expect(AsyncStorage.getItem).toHaveBeenCalledWith("key");
        expect(result).toBe("value");
    });

    it("setItem delegates to AsyncStorage.setItem", async () => {
        AsyncStorage.setItem.mockResolvedValue(undefined);
        await asyncStorageAdapter.setItem("key", "val");
        expect(AsyncStorage.setItem).toHaveBeenCalledWith("key", "val");
    });

    it("removeItem delegates to AsyncStorage.removeItem", async () => {
        AsyncStorage.removeItem.mockResolvedValue(undefined);
        await asyncStorageAdapter.removeItem("key");
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("key");
    });

    it("clear delegates to AsyncStorage.clear", async () => {
        AsyncStorage.clear.mockResolvedValue(undefined);
        await asyncStorageAdapter.clear();
        expect(AsyncStorage.clear).toHaveBeenCalled();
    });
});
