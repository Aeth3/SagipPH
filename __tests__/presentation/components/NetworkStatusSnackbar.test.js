import React from "react";
import renderer, { act } from "react-test-renderer";
import NetworkStatusSnackbar from "../../../package/src/presentation/components/NetworkStatusSnackbar";

// ── Mocks ──────────────────────────────────────────────────────────────
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../../package/src/presentation/hooks/useOfflineStatus", () => {
  let _isOnline = true;
  return {
    useOfflineStatus: () => ({ isOnline: _isOnline, isOffline: !_isOnline }),
    __setIsOnline: (val) => {
      _isOnline = val;
    },
  };
});

jest.mock("../../../package/src/legacyApp", () => ({
  COLORS: { success: "#54D969", danger: "#ff4a5c" },
}));

const {
  __setIsOnline,
} = require("../../../package/src/presentation/hooks/useOfflineStatus");

// Helper to mount / re-mount the component.
let root;
const mount = () => {
  act(() => {
    root = renderer.create(<NetworkStatusSnackbar />);
  });
};
const rerender = () => {
  act(() => {
    root.update(<NetworkStatusSnackbar />);
  });
};

/** Recursively find all Text nodes and concatenate their children. */
const getTextContent = (tree) => {
  if (!tree) return "";
  if (tree.type === "Text") return (tree.children || []).join("");
  if (Array.isArray(tree.children)) {
    return tree.children.map(getTextContent).join("");
  }
  return "";
};

describe("NetworkStatusSnackbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    __setIsOnline(true);
  });

  afterEach(() => {
    jest.useRealTimers();
    if (root) {
      act(() => root.unmount());
      root = null;
    }
  });

  it("renders nothing on first mount (no banner)", () => {
    mount();
    expect(root.toJSON()).toBeNull();
  });

  it("shows offline banner when connectivity drops", () => {
    mount();
    expect(root.toJSON()).toBeNull();

    __setIsOnline(false);
    rerender();

    const tree = root.toJSON();
    expect(tree).not.toBeNull();
    const text = getTextContent(tree);
    expect(text).toMatch(/offline/i);
    // Verify danger background color
    const styles = [].concat(tree.props.style).filter(Boolean);
    const bgColors = styles.map((s) => s.backgroundColor).filter(Boolean);
    expect(bgColors).toContain("#ff4a5c");
  });

  it("shows online banner when connectivity is restored", () => {
    __setIsOnline(false);
    mount();

    // Transition to online
    __setIsOnline(true);
    rerender();

    const tree = root.toJSON();
    expect(tree).not.toBeNull();
    const text = getTextContent(tree);
    expect(text).toMatch(/back online/i);
    const styles = [].concat(tree.props.style).filter(Boolean);
    const bgColors = styles.map((s) => s.backgroundColor).filter(Boolean);
    expect(bgColors).toContain("#54D969");
  });

  it("does not show banner when status stays the same", () => {
    mount();
    expect(root.toJSON()).toBeNull();

    // Still online — no change
    __setIsOnline(true);
    rerender();

    expect(root.toJSON()).toBeNull();
  });
});
