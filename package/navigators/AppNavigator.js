import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import config from "../config.json"
import { appRoutes } from "../routes/appRoutes";
import DrawerNavigator from "./DrawerNavigator";


const Stack = createStackNavigator()


export function StackNavigator({ paddingTop = 0 }) {
    return (
        <Stack.Navigator
            initialRouteName="Chat"
            detachInactiveScreens={true}
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: "transparent" },
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            {appRoutes.map(({ name, component, getComponent, options }) => {
                const screenConfig = getComponent
                    ? { getComponent }
                    : { component };

                return (
                    <Stack.Screen
                        key={name}
                        name={name}
                        {...screenConfig}
                        options={options}
                        initialParams={{ paddingTop }}
                    />
                );
            })}
        </Stack.Navigator>
    );
}


export default function AppNavigator() {
    if (config.enableDrawer) {
        return <DrawerNavigator StackNavigator={StackNavigator} paddingTop={0} />
    } else {
        return <StackNavigator paddingTop={20} />
    }


}
