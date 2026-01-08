import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii, shadows } from "../theme";

export default function AddressCard({ address, onEdit, onDelete, onSelect, selected }) {
    const isSelectable = typeof onSelect === "function";

    const content = (
        <>
            {/* Header with label and icon */}
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Ionicons name="location" size={18} color={colors.primary} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.label} numberOfLines={1}>
                        {address?.label || "Address"}
                    </Text>
                    {selected && (
                        <View style={styles.selectedBadge}>
                            <Text style={styles.selectedText}>Selected</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Address lines */}
            <View style={styles.addressContent}>
                <Text style={styles.line} numberOfLines={2}>
                    {address?.line1 || ""}
                </Text>
                {address?.line2 ? (
                    <Text style={styles.lineSecondary} numberOfLines={1}>
                        {address.line2}
                    </Text>
                ) : null}
            </View>

            {/* Actions */}
            {(onEdit || onDelete) && (
                <View style={styles.actions}>
                    {onEdit && (
                        <Pressable
                            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
                            onPress={onEdit}
                        >
                            <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                            <Text style={styles.actionText}>Edit</Text>
                        </Pressable>
                    )}
                    {onDelete && (
                        <Pressable
                            style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.actionPressed]}
                            onPress={onDelete}
                        >
                            <Ionicons name="trash-outline" size={16} color={colors.danger} />
                            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                        </Pressable>
                    )}
                </View>
            )}
        </>
    );

    if (isSelectable) {
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    selected && styles.cardSelected,
                    pressed && styles.cardPressed,
                ]}
                onPress={onSelect}
            >
                {content}
            </Pressable>
        );
    }

    return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    cardSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: colors.primaryLight,
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: radii.full,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },
    headerText: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    label: {
        ...typography.headline,
        color: colors.text,
        flex: 1,
    },
    selectedBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: radii.sm,
    },
    selectedText: {
        ...typography.micro,
        color: "#fff",
        fontWeight: "600",
    },
    addressContent: {
        marginBottom: spacing.md,
    },
    line: {
        ...typography.body,
        color: colors.text,
        lineHeight: 22,
    },
    lineSecondary: {
        ...typography.callout,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    actions: {
        flexDirection: "row",
        gap: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.sm,
        backgroundColor: colors.page,
    },
    deleteButton: {
        backgroundColor: colors.dangerLight,
    },
    actionPressed: {
        opacity: 0.7,
    },
    actionText: {
        ...typography.callout,
        color: colors.primary,
        fontWeight: "600",
    },
    deleteText: {
        color: colors.danger,
    },
});
