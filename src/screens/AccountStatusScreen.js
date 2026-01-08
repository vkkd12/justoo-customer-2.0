import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ApiError, apiGet } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import InlineError from "../components/InlineError";
import { colors, typography, spacing, radii, shadows } from "../theme";

export default function AccountStatusScreen() {
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiGet("/customer/me/status", { token });
                if (cancelled) return;
                setData(res || null);
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
    }, [token]);

    const isActive = data?.status === "ACTIVE" || data?.status === "active";
    const isWhitelisted = data?.isWhitelisted === true;

    function formatDate(dateStr) {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
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
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
                </View>
                <Text style={styles.title}>Account Status</Text>
                <Text style={styles.subtitle}>View your account details and status</Text>
            </View>

            <InlineError code={error} />

            {/* Status Card */}
            <View style={styles.card}>
                <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
                        <Ionicons
                            name={isActive ? "checkmark-circle" : "close-circle"}
                            size={18}
                            color={isActive ? colors.success : colors.danger}
                        />
                        <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
                            {isActive ? "Active" : "Inactive"}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="star-outline" size={20} color={colors.muted} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Whitelisted</Text>
                            <Text style={styles.infoValue}>{isWhitelisted ? "Yes" : "No"}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={20} color={colors.muted} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Member Since</Text>
                            <Text style={styles.infoValue}>{formatDate(data?.customer?.createdAt)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.page,
    },
    container: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: colors.page,
    },
    header: {
        alignItems: "center",
        paddingVertical: spacing.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: radii.full,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.largeTitle,
        color: colors.text,
        marginBottom: spacing.xs,
        textAlign: "center",
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
    statusRow: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radii.full,
    },
    activeBadge: {
        backgroundColor: colors.successLight,
    },
    inactiveBadge: {
        backgroundColor: colors.dangerLight,
    },
    statusText: {
        ...typography.headline,
        fontWeight: "600",
    },
    activeText: {
        color: colors.success,
    },
    inactiveText: {
        color: colors.danger,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.lg,
    },
    infoRow: {
        marginBottom: spacing.lg,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        ...typography.caption,
        color: colors.muted,
        marginBottom: spacing.xs / 2,
    },
    infoValue: {
        ...typography.body,
        color: colors.text,
        fontWeight: "500",
    },
});
