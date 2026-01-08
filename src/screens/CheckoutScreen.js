import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { ApiError, apiGet, apiPost } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import { colors, shadows } from "../theme";

export default function CheckoutScreen({ navigation }) {
    const { token } = useAuth();
    const { items, clear } = useCart();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [deliveryFee, setDeliveryFee] = useState("0");

    const [addressesLoading, setAddressesLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setAddressesLoading(true);
            try {
                const data = await apiGet("/customer/addresses", { token });
                if (cancelled) return;
                const list = Array.isArray(data?.addresses) ? data.addresses : [];
                setAddresses(list);
                setAddressId(list[0]?.id || null);
            } catch {
                // Saved addresses are optional; manual address can be used.
            } finally {
                if (!cancelled) setAddressesLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const canPlaceOrder = useMemo(() => {
        if (saving) return false;
        if (!items.length) return false;

        const normalizedItems = items
            .map((it) => ({ productId: String(it.productId || "").trim(), quantity: Number(it.quantity) }))
            .filter((it) => it.productId);

        if (!normalizedItems.length) return false;
        if (normalizedItems.some((it) => !Number.isFinite(it.quantity) || it.quantity <= 0)) return false;

        return Boolean(addressId);
    }, [saving, items, addressId]);

    async function onPlaceOrder() {
        setSaving(true);
        setError(null);
        try {
            const normalizedItems = items
                .map((it) => ({
                    productId: String(it.productId || "").trim(),
                    quantity: Number(it.quantity),
                }))
                .filter((it) => it.productId);

            const payload = {
                items: normalizedItems,
                deliveryFee: String(deliveryFee || "0"),
            };

            payload.addressId = addressId;

            const data = await apiPost("/customer/orders", { token, body: payload });
            if (!data?.order) throw new ApiError("ORDER_CREATE_FAILED");

            await clear();
            navigation.navigate("Orders");
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Checkout</Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Delivery</Text>
                <Text style={styles.label}>Delivery fee</Text>
                <TextInput
                    value={deliveryFee}
                    onChangeText={setDeliveryFee}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    editable={!saving}
                />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Saved addresses</Text>
                    {addressesLoading ? <ActivityIndicator /> : null}
                    <FlatList
                        data={addresses}
                        keyExtractor={(a, idx) => String(a?.id || idx)}
                        renderItem={({ item }) => (
                            <View style={styles.pickRow}>
                                <AppButton
                                    title={addressId === item?.id ? "Selected" : "Select"}
                                    onPress={() => setAddressId(item?.id)}
                                    disabled={saving}
                                    compact
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.pickText}>{item?.label || "(no label)"}</Text>
                                    <Text style={styles.pickText}>{item?.line1 || ""}</Text>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View>
                                <Text style={styles.empty}>No saved addresses.</Text>
                                <AppButton
                                    title="Add an address"
                                    onPress={() => navigation.navigate("Addresses")}
                                    disabled={saving}
                                    compact
                                />
                            </View>
                        }
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items</Text>
                    {items.map((it, idx) => (
                        <Text key={String(idx)} style={styles.pickText}>
                            {String(it.name || "Item")} x {String(it.quantity)}
                        </Text>
                    ))}
                    {!items.length ? <Text style={styles.empty}>Cart is empty.</Text> : null}
                </View>

                <InlineError code={error} />

                {saving ? (
                    <ActivityIndicator />
                ) : (
                    <AppButton title="Place order" onPress={onPlaceOrder} disabled={!canPlaceOrder} />
                )}
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
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.text,
    },
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 14,
        gap: 10,
        flex: 1,
        backgroundColor: colors.card,
        ...shadows.card,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#f9fafb",
    },
    section: {
        gap: 8,
        paddingTop: 6,
    },
    pickRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        paddingVertical: 6,
    },
    pickText: {
        fontSize: 13,
        color: colors.text,
    },
    empty: {
        paddingVertical: 8,
        color: colors.muted,
    },
});
