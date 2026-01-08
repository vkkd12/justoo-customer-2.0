import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { apiPost, ApiError } from "../api/http";
import AppButton from "../components/AppButton";
import { colors, shadows } from "../theme";

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
            <View style={styles.hero}>
                <Text style={styles.kicker}>Welcome back</Text>
                <Text style={styles.title}>Sign in to continue</Text>
                <Text style={styles.subtitle}>We’ll send a one-time code to your phone.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Phone number</Text>
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

                {loading ? <ActivityIndicator /> : <AppButton title="Send OTP" onPress={onSendOtp} disabled={!canSubmit} />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.page,
        justifyContent: "center",
    },
    hero: {
        marginBottom: 16,
        gap: 6,
    },
    kicker: {
        color: colors.accent,
        fontWeight: "700",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        fontSize: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: colors.text,
    },
    subtitle: {
        color: colors.muted,
        fontSize: 14,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 18,
        gap: 12,
        ...shadows.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#f9fafb",
        fontSize: 16,
    },
    error: {
        color: colors.danger,
        fontWeight: "600",
    },
});
