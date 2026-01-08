import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, shadows } from "../theme";

export default function AppButton({ title, onPress, disabled, variant = "primary", compact }) {
    const isPrimary = variant === "primary";
    const isGhost = variant === "ghost";
    const isDanger = variant === "danger";

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.base,
                compact && styles.compact,
                isGhost && styles.ghost,
                isDanger && styles.danger,
                pressed && styles.pressed,
                disabled && styles.disabled,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    isGhost && styles.ghostText,
                    isDanger && styles.dangerText,
                    disabled && styles.disabledText,
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        ...shadows.card,
    },
    compact: {
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    text: {
        color: "#fff",
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    ghost: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
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
        transform: [{ scale: 0.99 }],
        opacity: 0.9,
    },
    disabled: {
        backgroundColor: "#d1d5db",
        shadowOpacity: 0,
    },
    disabledText: {
        color: "#f9fafb",
    },
});
