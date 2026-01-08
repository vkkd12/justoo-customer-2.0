import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../theme";

export default function InlineError({ code }) {
    if (!code) return null;
    return (
        <View style={styles.container}>
            <Text style={styles.error}>{String(code).replace(/_/g, " ")}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.dangerLight,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.sm,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
    },
    error: {
        color: colors.danger,
        fontSize: typography.caption.fontSize,
        fontWeight: "600",
    },
});
