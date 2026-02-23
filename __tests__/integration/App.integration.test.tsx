import React from "react";
import renderer, { act } from "react-test-renderer";

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaProvider: ({ children }) => <View testID="safe-area-provider">{children}</View>,
    SafeAreaView: ({ children, ...props }) => (
      <View testID="safe-area-view" {...props}>
        {children}
      </View>
    ),
  };
});

jest.mock("../../package/Main", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockMain() {
    return <View testID="main-module" />;
  };
});

import App from "../../App";

describe("App integration", () => {
  it("renders app shell and main module together", () => {
    let tree;
    act(() => {
      tree = renderer.create(<App />);
    });

    expect(tree.root.findByProps({ testID: "safe-area-provider" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "safe-area-view" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "main-module" })).toBeTruthy();
  });
});
