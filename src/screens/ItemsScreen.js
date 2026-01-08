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
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import ItemCard from "../components/ItemCard";
import { colors, shadows } from "../theme";

export default function ItemsScreen({ navigation }) {
    const { logout } = useAuth();
    const { addItem, totalCount } = useCart();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    const [q, setQ] = useState("");

    const hasSearch = useMemo(() => q.trim().length > 0, [q]);

    async function loadItems({ isRefresh } = {}) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);
        try {
            const data = await apiGet("/customer/items");
            setItems(Array.isArray(data?.items) ? data.items : []);
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            if (isRefresh) setRefreshing(false);
            else setLoading(false);
        }
    }

    useEffect(() => {
        loadItems();
    }, []);

    function onSearch() {
        const query = q.trim();
        navigation.navigate("ItemSearch", { q: query });
    }

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.heroRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.kicker}>Discover</Text>
                    <Text style={styles.title}>Shop fresh items</Text>
                    <Text style={styles.subtitle}>Browse, search, and add to your cart in a tap.</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{totalCount}</Text>
                    <Text style={styles.badgeLabel}>Cart</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <AppButton title="Profile" onPress={() => navigation.navigate("Profile")} variant="ghost" compact />
                <AppButton
                    title="Account"
                    onPress={() => navigation.navigate("AccountStatus")}
                    variant="ghost"
                    compact
                />
                <AppButton title="Cart" onPress={() => navigation.navigate("Cart")} compact />
                <AppButton title="Orders" onPress={() => navigation.navigate("Orders")} variant="ghost" compact />
                <AppButton title="Logout" onPress={logout} variant="danger" compact />
            </View>

            <View style={styles.searchCard}>
                <Text style={styles.searchLabel}>Search the catalog</Text>
                <View style={styles.searchRow}>
                    <TextInput
                        value={q}
                        onChangeText={setQ}
                        placeholder="Search items"
                        style={styles.searchInput}
                        autoCapitalize="none"
                    />
                    <AppButton title="Search" onPress={onSearch} disabled={!hasSearch} compact />
                </View>
            </View>

            <InlineError code={error} />

            <FlatList
                data={items}
                keyExtractor={(item, idx) => String(item?.id || idx)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <ItemCard item={item} onAddToCart={(it) => addItem(it, 1)} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadItems({ isRefresh: true })} />}
                ListEmptyComponent={<Text style={styles.empty}>No items found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        flex: 1,
        padding: 16,
        gap: 14,
        backgroundColor: colors.page,
    },
    heroRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    kicker: {
        color: colors.accent,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        fontSize: 12,
        marginBottom: 2,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.text,
    },
    subtitle: {
        color: colors.muted,
        marginTop: 4,
    },
    badge: {
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
        minWidth: 70,
        ...shadows.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    badgeText: {
        fontSize: 22,
        fontWeight: "800",
        color: colors.primary,
    },
    badgeLabel: {
        color: colors.muted,
        fontSize: 12,
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap",
    },
    searchCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        gap: 8,
        ...shadows.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchLabel: {
        fontWeight: "700",
        color: colors.text,
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
