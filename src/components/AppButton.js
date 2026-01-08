import React from "react";
import { Pressable, StyleSheet, Text, ActivityIndicator } from "react-native";
import { colors, radii, shadows, spacing, typography } from "../theme";

export default function AppButton({
    title,
    onPress,
    disabled,
    loading,
    variant = "primary",
    size = "medium",
    fullWidth,
    icon,
}) {
    const isGhost = variant === "ghost";
    const isDanger = variant === "danger";
    const isOutline = variant === "outline";
    const isSmall = size === "small";
    const isLarge = size === "large";

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.base,
                isSmall && styles.small,
                isLarge && styles.large,
                isGhost && styles.ghost,
                isOutline && styles.outline,
                isDanger && styles.danger,
                fullWidth && styles.fullWidth,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={isGhost || isOutline ? colors.primary : "#fff"} />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.text,
                            isSmall && styles.textSmall,
                            isLarge && styles.textLarge,
                            (isGhost || isOutline) && styles.ghostText,
                            isDanger && styles.dangerText,
                            disabled && styles.disabledText,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
        ...shadows.sm,
    },
    small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.sm,
    },
    large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: radii.lg,
    },
    fullWidth: {
        width: "100%",
    },
    text: {
        color: "#fff",
        fontWeight: "600",
        fontSize: typography.callout.fontSize,
        letterSpacing: 0.2,
    },
    textSmall: {
        fontSize: typography.caption.fontSize,
    },
    textLarge: {
        fontSize: typography.body.fontSize,
        fontWeight: "700",
    },
    ghost: {
        backgroundColor: "transparent",
        shadowOpacity: 0,
        elevation: 0,
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    ghostText: {
        color: colors.text,
    },
    danger: {
        backgroundColor: colors.danger,
    },
    dangerText: {
        color: "#fff",
    },
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    disabled: {
        backgroundColor: colors.borderLight,
        shadowOpacity: 0,
        elevation: 0,
    },
    disabledText: {
        color: colors.muted,
    },
});
