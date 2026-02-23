import { COLORS } from "package/src/legacyApp";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ProfileHeader({ name = 'John Doe', email = 'johndoe@email.com', uri = "https://i.pravatar.cc/150?img=15", propStyles }) {
    return <View style={[styles.header, propStyles]}>
        <View style={styles.avatarRing}>
            <Image
                source={{ uri }}
                style={styles.avatar}
            />
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
    </View>
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 40,
        paddingBottom: 24,
        alignItems: "center",
    },
    avatarRing: {
        padding: 3,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: COLORS.primaryRed,
        marginBottom: 14,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.primaryRed,
        letterSpacing: 0.2,
    },
    email: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
    },
})