import { COLORS } from "package/src/legacyApp";
import TestScreen from "../components/ui/TestScreen";
import HomeScreen from "../features/Home/HomeScreen";
import MenuScreen from "@features/menu/MenuScreen";
import LeafletMap from "../components/ui/LeafletMap";
import { StackNavigator } from "../navigators/AppNavigator";
import Entry from "@features/auth/Home/Entry";
import LoansScreen from "@features/loans/LoansScreen"
import ChatHistoryScreen from "@features/ChatHistory/ChatHistoryScreen";
export const drawerRoutes = [
    // {
    //     name: "DashboardDropdown", // parent dropdown
    //     label: "Dashboard",
    //     children: [
    //         {
    //             name: "HomeScreen",
    //             label: "Home",
    //             component: HomeScreen,
    //             icon: "home", // optional FontAwesome icon name
    //         },
    //         {
    //             name: "MenuScreen",
    //             label: "Menu",
    //             component: MenuScreen,
    //             icon: "list",
    //         },
    //     ],
    // },
    {
        name: "ChatStack",
        label: "New Chat",
        component: StackNavigator,
        icon: "home", // optional FontAwesome icon name
        hasHeader: false,
        disableSelected: true
        // children: [
        //     {
        //         name: "HomeScreen",
        //         label: "Home",
        //         component: Entry,
        //         icon: "home", // optional FontAwesome icon name
        //     },
        //     {
        //         name: "MenuScreen",
        //         label: "Menu",
        //         component: MenuScreen,
        //         icon: "list",
        //     },

        // ],
        // headers: [
        //     {
        //         key: "sync",
        //         label: "Sync",
        //         color: COLORS.primary2
        //     },
        //     {
        //         key: "download",
        //         label: "Download",
        //         color: COLORS.primary
        //     }
        // ]
    },
    // {
    //      name: "LoansScreen",
    //     label: "Loans",
    //     component: LoansScreen,
    //     icon: "loans", // optional FontAwesome icon name
    //     hasHeader: false,
    // }
    {
        name: "ChatHistory",
        label: "Chat History",
        icon: "home",
        hasHeader: false,
        dynamicChildren: true,
        children: [],
    }
];

