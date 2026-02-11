import { FlatList } from "react-native";
import Screen from "../../../components/layout/Screen";
import { useMenuController } from "./controller/MenuController";


export default function MenuScreen() {
    const { renderItem, sections } = useMenuController()
    return <Screen>
        <FlatList
            data={sections}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
        />
    </Screen>

}
