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

import { ApiError } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import CategoryCard from "../components/CategoryCard";
import InlineError from "../components/InlineError";
import { colors, typography, spacing, radii } from "../theme";

export default function CategoriesScreen({ navigation }) {
    const { authedGet } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    async function load({ isRefresh } = {}) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);
        try {
            const data = await authedGet("/customer/categories");
            setCategories(Array.isArray(data?.categories) ? data.categories : []);
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

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
                <Text style={styles.subtitle}>Browse items by category</Text>
            </View>

            <InlineError code={error} />

            <FlatList
                data={categories}
                keyExtractor={(item, idx) => String(item?.category || idx)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <CategoryCard
                        category={item?.category}
                        productCount={item?.productCount}
                        inStockCount={item?.inStockCount}
                        onPress={() =>
                            navigation.navigate("CategoryItems", { category: item?.category })
                        }
                    />
                )}
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
                            <Ionicons name="grid-outline" size={48} color={colors.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Categories</Text>
                        <Text style={styles.emptySubtitle}>
                            Categories will appear once products are available
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
