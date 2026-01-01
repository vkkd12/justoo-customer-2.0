import React from "react";
import { StyleSheet, Text } from "react-native";

export default function InlineError({ code }) {
    if (!code) return null;
    return <Text style={styles.error}>Error: {String(code)}</Text>;
}

const styles = StyleSheet.create({
    error: {
        color: "#b00020",
    },
});
