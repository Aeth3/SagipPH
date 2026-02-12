import { iconMap } from "../../../../assets/icons/iconMap"
import DynamicRenderer from "../../../../components/DynamicRenderer"
import { useActionHandlers } from "../../../../global/actionHandlers"

import config from "../config.json"

export const useMenuController = () => {
    const actionHandlers = useActionHandlers()
    const renderItem = ({ item }) => (
        <DynamicRenderer
            item={item}
            config={{
                title: config.title,
                icons: config.icons

            }}
            iconMap={iconMap}
            actionHandlers={actionHandlers}
        />
    )

    return { renderItem, sections: config.sections }
}
