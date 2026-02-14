import React from "react";
import renderer, { act } from "react-test-renderer";
import { useAlertModal } from "../../../package/src/presentation/hooks/useAlertModal";

const mockAlertModalRender = jest.fn(() => null);
jest.mock("../../../package/components/ui/AlertModal", () => (props) => {
  mockAlertModalRender(props);
  return null;
});

function setupHook() {
  const ref = { current: null };

  function Harness() {
    ref.current = useAlertModal();
    return ref.current.alertModal;
  }

  let root;
  act(() => {
    root = renderer.create(<Harness />);
  });

  return { ref, root };
}

describe("useAlertModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows default alert state with inferred info type", () => {
    const { ref } = setupHook();

    act(() => {
      ref.current.showAlert("Notice", "Hello");
    });

    const props = mockAlertModalRender.mock.calls.at(-1)[0];
    expect(props.visible).toBe(true);
    expect(props.title).toBe("Notice");
    expect(props.message).toBe("Hello");
    expect(props.buttons).toEqual([{ text: "OK" }]);
    expect(props.type).toBe("info");
  });

  it("infers confirm type when a destructive button exists", () => {
    const { ref } = setupHook();

    act(() => {
      ref.current.showAlert("Delete item", "Cannot be undone", [
        { text: "Delete", style: "destructive" },
      ]);
    });

    const props = mockAlertModalRender.mock.calls.at(-1)[0];
    expect(props.type).toBe("confirm");
  });

  it("uses explicit type override from options", () => {
    const { ref } = setupHook();

    act(() => {
      ref.current.showAlert("Failed to save", "Try again", null, {
        type: "warning",
      });
    });

    const props = mockAlertModalRender.mock.calls.at(-1)[0];
    expect(props.type).toBe("warning");
  });

  it("hideAlert sets modal visibility to false", () => {
    const { ref } = setupHook();

    act(() => {
      ref.current.showAlert("Success", "Saved");
    });
    act(() => {
      ref.current.hideAlert();
    });

    const props = mockAlertModalRender.mock.calls.at(-1)[0];
    expect(props.visible).toBe(false);
  });
});
