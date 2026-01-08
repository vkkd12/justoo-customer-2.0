import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import AppButton from "./AppButton";
import { colors, shadows } from "../theme";

export default function CartItemRow({ item, onChangeQuantity, onRemove, disabled }) {
    const productId = String(item?.productId || "");
    const quantity = item?.quantity === undefined || item?.quantity === null ? "" : String(item.quantity);

    return (
        <View style={styles.card}>
            <Text style={styles.name}>{item?.name || "Item"}</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Qty</Text>
                <TextInput
                    value={quantity}
                    onChangeText={onChangeQuantity}
                    keyboardType="number-pad"
                    style={styles.input}
                    editable={!disabled}
                />
                <AppButton title="Remove" onPress={onRemove} disabled={disabled} variant="ghost" compact />
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
    name: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
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
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
});
