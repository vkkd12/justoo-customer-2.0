import React, { useMemo, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";

import { useCart } from "../cart/CartContext";
import CartItemRow from "../components/CartItemRow";

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
                <Button title="Clear" onPress={onClear} disabled={busy || items.length === 0} />
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
                <Button title="Checkout" onPress={() => navigation.navigate("Checkout")} disabled={!canCheckout} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        gap: 12,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
    },
    list: {
        gap: 10,
        paddingBottom: 20,
    },
    empty: {
        paddingVertical: 10,
        color: "#666",
    },
    footer: {
        paddingTop: 6,
    },
});
