import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { useCart } from "../cart/CartContext";
import AppButton from "../components/AppButton";
import CartItemRow from "../components/CartItemRow";
import { colors, radii, shadows, spacing, typography } from "../theme";

export default function CartScreen({ navigation }) {
    const { items, totalCount, setQuantity, removeItem, clear } = useCart();
    const [busy, setBusy] = useState(false);

    const canCheckout = useMemo(() => items.length > 0 && !busy, [items.length, busy]);

    async function onClear() {
        setBusy(true);
        try {
            await clear();
        } finally {
            setBusy(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Cart ({totalCount})</Text>
                {items.length > 0 && (
                    <AppButton
                        title="Clear all"
                        onPress={onClear}
                        disabled={busy}
                        variant="ghost"
                        size="small"
                    />
                )}
            </View>

            <FlatList
                data={items}
                keyExtractor={(it, idx) => String(it?.productId || idx)}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <CartItemRow
                        item={item}
                        disabled={busy}
                        onChangeQuantity={(t) => setQuantity(item.productId, Number(t || 0))}
                        onRemove={() => removeItem(item.productId)}
                    />
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>Your cart is empty</Text>
                }
            />

            <View style={styles.footer}>
                <AppButton
                    title="Proceed to checkout"
                    onPress={() => navigation.navigate("Checkout")}
                    disabled={!canCheckout}
                    size="large"
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    title: {
        fontSize: typography.title.fontSize,
        fontWeight: "700",
        color: colors.text,
    },
    list: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        paddingBottom: spacing.xxl,
    },
    empty: {
        paddingVertical: spacing.xxxl,
        color: colors.muted,
        textAlign: "center",
        fontSize: typography.body.fontSize,
    },
    footer: {
        backgroundColor: colors.card,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadows.sm,
    },
});
