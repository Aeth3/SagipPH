import Builder from "./Builder";
import Screen from "./layout/Screen";
export default function Wrapper({ components, config, props }) {
    return <Screen>
        <Builder components={components} config={config} props={props} />
    </Screen>
}