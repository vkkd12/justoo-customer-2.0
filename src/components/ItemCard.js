import React, { useMemo, useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

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

            <Text style={styles.name}>{item?.name || ""}</Text>
            {item?.description ? <Text style={styles.desc}>{item.description}</Text> : null}

            <View style={styles.row}>
                <Text style={styles.meta}>Price: {String(item?.sellingPrice ?? "")}</Text>
                <Text style={styles.meta}>Discount: {String(item?.discountPercent ?? "")}%</Text>
                <Text style={styles.meta}>Qty: {String(item?.quantity ?? "")}</Text>
            </View>

            {onAddToCart ? <Button title="Add to cart" onPress={() => onAddToCart(item)} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        gap: 6,
    },
    image: {
        width: "100%",
        height: 160,
        borderRadius: 10,
        backgroundColor: "#f2f2f2",
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
    },
    desc: {
        fontSize: 13,
        color: "#666",
    },
    row: {
        flexDirection: "row",
        gap: 12,
        flexWrap: "wrap",
    },
    meta: {
        fontSize: 13,
    },
});
