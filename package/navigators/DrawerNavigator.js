import { createDrawerNavigator } from "@react-navigation/drawer";
import { View } from "react-native";
import { drawerRoutes } from "../routes/drawerRoutes";
import CustomDrawer from "../components/ui/CustomDrawer";
import { COLORS } from "@src/legacyApp";
import { LegacyButton } from "@src/legacyApp";
import { useActionHandlers } from "../global/actionHandlers";
import { useAuth } from "../src/presentation/hooks/useAuth";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { logout } = useAuth();

  const handlers = useActionHandlers({
    // download: async () => {},
    // sync: async () => {},
  });

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} logout={logout} />}
      screenOptions={{
        headerShown: true,
        headerStatusBarHeight: 0,
        headerTitle: "",
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "600",
        },
        drawerStyle: { backgroundColor: COLORS.darkBg, width: 300 },
        drawerType: "slide",
        overlayColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      {drawerRoutes.map((route) => {
        if (Array.isArray(route.children)) {
          return route.children.map((child) => (
            <Drawer.Screen
              key={child.name}
              name={child.name}
              component={child.component}
              options={{
                drawerLabel: child.label,
              }}
            />
          ));
        }

        return (
          <Drawer.Screen
            key={route.name}
            name={route.name}
            component={route.component}
            options={{
              drawerLabel: route.label,
              headerRight: () =>
                route.hasHeader && (
                  <View style={{ flexDirection: "row", gap: 5, marginRight: 5 }}>
                    {route.headers.map((header) => (
                      <LegacyButton
                        key={header.key}
                        title={header.label}
                        color={header.color}
                        onPress={handlers[header.key]}
                      />
                    ))}
                  </View>
                ),
            }}
          />
        );
      })}
    </Drawer.Navigator>
  );
}
