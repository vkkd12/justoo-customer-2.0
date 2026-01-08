import React from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import { colors, radii, shadows, spacing, typography } from "../theme";

const STATUS_COLORS = {
    CREATED: { bg: colors.warningLight, text: colors.warning },
    PAID: { bg: colors.primaryLight, text: colors.primaryDark },
    CONFIRMED: { bg: colors.accentLight, text: colors.accent },
    DELIVERED: { bg: colors.successLight, text: colors.success },
    CANCELLED: { bg: colors.dangerLight, text: colors.danger },
    DEFAULT: { bg: colors.borderLight, text: colors.textSecondary },
};

function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
        return String(dateStr);
    }
}

export default function OrderCard({ order, onPress }) {
    const status = String(order?.status || "").toUpperCase();
    const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.DEFAULT;

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.header}>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {status.replace(/_/g, " ")}
                    </Text>
                </View>
                <Text style={styles.amount}>₹{String(order?.totalAmount ?? "0")}</Text>
            </View>
            <Text style={styles.date}>{formatDate(order?.createdAt)}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: spacing.md,
        gap: spacing.sm,
        ...shadows.sm,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm,
    },
    statusText: {
        fontSize: typography.micro.fontSize,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    amount: {
        fontSize: typography.headline.fontSize,
        fontWeight: "700",
        color: colors.text,
    },
    date: {
        fontSize: typography.caption.fontSize,
        color: colors.muted,
    },
});
