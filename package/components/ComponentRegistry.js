import { Image, Text } from "react-native";
import Screen from "./layout/Screen";
import Header from "./ui/Header";
import MyDayCarousel from "./ui/MyDayCarousel";
import PostComposer from "./ui/PostComposer";
import SocialFeed from "./ui/SocialFeed";
import SwipeRenderer from "./SwipeRenderer";
import DynamicRenderer from "./DynamicRenderer";
import { MenuBuilder } from "../features/Home/components/MenuBuilder";
import { ProfileCapsuleBuilder } from "../features/Home/components/ProfileCapsuleBuilder";
import YourShorcuts from "../features/Home/components/YourShortcuts";
import ShortcutGrid from "../features/Home/components/ShortcutGrid";
import Settings from "../features/Home/components/Settings";
import Logout from "../features/Home/components/Logout";
import Reels from "./ui/Reels";
import FiltersList from "../components/ui/FilterList"
import SearchBar from "./ui/SearchBar";
import SearchBarWithFilter from "../components/ui/SearchBarWithFilter"
import LoanList from "@features/loans/components/LoanList"
import HeaderTitle from "./ui/HeaderTitle";
import FloatingAddButton from "./ui/FloatingAddButton";
/* Register all reusable UI components */

const safeArray = (value) => (Array.isArray(value) ? value : []);

export const componentRegistry = {
    header: (config, maps) => (
        <Header
            title={config?.title}
            icons={safeArray(config?.icons).map((icon) => ({
                ...icon,
                name: maps?.iconMap?.[icon.name],
                onPress: () => maps?.actionHandlers?.[icon.action]?.(icon),
                size: icon.size,
            }))}
            secondaryIcons={safeArray(config?.secondaryIcons).map((icon) => ({
                ...icon,
                name: maps?.secondaryIconsMap?.[icon.name],
                onPress: () => maps?.actionHandlers?.[icon.action]?.(icon),
            }))}
            uri={config?.profilePicture}
            handleProfilePress={config?.handleProfilePress}
            style={config?.headerStyle}
            iconStyle={config?.iconStyle}
            isPrimaryVisible={config?.isPrimaryVisible}
        />
    ),

    composer: (config) => <PostComposer avatarUri={config?.profilePicture} />,
    stories: (config) => <MyDayCarousel stories={safeArray(config?.stories)} />,
    feed: (config) => <SocialFeed posts={safeArray(config?.posts)} />,
    home: (config) =>
        safeArray(config?.homeSections).map((item, id) => (
            <DynamicRenderer item={item} config={config} key={id} />
        )),
    friends: () => (
        <Screen>
            <Text>FRIENDS</Text>
        </Screen>
    ),
    videos: (config) => <Reels data={safeArray(config?.reelsData)} />,
    profile: () => (
        <Screen>
            <Text>PROFILE</Text>
        </Screen>
    ),
    notification: () => (
        <Screen>
            <Text>NOTIFICATION</Text>
        </Screen>
    ),

    menu: (config) => MenuBuilder(config ?? {}),
    swiper: (config, maps) => (
        <SwipeRenderer
            pages={safeArray(config?.pages)}
            config={{ ...(config?.config ?? {}), ...(config ?? {}) }}
            iconMap={maps?.iconMap}
        />
    ),
    profileCapsule: (config) => ProfileCapsuleBuilder(config ?? {}),
    shortcuts: (config, maps) => (
        <YourShorcuts config={config ?? {}} actionHandlers={maps?.actionHandlers ?? {}} />
    ),
    grid: (config) => <ShortcutGrid config={config ?? {}} />,
    settings: (config) => <Settings config={config ?? {}} />,
    logout: (config) => <Logout config={config ?? {}} />,
    filter: (config) => <FiltersList filters={config.filters} />,
    searchbar: (config) => <SearchBar />,
    searchbarwithfilter: (config, { props }) => (
        <SearchBarWithFilter
            value={props?.filtersState?.search ?? ""}
            colors={props.colors}
            onOpenFilters={props?.filterSheet?.open}
            onChangeText={(text) =>
                props?.setFiltersState(prev => ({
                    ...prev,
                    search: text,
                }))
            }
        />
    ),
    loanlist: (config, { props }) => <LoanList loans={props?.loans} />,
    headertitle: (config) => <HeaderTitle title={config.headerTitle} />,
    floatingaddbutton: (config, { props }) => <FloatingAddButton onPress={props?.handlePressAddButton} alignment={config.addButtonAlignment} />
};
