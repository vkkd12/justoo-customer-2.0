import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from "react-native";
import { apiPost, ApiError } from "../api/http";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import { colors, radii, shadows, spacing, typography } from "../theme";

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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 50}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* Hero section */}
                        <View style={styles.hero}>
                            <View style={styles.iconCircle}>
                                <Text style={styles.iconEmoji}>📱</Text>
                            </View>
                            <Text style={styles.title}>Welcome back</Text>
                            <Text style={styles.subtitle}>
                                Enter your phone number and we'll send you a verification code
                            </Text>
                        </View>

                        {/* Form card */}
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone number</Text>
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor={colors.muted}
                                    autoCapitalize="none"
                                    keyboardType="phone-pad"
                                    style={styles.input}
                                    editable={!loading}
                                />
                            </View>

                            <InlineError code={error} />

                            <AppButton
                                title="Continue"
                                onPress={onSendOtp}
                                disabled={!canSubmit}
                                loading={loading}
                                size="large"
                                fullWidth
                            />
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
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
        backgroundColor: colors.primaryLight,
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
        lineHeight: typography.body.lineHeight,
        paddingHorizontal: spacing.lg,
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
    },
    input: {
        backgroundColor: colors.page,
        borderRadius: radii.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: typography.body.fontSize,
        color: colors.text,
    },
});
