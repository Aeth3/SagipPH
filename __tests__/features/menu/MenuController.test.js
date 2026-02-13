import React from "react";
import renderer, { act } from "react-test-renderer";
import { useMenuController } from "../../../package/src/features/menu/controllers/MenuController";

/* ── Mocks ─────────────────────────────────────────────── */

const mockSetCurrentPage = jest.fn();
jest.mock("../../../package/context/context", () => ({
    useGlobal: () => ({ setCurrentPage: mockSetCurrentPage }),
}));

jest.mock("../../../package/src/features/menu/config.json", () => ({
    title: "Menu",
    icons: [
        { name: "faSearch", action: "search", size: 20 },
        { name: "faMessage", action: "message", size: 20 },
    ],
    sections: [
        { id: "header", type: "header" },
    ],
    menuItems: [
        { title: "Friends", icon: "faUserFriends", action: "userFriends" },
    ],
}));

jest.mock("../../../../assets/icons/iconMap", () => ({
    iconMap: { faSearch: "search-icon", faMessage: "message-icon" },
}), { virtual: true });

jest.mock("../../../package/assets/icons/iconMap", () => ({
    iconMap: { faSearch: "search-icon", faMessage: "message-icon" },
}));

jest.mock("../../../package/components/DynamicRenderer", () => "DynamicRenderer");

/* ── Harness ───────────────────────────────────────────── */

const setupHook = () => {
    let hookApi;
    function Harness() {
        hookApi = useMenuController();
        return null;
    }
    act(() => {
        renderer.create(<Harness />);
    });
    return hookApi;
};

/* ── Tests ─────────────────────────────────────────────── */

describe("useMenuController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns sections from config", () => {
        const ctrl = setupHook();
        expect(ctrl.sections).toEqual([{ id: "header", type: "header" }]);
    });

    it("returns a renderItem function", () => {
        const ctrl = setupHook();
        expect(typeof ctrl.renderItem).toBe("function");
    });

    it("renderItem returns a DynamicRenderer element", () => {
        const ctrl = setupHook();
        const item = { id: "header", type: "header" };
        const element = ctrl.renderItem({ item });

        expect(element).toBeTruthy();
        // DynamicRenderer is mocked as a string component
        expect(element.type).toBe("DynamicRenderer");
    });

    it("renderItem passes correct props to DynamicRenderer", () => {
        const ctrl = setupHook();
        const item = { id: "header", type: "header" };
        const element = ctrl.renderItem({ item });

        expect(element.props.item).toEqual(item);
        expect(element.props.config).toEqual({
            title: "Menu",
            icons: [
                { name: "faSearch", action: "search", size: 20 },
                { name: "faMessage", action: "message", size: 20 },
            ],
        });
        expect(element.props.iconMap).toBeDefined();
        expect(element.props.actionHandlers).toBeDefined();
    });
});
