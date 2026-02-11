import React from "react";
import renderer from "react-test-renderer";
import DynamicRenderer from "../package/components/DynamicRenderer";

jest.mock("../package/components/ComponentRegistry", () => ({
    componentRegistry: {},
}));

describe("DynamicRenderer", () => {
    let warnSpy;

    beforeEach(() => {
        warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    const renderJson = async (element) => {
        let instance;
        await renderer.act(async () => {
            instance = renderer.create(element);
        });
        return instance.toJSON();
    };

    it("renders fallback for unknown type", async () => {
        const tree = await renderJson(
            <DynamicRenderer item={{ type: "unknown" }} config={{}} />
        );

        expect(tree).toBeTruthy();
        expect(tree.type).toBe("Text");
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("[DynamicRenderer] Unknown component type"),
            "unknown"
        );
    });

    it("renders fallback for invalid item", async () => {
        const tree = await renderJson(
            <DynamicRenderer item={null} config={{}} />
        );

        expect(tree).toBeTruthy();
        expect(tree.type).toBe("Text");
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("[DynamicRenderer] Invalid item"),
            ""
        );
    });

    it("renders fallback for invalid config", async () => {
        const tree = await renderJson(
            <DynamicRenderer item={{ type: "stories" }} config={{ stories: "bad" }} />
        );

        expect(tree).toBeTruthy();
        expect(tree.type).toBe("Text");
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("[DynamicRenderer] Invalid config for type"),
            expect.objectContaining({ type: "stories" })
        );
    });
});
