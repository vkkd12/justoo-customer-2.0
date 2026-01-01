import React, { useMemo, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from "react-native";

import { ApiError, apiPatch, apiPost } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import InlineError from "../components/InlineError";

export default function AddressFormScreen({ navigation, route }) {
    const { token } = useAuth();

    const mode = route?.params?.mode === "edit" ? "edit" : "create";
    const address = route?.params?.address || null;

    const [label, setLabel] = useState(String(address?.label || ""));
    const [line1, setLine1] = useState(String(address?.line1 || ""));
    const [line2, setLine2] = useState(String(address?.line2 || ""));

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const title = mode === "edit" ? "Edit Address" : "New Address";

    const canSave = useMemo(() => {
        if (saving) return false;
        if (!line1.trim()) return false;
        if (mode === "create") return true;

        const changedLabel = label.trim() !== String(address?.label || "");
        const changedLine1 = line1.trim() !== String(address?.line1 || "");
        const changedLine2 = line2 !== String(address?.line2 || "");
        return Boolean(changedLabel || changedLine1 || changedLine2);
    }, [saving, line1, mode, label, line2, address]);

    async function onSave() {
        setSaving(true);
        setError(null);
        try {
            const payload = {
                label: label.trim() ? label.trim() : undefined,
                line1: line1.trim(),
                line2, // allow empty string
            };

            if (mode === "create") {
                await apiPost("/customer/addresses", { token, body: payload });
            } else {
                const addressId = address?.id;
                if (!addressId) throw new ApiError("ADDRESS_ID_REQUIRED");
                await apiPatch(`/customer/addresses/${addressId}`, { token, body: payload });
            }

            navigation.goBack();
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Label</Text>
                <TextInput value={label} onChangeText={setLabel} style={styles.input} editable={!saving} />

                <Text style={styles.label}>Line 1 *</Text>
                <TextInput value={line1} onChangeText={setLine1} style={styles.input} editable={!saving} />

                <Text style={styles.label}>Line 2</Text>
                <TextInput value={line2} onChangeText={setLine2} style={styles.input} editable={!saving} />

                <InlineError code={error} />

                {saving ? (
                    <ActivityIndicator />
                ) : (
                    <Button title="Save" onPress={onSave} disabled={!canSave} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
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
});
