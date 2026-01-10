import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ApiError } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import InlineError from "../components/InlineError";
import ItemCard from "../components/ItemCard";
import { useCart } from "../cart/CartContext";
import { colors, typography, spacing, radii, shadows } from "../theme";

const SORTS = [
    { key: "newest", label: "Newest" },
    { key: "price_asc", label: "Price ↑" },
    { key: "price_desc", label: "Price ↓" },
    { key: "discount_desc", label: "Best Deals" },
    { key: "name_asc", label: "A–Z" },
];

function formatCategoryLabel(category) {
    const raw = String(category || "").trim();
    if (!raw) return "Category";
    const words = raw
        .replace(/[-_]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    return words.join(" ");
}

function SortChip({ label, active, onPress }) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
            ]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </Pressable>
    );
}

export default function CategoryItemsScreen({ route, navigation }) {
    const category = String(route?.params?.category || "");
    const title = useMemo(() => formatCategoryLabel(category), [category]);

    const { authedGet } = useAuth();
    const { addItem } = useCart();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    const [sort, setSort] = useState("newest");
    const [inStockOnly, setInStockOnly] = useState(false);

    const query = useMemo(
        () => ({
            sort,
            inStock: inStockOnly ? "true" : undefined,
            isActive: "true",
        }),
        [sort, inStockOnly]
    );

    async function load({ isRefresh } = {}) {
        if (!category) {
            setError("INVALID_PRODUCT_CATEGORY");
            setItems([]);
            setLoading(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);
        try {
            const data = await authedGet(`/customer/categories/${encodeURIComponent(category)}/items`, { query });
            setItems(Array.isArray(data?.items) ? data.items : []);
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        } finally {
            if (isRefresh) setRefreshing(false);
            else setLoading(false);
        }
    }

    useEffect(() => {
        navigation.setOptions({ title });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title]);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, sort, inStockOnly]);

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
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>Browse items in this category</Text>

                {/* Filters */}
                <View style={styles.filterRow}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.toggle,
                            inStockOnly && styles.toggleActive,
                            pressed && styles.togglePressed,
                        ]}
                        onPress={() => setInStockOnly((v) => !v)}
                    >
                        <Ionicons
                            name={inStockOnly ? "checkmark-circle" : "ellipse-outline"}
                            size={18}
                            color={inStockOnly ? colors.success : colors.muted}
                        />
                        <Text style={[styles.toggleText, inStockOnly && styles.toggleTextActive]}>
                            In stock
                        </Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.searchBtn, pressed && styles.togglePressed]}
                        onPress={() => navigation.navigate("ItemSearch", { q: "" })}
                    >
                        <Ionicons name="search-outline" size={18} color={colors.primary} />
                        <Text style={styles.searchText}>Search</Text>
                    </Pressable>
                </View>

                <FlatList
                    data={SORTS}
                    keyExtractor={(s) => s.key}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sortRow}
                    renderItem={({ item }) => (
                        <SortChip
                            label={item.label}
                            active={sort === item.key}
                            onPress={() => setSort(item.key)}
                        />
                    )}
                />
            </View>

            <InlineError code={error} />

            <FlatList
                data={items}
                keyExtractor={(item, idx) => String(item?.id || idx)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => <ItemCard item={item} onAddToCart={(it) => addItem(it, 1)} />}
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
                            <Ionicons name="cube-outline" size={48} color={colors.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Items Found</Text>
                        <Text style={styles.emptySubtitle}>
                            Try changing sort or stock filter
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
        backgroundColor: colors.card,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        borderBottomLeftRadius: radii.xl,
        borderBottomRightRadius: radii.xl,
        ...shadows.card,
    },
    title: {
        ...typography.largeTitle,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    filterRow: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    toggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.page,
    },
    toggleActive: {
        borderColor: colors.success,
        backgroundColor: colors.successLight,
    },
    togglePressed: {
        opacity: 0.85,
    },
    toggleText: {
        ...typography.caption,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    toggleTextActive: {
        color: colors.success,
    },
    searchBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.full,
        borderWidth: 1,
        borderColor: colors.primaryLight,
        backgroundColor: colors.primaryLight,
    },
    searchText: {
        ...typography.caption,
        fontWeight: "700",
        color: colors.primary,
    },
    sortRow: {
        gap: spacing.sm,
        paddingBottom: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.page,
    },
    chipActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    chipPressed: {
        opacity: 0.85,
    },
    chipText: {
        ...typography.caption,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    chipTextActive: {
        color: colors.primary,
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxxl,
        paddingTop: spacing.md,
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
