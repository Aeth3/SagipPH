export const appRoutes = [
    {
        name: "Chat",
        getComponent: () => require("@features/Chat/ChatScreen").default,
        options: {
            title: "Chat",
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

