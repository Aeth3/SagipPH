export const appRoutes = [
    {
        name: "Home",
        getComponent: () => require("../src/features/auth/Home/Entry").default,
        options: {
            title: "Home",
            headerShown: false,
        },
    },
    {
        name: "Map",
        getComponent: () => require("../components/ui/LeafletMap").default,
        options: {
            title: "Map",
            headerShown: false,
        },
    },
];

