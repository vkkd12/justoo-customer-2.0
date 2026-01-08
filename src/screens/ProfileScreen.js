import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ApiError, apiGet, apiPatch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import { colors, typography, spacing, radii, shadows } from "../theme";

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
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

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
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={48} color={colors.primary} />
                    </View>
                    <Text style={styles.phone}>{customer?.phone || ""}</Text>
                    <Text style={styles.memberLabel}>Customer Account</Text>
                </View>

                {/* Profile Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor={colors.muted}
                            editable={!saving}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.muted}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!saving}
                        />
                    </View>

                    <InlineError code={error} />

                    <AppButton
                        title="Save Changes"
                        onPress={onSave}
                        disabled={!canSave}
                        loading={saving}
                        fullWidth
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.actionsCard}>
                    <Text style={styles.cardTitle}>Quick Actions</Text>
                    <AppButton
                        title="Manage Addresses"
                        onPress={() => navigation.navigate("Addresses")}
                        variant="outline"
                        icon={<Ionicons name="location-outline" size={18} color={colors.primary} />}
                        fullWidth
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.page,
    },
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    avatarSection: {
        alignItems: "center",
        paddingVertical: spacing.xl,
    },
    avatarCircle: {
        width: 96,
        height: 96,
        borderRadius: radii.full,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    phone: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    memberLabel: {
        ...typography.callout,
        color: colors.muted,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.card,
    },
    actionsCard: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: spacing.lg,
        ...shadows.card,
    },
    cardTitle: {
        ...typography.headline,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.callout,
        fontWeight: "600",
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
});
