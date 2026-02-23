import React from "react";
import renderer, { act } from "react-test-renderer";

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaProvider: ({ children }) => <View>{children}</View>,
    SafeAreaView: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

jest.mock("../../package/Main", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockMain() {
    return <View testID="mock-main" />;
  };
});

import App from "../../App";

describe("App accessibility", () => {
  it("exposes an accessibility label for the application container", () => {
    let tree;
    act(() => {
      tree = renderer.create(<App />);
    });

    expect(
      tree.root.findByProps({ accessibilityLabel: "SagipPH application" })
    ).toBeTruthy();
  });
});
