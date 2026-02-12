// navigation/RootNavigator.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { useGlobal } from '../context/context';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import LoadingOverlay from '../components/layout/LoadingOverlay';
import RNBootSplash from "react-native-bootsplash";

export default function RootNavigator() {
    // 1. We now only grab state. No DB logic here.
    const { auth, loading } = useGlobal();

    // 2. While the App is "bootstrapping" (DB init + Auth check), 
    // the Native Splash Screen (Bootsplash) is visible over the app.
    // We return null to prevent React from rendering the Login screen underneath it.
    useEffect(() => {
        if (!loading) {
            RNBootSplash.hide({ fade: true });
        }
    }, [loading]);

    // While bootstrapping (auth not yet resolved), show only the loading overlay.
    if (auth === undefined) {
        return <LoadingOverlay visible={true} />;
    }

    // Once bootstrap is done, always keep NavigationContainer mounted so
    // navigation state (e.g. OTP screen) is never lost by a loading toggle.
    return (
        <>
            <NavigationContainer>
                {/* 3. Simple Switch Logic */}
                {auth ? <AppNavigator /> : <AuthNavigator />}
            </NavigationContainer>
            <LoadingOverlay visible={loading} />
        </>
    );
}