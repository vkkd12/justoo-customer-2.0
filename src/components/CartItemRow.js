import React from "react";
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { colors, radii, shadows, spacing, typography } from "../theme";

export default function CartItemRow({ item, onChangeQuantity, onRemove, disabled }) {
    const quantity = item?.quantity === undefined || item?.quantity === null ? "" : String(item.quantity);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.name} numberOfLines={2}>{item?.name || "Item"}</Text>
                {item?.sellingPrice ? (
                    <Text style={styles.price}>₹{item.sellingPrice}</Text>
                ) : null}
            </View>

            <View style={styles.actions}>
                <View style={styles.quantityControl}>
                    <Pressable
                        style={styles.qtyBtn}
                        onPress={() => onChangeQuantity(String(Math.max(1, Number(quantity) - 1)))}
                        disabled={disabled || Number(quantity) <= 1}
                    >
                        <Text style={styles.qtyBtnText}>−</Text>
                    </Pressable>
                    <TextInput
                        value={quantity}
                        onChangeText={onChangeQuantity}
                        keyboardType="number-pad"
                        style={styles.qtyInput}
                        editable={!disabled}
                        selectTextOnFocus
                    />
                    <Pressable
                        style={styles.qtyBtn}
                        onPress={() => onChangeQuantity(String(Number(quantity) + 1))}
                        disabled={disabled}
                    >
                        <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                </View>
                <Pressable style={styles.removeBtn} onPress={onRemove} disabled={disabled}>
                    <Text style={styles.removeText}>Remove</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: spacing.md,
        gap: spacing.md,
        ...shadows.sm,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: spacing.md,
    },
    name: {
        flex: 1,
        fontSize: typography.body.fontSize,
        fontWeight: "600",
        color: colors.text,
        lineHeight: typography.body.lineHeight,
    },
    price: {
        fontSize: typography.headline.fontSize,
        fontWeight: "700",
        color: colors.primary,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    quantityControl: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.page,
        borderRadius: radii.sm,
        overflow: "hidden",
    },
    qtyBtn: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    qtyBtnText: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    qtyInput: {
        width: 48,
        textAlign: "center",
        fontSize: typography.body.fontSize,
        fontWeight: "600",
        color: colors.text,
        paddingVertical: spacing.sm,
    },
    removeBtn: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    removeText: {
        fontSize: typography.caption.fontSize,
        fontWeight: "600",
        color: colors.danger,
    },
});
