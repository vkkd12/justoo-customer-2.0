import React from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

export default function OrderItemRow({
    value,
    onChange,
    onRemove,
    removable,
    disabled,
}) {
    const productId = String(value?.productId || "");
    const quantity = value?.quantity === undefined || value?.quantity === null ? "" : String(value.quantity);

    return (
        <View style={styles.row}>
            <TextInput
                value={productId}
                onChangeText={(t) => onChange?.({ ...value, productId: t })}
                placeholder="Product ID"
                autoCapitalize="none"
                style={styles.input}
                editable={!disabled}
            />
            <TextInput
                value={quantity}
                onChangeText={(t) => onChange?.({ ...value, quantity: t })}
                placeholder="Qty"
                keyboardType="number-pad"
                style={[styles.input, styles.qty]}
                editable={!disabled}
            />
            {removable ? <Button title="Remove" onPress={onRemove} disabled={disabled} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
    },
    input: {
        flexGrow: 1,
        minWidth: 160,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    qty: {
        minWidth: 80,
        flexGrow: 0,
    },
});
