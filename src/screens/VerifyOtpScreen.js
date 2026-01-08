import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from "react-native";
import { apiPost, ApiError } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import { colors, radii, shadows, spacing, typography } from "../theme";

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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.content}>
                {/* Hero section */}
                <View style={styles.hero}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconEmoji}>🔐</Text>
                    </View>
                    <Text style={styles.title}>Verification code</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to{"\n"}
                        <Text style={styles.phoneHighlight}>{phone || "your phone"}</Text>
                    </Text>
                </View>

                {/* Form card */}
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>One-time code</Text>
                        <TextInput
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="Enter 6-digit code"
                            placeholderTextColor={colors.muted}
                            keyboardType="number-pad"
                            style={styles.input}
                            editable={!loading}
                            maxLength={6}
                            textAlign="center"
                        />
                    </View>

                    <InlineError code={error} />

                    <AppButton
                        title="Verify & Continue"
                        onPress={onVerify}
                        disabled={!canSubmit}
                        loading={loading}
                        size="large"
                        fullWidth
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    hero: {
        alignItems: "center",
        marginBottom: spacing.xxl,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.accentLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.lg,
    },
    iconEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: typography.largeTitle.fontSize,
        fontWeight: "800",
        color: colors.text,
        textAlign: "center",
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.body.fontSize,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },
    phoneHighlight: {
        fontWeight: "700",
        color: colors.text,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.xl,
        padding: spacing.xl,
        gap: spacing.lg,
        ...shadows.card,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    label: {
        fontSize: typography.callout.fontSize,
        fontWeight: "600",
        color: colors.text,
        textAlign: "center",
    },
    input: {
        backgroundColor: colors.page,
        borderRadius: radii.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        fontSize: 24,
        fontWeight: "700",
        color: colors.text,
        letterSpacing: 8,
    },
});
