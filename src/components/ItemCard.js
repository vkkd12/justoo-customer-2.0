import React, { useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import AppButton from "./AppButton";
import { colors, radii, shadows, spacing, typography } from "../theme";

const DEFAULT_IMAGE = require("../../assets/default-img.jpg");

export default function ItemCard({ item, onAddToCart }) {
    const [imageError, setImageError] = useState(false);
    const imgUrl = String(item?.imgUrl || "").trim();
    const showRemote = useMemo(() => Boolean(imgUrl) && !imageError, [imgUrl, imageError]);

    const hasDiscount = Number(item?.discountPercent) > 0;

    return (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image
                    source={showRemote ? { uri: imgUrl } : DEFAULT_IMAGE}
                    style={styles.image}
                    resizeMode="cover"
                    onError={() => setImageError(true)}
                />
                {hasDiscount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{String(item?.discountPercent)}% off</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>{item?.name || ""}</Text>
                {item?.description ? (
                    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                ) : null}

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{String(item?.sellingPrice ?? "")}</Text>
                    {Number(item?.quantity) > 0 ? (
                        <View style={styles.stockBadge}>
                            <Text style={styles.stockText}>In stock</Text>
                        </View>
                    ) : (
                        <View style={[styles.stockBadge, styles.outOfStock]}>
                            <Text style={[styles.stockText, styles.outOfStockText]}>Out of stock</Text>
                        </View>
                    )}
                </View>

                {onAddToCart && Number(item?.quantity) > 0 ? (
                    <AppButton
                        title="Add to cart"
                        onPress={() => onAddToCart(item)}
                        size="small"
                        fullWidth
                    />
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        overflow: "hidden",
        ...shadows.card,
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 160,
        backgroundColor: colors.borderLight,
    },
    discountBadge: {
        position: "absolute",
        top: spacing.sm,
        left: spacing.sm,
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm,
    },
    discountText: {
        color: "#fff",
        fontSize: typography.micro.fontSize,
        fontWeight: "700",
    },
    content: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    name: {
        fontSize: typography.headline.fontSize,
        fontWeight: "700",
        color: colors.text,
        lineHeight: typography.headline.lineHeight,
    },
    desc: {
        fontSize: typography.caption.fontSize,
        color: colors.textSecondary,
        lineHeight: typography.callout.lineHeight,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: spacing.xs,
    },
    price: {
        fontSize: typography.title.fontSize,
        fontWeight: "800",
        color: colors.text,
    },
    stockBadge: {
        backgroundColor: colors.successLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
    },
    stockText: {
        fontSize: typography.micro.fontSize,
        fontWeight: "600",
        color: colors.success,
    },
    outOfStock: {
        backgroundColor: colors.dangerLight,
    },
    outOfStockText: {
        color: colors.danger,
    },
});
