import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { useCart } from "../cart/CartContext";
import AppButton from "../components/AppButton";
import CartItemRow from "../components/CartItemRow";
import { colors } from "../theme";

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
                <View>
                    <Text style={styles.kicker}>Your basket</Text>
                    <Text style={styles.title}>Cart ({totalCount})</Text>
                </View>
                <AppButton title="Clear" onPress={onClear} disabled={busy || items.length === 0} variant="ghost" compact />
            </View>

            <FlatList
                data={items}
                keyExtractor={(it, idx) => String(it?.productId || idx)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <CartItemRow
                        item={item}
                        disabled={busy}
                        onChangeQuantity={(t) => setQuantity(item.productId, Number(t || 0))}
                        onRemove={() => removeItem(item.productId)}
                    />
                )}
                ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
            />

            <View style={styles.footer}>
                <AppButton title="Proceed to checkout" onPress={() => navigation.navigate("Checkout")} disabled={!canCheckout} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        gap: 12,
        backgroundColor: colors.page,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    kicker: {
        color: colors.accent,
        fontWeight: "700",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.text,
    },
    list: {
        gap: 10,
        paddingBottom: 20,
    },
    empty: {
        paddingVertical: 10,
        color: colors.muted,
    },
    footer: {
        paddingTop: 6,
    },
});
