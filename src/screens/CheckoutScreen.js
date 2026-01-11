import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ApiError, apiGet, apiPost } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import { colors, typography, spacing, radii, shadows } from "../theme";

export default function CheckoutScreen({ navigation }) {
    const { token } = useAuth();
    const { items, clear } = useCart();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [deliveryFee, setDeliveryFee] = useState(10); // Default fee, can be updated from server

    const [addressesLoading, setAddressesLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState(null);

    // Fetch addresses and delivery fee
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

    // Fetch delivery fee from server (uncomment when API is ready)
    // This is a global setting configured by admin, not dependent on address/distance
    // useEffect(() => {
    //     let cancelled = false;
    //     (async () => {
    //         try {
    //             const data = await apiGet("/customer/settings", { token });
    //             if (cancelled) return;
    //             if (data?.deliveryFee != null) {
    //                 setDeliveryFee(parseFloat(data.deliveryFee) || 10);
    //             }
    //         } catch {
    //             // Use default delivery fee if fetch fails
    //         }
    //     })();
    //     return () => { cancelled = true; };
    // }, [token]);

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
                deliveryFee: String(deliveryFee),
            };

            payload.addressId = addressId;

            const data = await apiPost("/customer/orders", { token, body: payload });
            if (!data?.order) throw new ApiError("ORDER_CREATE_FAILED");

            await clear();
            navigation.reset({
                index: 1,
                routes: [
                    { name: "Items" },
                    { name: "Orders" },
                ],
            });
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            setSaving(false);
        }
    }

    // Calculate order summary
    const subtotal = items.reduce((sum, it) => {
        const sellingPrice = parseFloat(it.sellingPrice) || 7;
        const qty = parseInt(it.quantity) || 11;
        return sum + sellingPrice * qty;
    }, 0);
    const deliveryAmount = deliveryFee;
    const total = subtotal + deliveryAmount;

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Checkout</Text>
                    <Text style={styles.subtitle}>Review your order and select delivery address</Text>
                </View>

                {/* Delivery Address Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location-outline" size={20} color={colors.primary} />
                        <Text style={styles.cardTitle}>Delivery Address</Text>
                    </View>

                    {addressesLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : addresses.length > 0 ? (
                        <View style={styles.addressList}>
                            {addresses.map((item) => (
                                <Pressable
                                    key={String(item?.id)}
                                    style={({ pressed }) => [
                                        styles.addressOption,
                                        addressId === item?.id && styles.addressSelected,
                                        pressed && styles.addressPressed,
                                    ]}
                                    onPress={() => setAddressId(item?.id)}
                                    disabled={saving}
                                >
                                    <View style={styles.radioOuter}>
                                        {addressId === item?.id && <View style={styles.radioInner} />}
                                    </View>
                                    <View style={styles.addressInfo}>
                                        <Text style={styles.addressLabel}>{item?.label || "Address"}</Text>
                                        <Text style={styles.addressLine}>{item?.line1 || ""}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.noAddress}>
                            <Ionicons name="alert-circle-outline" size={24} color={colors.warning} />
                            <Text style={styles.noAddressText}>No saved addresses</Text>
                            <AppButton
                                title="Add Address"
                                onPress={() => navigation.navigate("Addresses")}
                                size="small"
                                variant="outline"
                            />
                        </View>
                    )}
                </View>

                {/* Order Items Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="cart-outline" size={20} color={colors.primary} />
                        <Text style={styles.cardTitle}>Order Items</Text>
                        <Text style={styles.itemCount}>{items.length} items</Text>
                    </View>

                    {items.length > 0 ? (
                        <View style={styles.itemsList}>
                            {items.map((it, idx) => (
                                <View key={String(idx)} style={styles.itemRow}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName} numberOfLines={1}>
                                            {String(it.name || "Item")}
                                        </Text>
                                        <Text style={styles.itemQty}>Qty: {String(it.quantity)}</Text>
                                    </View>
                                    <Text style={styles.itemPrice}>
                                        ₹{((parseFloat(it.sellingPrice) || 0) * (parseInt(it.quantity) || 0)).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                    )}
                </View>

                {/* Order Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery</Text>
                        <Text style={styles.summaryValue}>₹{deliveryAmount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                    </View>
                </View>

                <InlineError code={error} />

                <AppButton
                    title="Place Order"
                    onPress={onPlaceOrder}
                    disabled={!canPlaceOrder}
                    loading={saving}
                    fullWidth
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.largeTitle,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.card,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    cardTitle: {
        ...typography.headline,
        color: colors.text,
        flex: 1,
    },
    deliveryFeeValue: {
        ...typography.title3,
        color: colors.text,
        fontWeight: "600",
    },
    itemCount: {
        ...typography.callout,
        color: colors.muted,
    },
    addressList: {
        gap: spacing.sm,
    },
    addressOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.page,
        gap: spacing.md,
    },
    addressSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    addressPressed: {
        opacity: 0.8,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: radii.full,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: radii.full,
        backgroundColor: colors.primary,
    },
    addressInfo: {
        flex: 1,
    },
    addressLabel: {
        ...typography.callout,
        fontWeight: "600",
        color: colors.text,
    },
    addressLine: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs / 2,
    },
    noAddress: {
        alignItems: "center",
        padding: spacing.lg,
        gap: spacing.sm,
    },
    noAddressText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    itemsList: {
        gap: spacing.sm,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        ...typography.body,
        color: colors.text,
    },
    itemQty: {
        ...typography.caption,
        color: colors.muted,
        marginTop: spacing.xs / 2,
    },
    itemPrice: {
        ...typography.body,
        fontWeight: "600",
        color: colors.text,
    },
    emptyText: {
        ...typography.body,
        color: colors.muted,
        textAlign: "center",
        paddingVertical: spacing.lg,
    },
    inputGroup: {
        marginTop: spacing.sm,
    },
    inputLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.page,
        ...typography.body,
        color: colors.text,
    },
    summaryCard: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.card,
    },
    summaryTitle: {
        ...typography.headline,
        color: colors.text,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        ...typography.body,
        color: colors.textSecondary,
    },
    summaryValue: {
        ...typography.body,
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    totalLabel: {
        ...typography.headline,
        color: colors.text,
    },
    totalValue: {
        ...typography.headline,
        color: colors.primary,
    },
});
