import React from "react";
import renderer, { act } from "react-test-renderer";
import { TextInput } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from "../../../package/src/features/Chat/ChatScreen";

const mockSend = jest.fn();
const mockClearChat = jest.fn();
const mockLoadChat = jest.fn();

jest.mock("../../../package/src/features/Chat/controllers/ChatController", () => ({
  __esModule: true,
  default: () => ({
    messages: [],
    isLoading: false,
    isReady: true,
    send: mockSend,
    clearChat: mockClearChat,
    loadChat: mockLoadChat,
    scrollViewRef: { current: null },
    showDispatchStatus: { show: false, details: null },
    dispatchGeotag: null,
  }),
}));

jest.mock("../../../package/components/layout/Screen", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockScreen({ children }) {
    return <View>{children}</View>;
  };
});

jest.mock("../../../package/components/ui/ChatHeader", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockChatHeader() {
    return <View testID="mock-chat-header" />;
  };
});

jest.mock("package/src/legacyApp", () => ({
  COLORS: {
    white: "#fff",
    placeholderColor: "#999",
    text: "#222",
    title: "#111",
    primaryRed: "#3b82f6",
    borderColor: "#ddd",
    redLight: "#fee2e2",
    themePrimary: "#1d4ed8",
  },
  FONTS: {},
  IMAGES: {
    appLogo: 1,
  },
  SIZES: {},
}));

jest.mock("package/src/legacyApp/components/CustomButton", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return function MockCustomButton({ title, onPress }) {
    return (
      <TouchableOpacity testID="send-test-sms-btn" onPress={onPress}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  };
});

describe("ChatScreen", () => {
  let tree;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (tree) {
      act(() => {
        tree.unmount();
      });
      tree = null;
    }
    jest.restoreAllMocks();
  });

  const renderScreen = async () => {
    await act(async () => {
      tree = renderer.create(
        <NavigationContainer>
          <ChatScreen route={{ params: {} }} />
        </NavigationContainer>
      );
    });
  };

  it("sends suggestion chip text when chip is pressed", async () => {
    await renderScreen();
    const suggestionChip = tree.root.find((node) => {
      const children = Array.isArray(node?.props?.children) ? node.props.children : [];
      return (
        typeof node?.props?.onPress === "function" &&
        children.some((child) => child?.props?.children === "Report emergency")
      );
    });
    await act(async () => {
      await suggestionChip.props.onPress();
    });
    expect(mockSend).toHaveBeenCalledWith("Report emergency");
  });

  it("sends typed message from the input submit action", async () => {
    await renderScreen();
    const input = tree.root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText("Hello SagipPH");
    });
    await act(async () => {
      await input.props.onSubmitEditing();
    });
    expect(mockSend).toHaveBeenCalledWith("Hello SagipPH");
  });

  it("triggers clear and load handlers from route params", async () => {
    await act(async () => {
      tree = renderer.create(
        <NavigationContainer>
          <ChatScreen route={{ params: { newChat: true, loadChatId: "chat-123" } }} />
        </NavigationContainer>
      );
    });
    expect(mockClearChat).toHaveBeenCalled();
    expect(mockLoadChat).not.toHaveBeenCalled();

    await act(async () => {
      tree.update(
        <NavigationContainer>
          <ChatScreen route={{ params: { loadChatId: "chat-123" } }} />
        </NavigationContainer>
      );
    });
    expect(mockLoadChat).toHaveBeenCalledWith("chat-123");
  });
});
