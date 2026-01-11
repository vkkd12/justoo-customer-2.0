import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
    Pressable,
} from "react-native";

import { ApiError, apiGet } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import ItemCard from "../components/ItemCard";
import { colors, radii, shadows, spacing, typography } from "../theme";

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
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>What are you looking for?</Text>
                    </View>
                    <Pressable
                        style={styles.cartBadge}
                        onPress={() => navigation.navigate("Cart")}
                    >
                        <Text style={styles.cartCount}>{totalCount}</Text>
                        <Text style={styles.cartLabel}>Cart</Text>
                    </Pressable>
                </View>

                {/* Search */}
                <View style={styles.searchRow}>
                    <TextInput
                        value={q}
                        onChangeText={setQ}
                        placeholder="Search products..."
                        placeholderTextColor={colors.muted}
                        style={styles.searchInput}
                        autoCapitalize="none"
                        returnKeyType="search"
                        onSubmitEditing={hasSearch ? onSearch : undefined}
                    />
                    <AppButton
                        title="Go"
                        onPress={onSearch}
                        disabled={!hasSearch}
                    // size="small"
                    />
                </View>
            </View>

            {/* Quick actions */}
            <View style={styles.quickActions}>
                <Pressable style={styles.actionChip} onPress={() => navigation.navigate("Profile")}>
                    <Text style={styles.actionChipText}>Profile</Text>
                </Pressable>
                <Pressable style={styles.actionChip} onPress={() => navigation.navigate("Orders")}>
                    <Text style={styles.actionChipText}>My Orders</Text>
                </Pressable>
                <Pressable style={styles.actionChip} onPress={() => navigation.navigate("AccountStatus")}>
                    <Text style={styles.actionChipText}>Account</Text>
                </Pressable>
                <Pressable style={[styles.actionChip, styles.logoutChip]} onPress={logout}>
                    <Text style={[styles.actionChipText, styles.logoutText]}>Logout</Text>
                </Pressable>
            </View>

            <InlineError code={error} />

            {/* Product list */}
            <FlatList
                data={items}
                keyExtractor={(item, idx) => String(item?.id || idx)}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => <ItemCard item={item} onAddToCart={(it) => addItem(it, 1)} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadItems({ isRefresh: true })}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No items available</Text>
                        <Text style={styles.emptySubtext}>Pull to refresh or check back later</Text>
                    </View>
                }
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
        backgroundColor: colors.card,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomLeftRadius: radii.xl,
        borderBottomRightRadius: radii.xl,
        ...shadows.card,
        gap: spacing.md,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    greeting: {
        fontSize: typography.caption.fontSize,
        color: colors.muted,
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.title.fontSize,
        fontWeight: "700",
        color: colors.text,
        lineHeight: typography.title.lineHeight,
    },
    cartBadge: {
        backgroundColor: colors.primaryLight,
        borderRadius: radii.lg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignItems: "center",
        minWidth: 60,
    },
    cartCount: {
        fontSize: typography.title.fontSize,
        fontWeight: "800",
        color: colors.primaryDark,
    },
    cartLabel: {
        fontSize: typography.micro.fontSize,
        color: colors.primaryDark,
        fontWeight: "600",
    },
    searchRow: {
        flexDirection: "row",
        gap: spacing.sm,
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.page,
        borderRadius: radii.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: typography.body.fontSize,
        color: colors.text,
    },
    quickActions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    actionChip: {
        backgroundColor: colors.card,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionChipText: {
        fontSize: typography.caption.fontSize,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    logoutChip: {
        backgroundColor: colors.dangerLight,
        borderColor: colors.dangerLight,
    },
    logoutText: {
        color: colors.danger,
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
        gap: spacing.md,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: spacing.xxxl,
    },
    emptyText: {
        fontSize: typography.headline.fontSize,
        fontWeight: "600",
        color: colors.text,
        marginBottom: spacing.xs,
    },
    emptySubtext: {
        fontSize: typography.body.fontSize,
        color: colors.muted,
    },
});
