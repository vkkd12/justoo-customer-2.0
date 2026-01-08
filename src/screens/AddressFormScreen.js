import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ApiError, apiPatch, apiPost } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import { colors, typography, spacing, radii, shadows } from "../theme";

export default function AddressFormScreen({ navigation, route }) {
    const { token } = useAuth();

    const mode = route?.params?.mode === "edit" ? "edit" : "create";
    const address = route?.params?.address || null;

    const [label, setLabel] = useState(String(address?.label || ""));
    const [line1, setLine1] = useState(String(address?.line1 || ""));
    const [line2, setLine2] = useState(String(address?.line2 || ""));

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const isEdit = mode === "edit";
    const title = isEdit ? "Edit Address" : "Add New Address";
    const subtitle = isEdit
        ? "Update your delivery location details"
        : "Enter a new delivery address";

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
                line2,
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
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Ionicons
                            name={isEdit ? "create-outline" : "add-circle-outline"}
                            size={32}
                            color={colors.primary}
                        />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Label <Text style={styles.optional}>(optional)</Text>
                        </Text>
                        <TextInput
                            value={label}
                            onChangeText={setLabel}
                            style={styles.input}
                            placeholder="e.g., Home, Office, Mom's place"
                            placeholderTextColor={colors.muted}
                            editable={!saving}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Address Line 1 <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            value={line1}
                            onChangeText={setLine1}
                            style={styles.input}
                            placeholder="Street address, building name"
                            placeholderTextColor={colors.muted}
                            editable={!saving}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            Address Line 2 <Text style={styles.optional}>(optional)</Text>
                        </Text>
                        <TextInput
                            value={line2}
                            onChangeText={setLine2}
                            style={styles.input}
                            placeholder="Apartment, suite, floor, etc."
                            placeholderTextColor={colors.muted}
                            editable={!saving}
                        />
                    </View>

                    <InlineError code={error} />

                    <AppButton
                        title={isEdit ? "Update Address" : "Save Address"}
                        onPress={onSave}
                        disabled={!canSave}
                        loading={saving}
                        fullWidth
                    />

                    <AppButton
                        title="Cancel"
                        onPress={() => navigation.goBack()}
                        variant="ghost"
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
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    header: {
        alignItems: "center",
        paddingVertical: spacing.xl,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: radii.full,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.largeTitle,
        color: colors.text,
        textAlign: "center",
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: "center",
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: spacing.xl,
        ...shadows.card,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        ...typography.callout,
        fontWeight: "600",
        color: colors.text,
        marginBottom: spacing.sm,
    },
    required: {
        color: colors.danger,
    },
    optional: {
        ...typography.caption,
        color: colors.muted,
        fontWeight: "400",
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
