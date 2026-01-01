import React from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function CartItemRow({ item, onChangeQuantity, onRemove, disabled }) {
    const productId = String(item?.productId || "");
    const quantity = item?.quantity === undefined || item?.quantity === null ? "" : String(item.quantity);

    return (
        <View style={styles.card}>
            <Text style={styles.name}>{item?.name || productId}</Text>
            <Text style={styles.meta}>Product: {productId}</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Qty</Text>
                <TextInput
                    value={quantity}
                    onChangeText={onChangeQuantity}
                    keyboardType="number-pad"
                    style={styles.input}
                    editable={!disabled}
                />
                <Button title="Remove" onPress={onRemove} disabled={disabled} />
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
    name: {
        fontSize: 15,
        fontWeight: "600",
    },
    meta: {
        fontSize: 12,
        color: "#666",
    },
    row: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
        paddingTop: 4,
    },
    label: {
        fontSize: 13,
        fontWeight: "500",
    },
    input: {
        minWidth: 80,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
});
