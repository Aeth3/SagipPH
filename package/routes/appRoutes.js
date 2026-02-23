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
        getComponent: () => require("@features/Map/MapScreen").default,
        options: {
            title: "Map",
            headerShown: false,
        },
    },
    {
        name: "NearestCenter",
        getComponent: () => require("@features/NearestCenter/NearestCenterScreen").default,
        options: {
            title: "Nearest Center",
            headerShown: false,
        },
    },
];

