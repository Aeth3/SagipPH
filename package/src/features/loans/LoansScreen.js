import { View } from "react-native"
import Screen from "../../../components/layout/Screen"
import SearchBar from "../../../components/ui/SearchBar"
import { useLoansController } from "./controllers/LoansController"
import Builder from "../../../components/Builder"
import { COLORS } from "package/src/legacyApp"
import HeaderTitle from "../../../components/ui/HeaderTitle"
export default function LoansScreen() {
    const { config, builderProps } = useLoansController()


    return <Screen style={{ padding: 12 }}>
        <View style={{ flex: 1 }}>
            <Builder components={config.components} config={config} props={builderProps} />
        </View>
        {builderProps.filterSheet.Sheet}
        {builderProps.loanFormModal}
        {builderProps.alertModal}
    </Screen>
}
