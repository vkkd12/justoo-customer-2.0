import React, { useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import AppButton from "./AppButton";
import { colors, shadows } from "../theme";

const DEFAULT_IMAGE = require("../../assets/default-img.jpg");

export default function ItemCard({ item, onAddToCart }) {
    const [imageError, setImageError] = useState(false);
    const imgUrl = String(item?.imgUrl || "").trim();
    const showRemote = useMemo(() => Boolean(imgUrl) && !imageError, [imgUrl, imageError]);

    return (
        <View style={styles.card}>
            <Image
                source={showRemote ? { uri: imgUrl } : DEFAULT_IMAGE}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImageError(true)}
            />

            <View style={styles.headerRow}>
                <Text style={styles.name}>{item?.name || ""}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{String(item?.discountPercent ?? 0)}% off</Text>
                </View>
            </View>

            {item?.description ? <Text style={styles.desc}>{item.description}</Text> : null}

            <View style={styles.metaRow}>
                <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Price</Text>
                    <Text style={styles.pillValue}>{String(item?.sellingPrice ?? "")}</Text>
                </View>
                <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Stock</Text>
                    <Text style={styles.pillValue}>{String(item?.quantity ?? "")}</Text>
                </View>
            </View>

            {onAddToCart ? <AppButton title="Add to cart" onPress={() => onAddToCart(item)} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 14,
        gap: 10,
        backgroundColor: colors.card,
        ...shadows.card,
    },
    image: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        backgroundColor: "#f2f4f7",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    name: {
        fontSize: 17,
        fontWeight: "800",
        color: colors.text,
    },
    desc: {
        fontSize: 13,
        color: colors.muted,
    },
    metaRow: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap",
    },
    pill: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: "#f1f5f9",
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 90,
    },
    pillLabel: {
        fontSize: 11,
        color: colors.muted,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontWeight: "700",
    },
    pillValue: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
    },
    badge: {
        backgroundColor: "#e0f2fe",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    badgeText: {
        color: colors.accent,
        fontWeight: "700",
    },
});
