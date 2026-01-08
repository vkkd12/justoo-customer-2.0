import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { ApiError, apiGet } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import InlineError from "../components/InlineError";
import OrderCard from "../components/OrderCard";
import { colors } from "../theme";

export default function OrdersScreen({ navigation }) {
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);

    async function load({ isRefresh } = {}) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);
        try {
            const data = await apiGet("/customer/orders", { token });
            setOrders(Array.isArray(data?.orders) ? data.orders : []);
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            if (isRefresh) setRefreshing(false);
            else setLoading(false);
        }
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            load();
        });
        return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your orders</Text>
            <Text style={styles.subtitle}>Track your recent purchases and deliveries.</Text>

            <InlineError code={error} />

            <FlatList
                data={orders}
                keyExtractor={(item, idx) => String(item?.id || idx)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <OrderCard order={item} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ isRefresh: true })} />}
                ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
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
        gap: 10,
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
    list: {
        gap: 10,
        paddingBottom: 20,
    },
    empty: {
        paddingVertical: 10,
        color: colors.muted,
    },
});
