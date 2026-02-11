import { View } from "react-native";
import { useTheme } from "../../theme/Theme";
import {COLORS} from "@src/legacyApp"
export default function Screen({ style: customStyle, children }) {
    const { colors } = useTheme()
    return <View style={[{ backgroundColor: COLORS.white, flex: 1, }, customStyle]}>{children}</View>;
}

