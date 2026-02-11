import { Text, View } from "react-native";
import Screen from "../../../../components/layout/Screen";
import { COLORS } from "../../../../app/constants/theme";

export default function Entry({ route }) {
  return (
    <Screen style={{ paddingVertical: route?.params?.paddingTop }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            color: COLORS.primary,
            alignSelf: "center",
            fontWeight: "700",
            fontSize: 30,
          }}
        >
          Start building now
        </Text>
      </View>
    </Screen>
  );
}
