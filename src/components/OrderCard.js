import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, shadows } from "../theme";

export default function OrderCard({ order, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
            <View style={styles.card}>
                <View style={styles.rowBetween}>
                    <Text style={styles.status}>{String(order?.status || "")}</Text>
                    <Text style={styles.amount}>{String(order?.totalAmount ?? "")}</Text>
                </View>
                <Text style={styles.meta}>Placed on {String(order?.createdAt ?? "")}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 14,
        gap: 6,
        backgroundColor: colors.card,
        ...shadows.card,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    status: {
        fontWeight: "800",
        color: colors.text,
        fontSize: 16,
        textTransform: "capitalize",
    },
    amount: {
        fontWeight: "800",
        color: colors.primary,
        fontSize: 16,
    },
    meta: {
        color: colors.muted,
        fontSize: 13,
    },
});
