import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function HomeScreen({ navigation }) {
    const { customer, logout } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Justoo Customer</Text>
            <Text style={styles.subtitle}>Authenticated</Text>

            <View style={styles.card}>
                <Text style={styles.row}>Name: {customer?.name || ""}</Text>
                <Text style={styles.row}>Phone: {customer?.phone || ""}</Text>
                <Text style={styles.row}>Email: {customer?.email || ""}</Text>
            </View>

            <Button title="Profile" onPress={() => navigation.navigate("Profile")} />
            <Button title="Account Status" onPress={() => navigation.navigate("AccountStatus")} />
            <Button title="Logout" onPress={logout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
    },
    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        gap: 6,
    },
    row: {
        fontSize: 14,
    },
});
