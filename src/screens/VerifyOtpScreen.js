import React, { useMemo, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { apiPost, ApiError } from "../api/http";
import { useAuth } from "../auth/AuthContext";

export default function VerifyOtpScreen({ route }) {
    const { completeLogin } = useAuth();

    const phone = String(route?.params?.phone || "").trim();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const canSubmit = useMemo(() => phone && otp.trim().length > 0 && !loading, [phone, otp, loading]);

    async function onVerify() {
        if (!phone) {
            setError("PHONE_REQUIRED");
            return;
        }

        const normalizedOtp = otp.trim();
        if (!normalizedOtp) {
            setError("OTP_REQUIRED");
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
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Sent to: {phone || "(missing phone)"}</Text>

            <Text style={styles.label}>OTP</Text>
            <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="6-digit OTP"
                keyboardType="number-pad"
                style={styles.input}
                editable={!loading}
            />

            {error ? <Text style={styles.error}>Error: {error}</Text> : null}

            {loading ? <ActivityIndicator /> : <Button title="Verify" onPress={onVerify} disabled={!canSubmit} />}
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
    subtitle: {
        fontSize: 14,
        color: "#666",
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
