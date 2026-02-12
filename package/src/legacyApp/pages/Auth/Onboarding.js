
import React, { useRef } from 'react';
import {
    Animated,
    BackHandler,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import LinearGradient from 'react-native-linear-gradient';


const DATA = [
    {
        title: 'Handa sa Oras ng Sakuna.',
        desc: 'Matalinong babala at mabilis na tulong para sa kaligtasan ng bawat pamayanan.',
    }
]

const Onboarding = (props) => {
    const { colors } = useTheme();
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            return () => subscription.remove();
        }, []),
    );

    const scrollValue = useRef(new Animated.Value(0)).current;

    return (
        <>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: SIZES.height / 2.2,
                    }}>
                        <LinearGradient
                            colors={['#F7F5FF', 'rgba(255,255,255,0)']}
                            style={styles.topGradient}
                        />
                        <LinearGradient
                            colors={['#F7F5FF', 'rgba(255,255,255,0)']}
                            style={styles.bottomGradient}
                        />
                        <Image
                            style={{
                                width: 350,
                                height: 350,
                                resizeMode: 'contain',
                            }}
                            source={IMAGES.logoBig}
                        />
                        <Image
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                width: '100%',
                                resizeMode: 'stretch',
                                height: 65,
                                //tintColor:colors.backgroundColor,
                            }}
                            source={IMAGES.loginShape}
                        />

                    </View>
                    <View style={{ backgroundColor: '#332A5E', flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                decelerationRate="fast"
                                scrollEventThrottle={16}
                                showsHorizontalScrollIndicator={false}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { x: scrollValue } } }],
                                    { useNativeDriver: false },
                                )}>
                                {DATA.map((data, index) => (

                                    <View style={[styles.slideItem]} key={index}>
                                        <Text style={[FONTS.h2, { textAlign: 'center', color: COLORS.white }]}>{data.title}</Text>
                                        <Text style={[FONTS.fontLg, { textAlign: 'center', color: COLORS.white, opacity: .7 }]}>{data.desc}</Text>
                                    </View>

                                ))}
                            </ScrollView>
                            <View style={styles.indicatorConatiner} pointerEvents="none">
                                {DATA.map((x, i) => (
                                    <Indicator i={i} key={i} scrollValue={scrollValue} />
                                ))}
                            </View>

                        </View>
                        <View style={GlobalStyleSheet.container}>
                            <View style={{ marginBottom: 50 }}>
                                <CustomButton
                                    title="PROCEED"
                                    onPress={() => props.navigation.navigate('PhoneEntry')}
                                />
                            </View>
                            {/* <View>
                                <TouchableOpacity
                                    onPress={() => props.navigation.navigate('SignIn')}
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,.2)',
                                        borderRadius: SIZES.radius,
                                        height: 50,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ ...FONTS.fontLg, color: COLORS.white }}>SIGN IN</Text>
                                </TouchableOpacity>
                            </View> */}
                            {/* <View style={{ alignItems: 'center', padding: 12 }}>
                                <Text style={[FONTS.font, { color: 'rgba(255,255,255,.7)' }]}>Forgot your account?</Text>
                            </View> */}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};


function Indicator({ i, scrollValue }) {
    const translateX = scrollValue.interpolate({
        inputRange: [-SIZES.width + i * SIZES.width, i * SIZES.width, SIZES.width + i * SIZES.width],
        outputRange: [-20, 0, 20],
    });
    return (
        <View style={styles.indicator}>
            <Animated.View
                style={[styles.activeIndicator, { transform: [{ translateX }] }]}
            />
        </View>
    );
}


const styles = StyleSheet.create({

    slideItem: {
        width: SIZES.width,
        alignItems: 'center',
        padding: 25,
        paddingBottom: 40,
        paddingTop: 15,
    },
    indicatorConatiner: {
        alignSelf: 'center',
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
    },
    indicator: {
        height: 10,
        width: 10,
        // borderWidth:1,
        // borderColor:'transparent',
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,.2)',
        marginHorizontal: 4,
        overflow: 'hidden',
    },
    activeIndicator: {
        height: '100%',
        width: '100%',
        backgroundColor: COLORS.primary2,
        borderRadius: 10,

    },

})


export default Onboarding;
