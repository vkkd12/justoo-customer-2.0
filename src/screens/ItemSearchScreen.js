import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ApiError } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import InlineError from "../components/InlineError";
import ItemCard from "../components/ItemCard";
import { colors, typography, spacing, radii, shadows } from "../theme";

export default function ItemSearchScreen({ route }) {
    const { authedGet } = useAuth();
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
            const data = await authedGet("/customer/items/search", { query: { q: effectiveQ } });
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
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Search</Text>
                <Text style={styles.subtitle}>Find exactly what you need</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search-outline" size={20} color={colors.muted} style={styles.searchIcon} />
                    <TextInput
                        value={q}
                        onChangeText={setQ}
                        placeholder="Search for items..."
                        placeholderTextColor={colors.muted}
                        style={styles.searchInput}
                        autoCapitalize="none"
                        returnKeyType="search"
                        onSubmitEditing={() => load()}
                    />
                    {q.length > 0 && (
                        <Pressable onPress={() => setQ("")} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={colors.muted} />
                        </Pressable>
                    )}
                </View>
            </View>

            <InlineError code={error} />

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
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
                                <Ionicons name="search" size={48} color={colors.muted} />
                            </View>
                            <Text style={styles.emptyTitle}>No Results Found</Text>
                            <Text style={styles.emptySubtitle}>
                                {effectiveQ
                                    ? `We couldn't find any items matching "${effectiveQ}"`
                                    : "Enter a search term to find items"
                                }
                            </Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
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
    searchContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    searchInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.md,
        ...typography.body,
        color: colors.text,
    },
    clearButton: {
        padding: spacing.xs,
    },
    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
