import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { ApiError, apiGet, apiPost } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import InlineError from "../components/InlineError";
import OrderItemRow from "../components/OrderItemRow";

export default function CreateOrderScreen({ navigation }) {
    const { token } = useAuth();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [deliveryFee, setDeliveryFee] = useState("0");

    const [addressMode, setAddressMode] = useState("saved"); // saved | manual
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState(null);

    const [manualLabel, setManualLabel] = useState("");
    const [manualLine1, setManualLine1] = useState("");
    const [manualLine2, setManualLine2] = useState("");

    const [items, setItems] = useState([{ productId: "", quantity: "1" }]);

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
                // Address picking is optional; create order supports manual address.
            } finally {
                if (!cancelled) setAddressesLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const canSubmit = useMemo(() => {
        if (saving) return false;

        const normalizedItems = items
            .map((it) => ({ productId: String(it.productId || "").trim(), quantity: Number(it.quantity) }))
            .filter((it) => it.productId);

        if (!normalizedItems.length) return false;
        if (normalizedItems.some((it) => !Number.isFinite(it.quantity) || it.quantity <= 0)) return false;

        if (addressMode === "saved") return Boolean(addressId);
        return Boolean(manualLine1.trim());
    }, [saving, items, addressMode, addressId, manualLine1]);

    function updateItem(index, next) {
        setItems((prev) => prev.map((it, idx) => (idx === index ? next : it)));
    }

    function addItem() {
        setItems((prev) => [...prev, { productId: "", quantity: "1" }]);
    }

    function removeItem(index) {
        setItems((prev) => prev.filter((_, idx) => idx !== index));
    }

    async function onSubmit() {
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

            if (addressMode === "saved") {
                payload.addressId = addressId;
            } else {
                payload.address = {
                    label: manualLabel.trim() ? manualLabel.trim() : undefined,
                    line1: manualLine1.trim(),
                    line2: manualLine2.trim() ? manualLine2.trim() : undefined,
                };
            }

            const data = await apiPost("/customer/orders", { token, body: payload });
            if (!data?.order) throw new ApiError("ORDER_CREATE_FAILED");

            navigation.goBack();
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Order</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Delivery fee</Text>
                <TextInput
                    value={deliveryFee}
                    onChangeText={setDeliveryFee}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    editable={!saving}
                />

                <View style={styles.modeRow}>
                    <Button title="Use saved address" onPress={() => setAddressMode("saved")} disabled={saving} />
                    <Button title="Enter address" onPress={() => setAddressMode("manual")} disabled={saving} />
                </View>

                {addressMode === "saved" ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Saved addresses</Text>
                        {addressesLoading ? <ActivityIndicator /> : null}
                        <FlatList
                            data={addresses}
                            keyExtractor={(a, idx) => String(a?.id || idx)}
                            renderItem={({ item }) => (
                                <View style={styles.pickRow}>
                                    <Button
                                        title={addressId === item?.id ? "Selected" : "Select"}
                                        onPress={() => setAddressId(item?.id)}
                                        disabled={saving}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.pickText}>{item?.label || "(no label)"}</Text>
                                        <Text style={styles.pickText}>{item?.line1 || ""}</Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={styles.empty}>No saved addresses.</Text>}
                        />
                    </View>
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Address</Text>
                        <Text style={styles.label}>Label</Text>
                        <TextInput value={manualLabel} onChangeText={setManualLabel} style={styles.input} editable={!saving} />
                        <Text style={styles.label}>Line 1 *</Text>
                        <TextInput value={manualLine1} onChangeText={setManualLine1} style={styles.input} editable={!saving} />
                        <Text style={styles.label}>Line 2</Text>
                        <TextInput value={manualLine2} onChangeText={setManualLine2} style={styles.input} editable={!saving} />
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items</Text>
                    {items.map((it, idx) => (
                        <OrderItemRow
                            key={idx}
                            value={it}
                            onChange={(next) => updateItem(idx, next)}
                            onRemove={() => removeItem(idx)}
                            removable={items.length > 1}
                            disabled={saving}
                        />
                    ))}
                    <Button title="Add item" onPress={addItem} disabled={saving} />
                </View>

                <InlineError code={error} />

                {saving ? (
                    <ActivityIndicator />
                ) : (
                    <Button title="Place order" onPress={onSubmit} disabled={!canSubmit} />
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
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
    },
    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        gap: 10,
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    modeRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    section: {
        gap: 8,
        paddingTop: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    pickRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        paddingVertical: 6,
    },
    pickText: {
        fontSize: 13,
    },
    empty: {
        paddingVertical: 8,
        color: "#666",
    },
});
