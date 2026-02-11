import { COLORS } from "../app/constants/theme";
import TestScreen from "../components/ui/TestScreen";
import HomeScreen from "../features/Home/HomeScreen";
import MenuScreen from "../src/features/menu/MenuScreen";
import LeafletMap from "../components/ui/LeafletMap";
import { StackNavigator } from "../navigators/AppNavigator";
import Entry from "../src/features/auth/Home/Entry";
import LoansScreen from "../src/features/loans/LoansScreen"

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
        name: "HomeScreen",
        label: "Home",
        component: StackNavigator,
        icon: "home", // optional FontAwesome icon name
        hasHeader: false,
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
    {
         name: "LoansScreen",
        label: "Loans",
        component: LoansScreen,
        icon: "loans", // optional FontAwesome icon name
        hasHeader: false,
    }

];

