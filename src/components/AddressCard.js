import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "./AppButton";
import { colors, shadows } from "../theme";

export default function AddressCard({ address, onEdit, onDelete }) {
    return (
        <View style={styles.card}>
            <Text style={styles.label}>{address?.label || "(no label)"}</Text>
            <Text style={styles.line}>{address?.line1 || ""}</Text>
            {address?.line2 ? <Text style={styles.line}>{address.line2}</Text> : null}

            <View style={styles.actions}>
                <AppButton title="Edit" onPress={onEdit} variant="ghost" compact />
                <AppButton title="Delete" onPress={onDelete} variant="danger" compact />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 12,
        gap: 6,
        backgroundColor: colors.card,
        ...shadows.card,
    },
    label: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
    },
    line: {
        fontSize: 13,
        color: colors.text,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
        paddingTop: 6,
        flexWrap: "wrap",
    },
});
