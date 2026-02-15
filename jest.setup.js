import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import "react-native-gesture-handler/jestSetup";

global.__DEV__ = true;

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("react-native-bootsplash", () => ({
  hide: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = {
    View: "View",
    createAnimatedComponent: (Component) => Component,
    useSharedValue: (value) => ({ value }),
    useAnimatedStyle: (updater) => updater(),
    useAnimatedProps: (updater) => updater(),
    withTiming: (value) => value,
    withSpring: (value) => value,
    interpolate: (value) => value,
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    cancelAnimation: jest.fn(),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
  };

  return {
    __esModule: true,
    default: Reanimated,
    ...Reanimated,
  };
});

jest.mock("react-native-sqlite-storage", () => ({
  openDatabase: jest.fn(() => ({
    transaction: (callback) => {
      const tx = {
        executeSql: (_query, _params = [], success) => {
          if (typeof success === "function") {
            success(tx, { rows: { length: 0, item: () => ({}) } });
          }
          return true;
        },
      };
      callback(tx);
    },
  })),
}));

jest.mock("react-native-fs", () => ({}));

jest.mock("react-native-snackbar", () => {
  const Snackbar = {
    show: jest.fn(),
    dismiss: jest.fn(),
    LENGTH_SHORT: 1,
    LENGTH_LONG: 2,
  };
  return {
    __esModule: true,
    default: Snackbar,
    ...Snackbar,
  };
});

jest.mock("react-native-simple-toast", () => {
  const Toast = {
    show: jest.fn(),
    showWithGravity: jest.fn(),
    showWithGravityAndOffset: jest.fn(),
    SHORT: 0,
    LONG: 1,
    TOP: 49,
    BOTTOM: 81,
    CENTER: 17,
  };
  return {
    __esModule: true,
    default: Toast,
    ...Toast,
  };
});

jest.mock("react-native-permissions", () => ({
  check: jest.fn(async () => "granted"),
  request: jest.fn(async () => "granted"),
  openSettings: jest.fn(async () => { }),
  PERMISSIONS: {
    ANDROID: {
      READ_EXTERNAL_STORAGE: "android.permission.READ_EXTERNAL_STORAGE",
      MANAGE_EXTERNAL_STORAGE: "android.permission.MANAGE_EXTERNAL_STORAGE",
    },
    IOS: {},
  },
  RESULTS: {
    GRANTED: "granted",
    DENIED: "denied",
    BLOCKED: "blocked",
    UNAVAILABLE: "unavailable",
    LIMITED: "limited",
  },
}));

jest.mock(
  "react-native-scanbot-sdk",
  () => ({
    performOcr: jest.fn(async () => ({ status: "OK", plainText: "" })),
  }),
  { virtual: true }
);

jest.mock("react-native-webview", () => ({
  WebView: (props) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, props);
  },
}));
jest.mock('@twotalltotems/react-native-otp-input', () => {
  const React = require('react');
  const { View } = require('react-native');

  return function MockOTPInputView(props) {
    return React.createElement(View, props);
  };
});