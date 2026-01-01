import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from "react-native";

import { ApiError, apiGet, apiPatch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import InlineError from "../components/InlineError";

export default function ProfileScreen({ navigation }) {
    const { token, customer, completeLogin } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [name, setName] = useState(customer?.name || "");
    const [email, setEmail] = useState(customer?.email || "");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiGet("/customer/me", { token });
                const fresh = data?.customer;
                if (!fresh) throw new ApiError("CUSTOMER_NOT_FOUND");

                if (cancelled) return;
                setName(fresh.name || "");
                setEmail(fresh.email || "");
                await completeLogin({ token, customer: fresh });
            } catch (e) {
                if (cancelled) return;
                setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token, completeLogin]);

    const canSave = useMemo(() => {
        if (loading || saving) return false;
        const nameTrim = name.trim();
        const emailTrim = email.trim();
        const changedName = nameTrim && nameTrim !== String(customer?.name || "");
        const changedEmail = emailTrim !== String(customer?.email || "");
        return Boolean(changedName || changedEmail);
    }, [loading, saving, name, email, customer]);

    async function onSave() {
        const nameTrim = name.trim();
        const emailTrim = email.trim();

        setSaving(true);
        setError(null);
        try {
            const payload = {};
            if (nameTrim && nameTrim !== String(customer?.name || "")) payload.name = nameTrim;
            if (emailTrim !== String(customer?.email || "")) payload.email = emailTrim;

            const data = await apiPatch("/customer/me", { token, body: payload });
            const updated = data?.customer;
            if (!updated) throw new ApiError("REQUEST_FAILED");

            setName(updated.name || "");
            setEmail(updated.email || "");
            await completeLogin({ token, customer: updated });
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Phone (read-only)</Text>
                <Text style={styles.readOnly}>{customer?.phone || ""}</Text>

                <Text style={styles.label}>Name</Text>
                <TextInput value={name} onChangeText={setName} style={styles.input} editable={!saving} />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!saving}
                />

                <InlineError code={error} />

                {saving ? (
                    <ActivityIndicator />
                ) : (
                    <Button title="Save" onPress={onSave} disabled={!canSave} />
                )}

                <Button title="Addresses" onPress={() => navigation.navigate("Addresses")} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
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
    readOnly: {
        fontSize: 14,
        paddingVertical: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
});
