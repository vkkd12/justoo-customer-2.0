import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { apiPost, ApiError } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import AppButton from "../components/AppButton";
import { colors, shadows } from "../theme";

export default function VerifyOtpScreen({ route }) {
    const { completeLogin } = useAuth();

    const phone = String(route?.params?.phone || "").trim();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const canSubmit = useMemo(() => phone && otp.trim().length > 0 && !loading, [phone, otp, loading]);

    async function onVerify() {
        const normalizedOtp = otp.trim();
        if (!phone || !normalizedOtp) {
            setError("PHONE_AND_OTP_REQUIRED");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await apiPost("/customer/auth/verify-otp", {
                body: { phone, otp: normalizedOtp },
            });

            if (!data?.token || !data?.customer) {
                setError("TOKEN_CREATE_FAILED");
                return;
            }

            await completeLogin({ token: data.token, customer: data.customer });
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
                <Text style={styles.kicker}>Two-step sign in</Text>
                <Text style={styles.title}>Enter your verification code</Text>
                <Text style={styles.subtitle}>Sent to {phone || "your phone"}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>One-time code</Text>
                <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    style={styles.input}
                    editable={!loading}
                />

                {error ? <Text style={styles.error}>Error: {error}</Text> : null}

                {loading ? <ActivityIndicator /> : <AppButton title="Verify" onPress={onVerify} disabled={!canSubmit} />}
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
        fontSize: 26,
        fontWeight: "700",
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.muted,
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
