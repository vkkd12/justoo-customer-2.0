import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OrderCard({ order, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
            <View style={styles.card}>
                <Text style={styles.row}>Order: {String(order?.id || "")}</Text>
                <Text style={styles.row}>Status: {String(order?.status || "")}</Text>
                <Text style={styles.row}>Total: {String(order?.totalAmount ?? "")}</Text>
                <Text style={styles.row}>Created: {String(order?.createdAt ?? "")}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        gap: 6,
    },
    row: {
        fontSize: 13,
    },
});
