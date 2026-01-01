import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function AddressCard({ address, onEdit, onDelete }) {
    return (
        <View style={styles.card}>
            <Text style={styles.label}>{address?.label || "(no label)"}</Text>
            <Text style={styles.line}>{address?.line1 || ""}</Text>
            {address?.line2 ? <Text style={styles.line}>{address.line2}</Text> : null}

            <View style={styles.actions}>
                <Button title="Edit" onPress={onEdit} />
                <Button title="Delete" onPress={onDelete} />
            </View>
        </View>
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
    label: {
        fontSize: 15,
        fontWeight: "600",
    },
    line: {
        fontSize: 13,
        color: "#444",
    },
    actions: {
        flexDirection: "row",
        gap: 8,
        paddingTop: 6,
        flexWrap: "wrap",
    },
});
