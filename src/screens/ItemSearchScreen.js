import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { ApiError, apiGet } from "../api/http";
import { useCart } from "../cart/CartContext";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import ItemCard from "../components/ItemCard";
import { colors, shadows } from "../theme";

export default function ItemSearchScreen({ route }) {
    const { addItem } = useCart();
    const initialQ = String(route?.params?.q || "");

    const [q, setQ] = useState(initialQ);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    const effectiveQ = useMemo(() => q.trim(), [q]);

    async function load({ isRefresh } = {}) {
        if (!effectiveQ) {
            setLoading(false);
            setItems([]);
            setError("QUERY_REQUIRED");
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);
        try {
            const data = await apiGet("/customer/items/search", { query: { q: effectiveQ } });
            setItems(Array.isArray(data?.items) ? data.items : []);
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            if (isRefresh) setRefreshing(false);
            else setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Re-run search when q changes (simple + minimal debounce-free behavior)
        const t = setTimeout(() => {
            load();
        }, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveQ]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search</Text>
            <Text style={styles.subtitle}>Find exactly what you need.</Text>

            <View style={styles.searchRow}>
                <TextInput
                    value={q}
                    onChangeText={setQ}
                    placeholder="Search items"
                    style={styles.searchInput}
                    autoCapitalize="none"
                />
                <AppButton title="Go" onPress={() => load()} disabled={!effectiveQ} compact />
            </View>

            <InlineError code={error} />

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item, idx) => String(item?.id || idx)}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => <ItemCard item={item} onAddToCart={(it) => addItem(it, 1)} />}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ isRefresh: true })} />}
                    ListEmptyComponent={<Text style={styles.empty}>No results.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        gap: 12,
        backgroundColor: colors.page,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.text,
    },
    subtitle: {
        color: colors.muted,
    },
    searchRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#f9fafb",
        ...shadows.card,
    },
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 30,
    },
    list: {
        gap: 10,
        paddingBottom: 20,
    },
    empty: {
        paddingVertical: 10,
        color: colors.muted,
    },
});
