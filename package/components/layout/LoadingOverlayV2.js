// components/LoadingOverlay.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
<<<<<<< ours
import { COLORS } from '@src/legacyApp';
=======
import { COLORS } from 'package/src/legacyApp';
>>>>>>> theirs

const LoadingOverlayV2 = ({
    visible = false,
    color = COLORS.white,
    backgroundColor = 'rgba(0,0,0,.3)',
    message = '',
}) => {
    if (!visible) return null;

    return (
        <View style={[styles.overlay, { backgroundColor }]}>
            <ActivityIndicator size="large" color={color} />
            {message ? <Text style={styles.text}>{message}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        zIndex: 1,
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 12,
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LoadingOverlayV2;
