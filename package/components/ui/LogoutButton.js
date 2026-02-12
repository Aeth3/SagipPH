import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAlertModal } from '../../src/presentation/hooks/useAlertModal';

export default function LogoutButton({ onLogout }) {
    const { showAlert, alertModal } = useAlertModal();

    const handleLogout = () => {
        showAlert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: onLogout },
            ]
        );
    };

    return (
        <>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.text}>Logout</Text>
            </TouchableOpacity>
            {alertModal}
        </>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#98AFC7',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 6,
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 10
    },
    text: {
        color: '#1C1C1C',
        fontWeight: '600',
        fontSize: 16,
    },
});
