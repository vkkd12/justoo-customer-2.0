import React, { useMemo, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { apiPost, ApiError } from "../api/http";

export default function LoginPhoneScreen({ navigation }) {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const canSubmit = useMemo(() => phone.trim().length > 0 && !loading, [phone, loading]);

    async function onSendOtp() {
        const normalized = phone.trim();
        if (!normalized) {
            setError("PHONE_REQUIRED");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await apiPost("/customer/auth/send-otp", { body: { phone: normalized } });
            navigation.navigate("VerifyOtp", { phone: normalized });
        } catch (e) {
            if (e instanceof ApiError) setError(e.code);
            else setError("NETWORK_ERROR");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.label}>Phone</Text>
            <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 9876543210"
                autoCapitalize="none"
                keyboardType="phone-pad"
                style={styles.input}
                editable={!loading}
            />

            {error ? <Text style={styles.error}>Error: {error}</Text> : null}

            {loading ? (
                <ActivityIndicator />
            ) : (
                <Button title="Send OTP" onPress={onSendOtp} disabled={!canSubmit} />
            )}
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
        marginBottom: 12,
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
    error: {
        color: "#b00020",
    },
});
