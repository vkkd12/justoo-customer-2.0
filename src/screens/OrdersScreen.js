import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ApiError, apiGet } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import InlineError from "../components/InlineError";
import OrderCard from "../components/OrderCard";
import { colors, typography, spacing, radii } from "../theme";

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
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Your Orders</Text>
                <Text style={styles.subtitle}>Track your recent purchases and deliveries</Text>
            </View>

            <InlineError code={error} />

            <FlatList
                data={orders}
                keyExtractor={(item, idx) => String(item?.id || idx)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <OrderCard order={item} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => load({ isRefresh: true })}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="receipt-outline" size={48} color={colors.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Orders Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your order history will appear here once you make a purchase
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.page,
    },
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    title: {
        ...typography.largeTitle,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxxl,
        gap: spacing.md,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: spacing.xxxl * 2,
        paddingHorizontal: spacing.xl,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: radii.full,
        backgroundColor: colors.card,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    emptySubtitle: {
        ...typography.body,
        color: colors.muted,
        textAlign: "center",
        lineHeight: 22,
    },
});
