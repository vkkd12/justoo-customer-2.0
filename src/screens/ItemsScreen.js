import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Button,
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
import InlineError from "../components/InlineError";
import ItemCard from "../components/ItemCard";

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
            <Text style={styles.title}>Items</Text>

            <View style={styles.actions}>
                <Button title="Profile" onPress={() => navigation.navigate("Profile")} />
                <Button title="Account Status" onPress={() => navigation.navigate("AccountStatus")} />
                <Button title={`Cart (${totalCount})`} onPress={() => navigation.navigate("Cart")} />
                <Button title="Orders" onPress={() => navigation.navigate("Orders")} />
                <Button title="Logout" onPress={logout} />
            </View>

            <View style={styles.searchRow}>
                <TextInput
                    value={q}
                    onChangeText={setQ}
                    placeholder="Search items"
                    style={styles.searchInput}
                    autoCapitalize="none"
                />
                <Button title="Search" onPress={onSearch} disabled={!hasSearch} />
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
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    searchRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    list: {
        gap: 10,
        paddingBottom: 20,
    },
    empty: {
        paddingVertical: 10,
        color: "#666",
    },
});
