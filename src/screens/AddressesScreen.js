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

import { ApiError, apiDelete, apiGet } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import AddressCard from "../components/AddressCard";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import { colors, typography, spacing, radii } from "../theme";

export default function AddressesScreen({ navigation }) {
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [addresses, setAddresses] = useState([]);

    async function load({ isRefresh } = {}) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);
        try {
            const data = await apiGet("/customer/addresses", { token });
            setAddresses(Array.isArray(data?.addresses) ? data.addresses : []);
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

    async function onDelete(addressId) {
        if (!addressId) return;
        setError(null);
        try {
            await apiDelete(`/customer/addresses/${addressId}`, { token });
            await load({ isRefresh: true });
        } catch (e) {
            setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
        }
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
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.kicker}>Delivery Locations</Text>
                        <Text style={styles.title}>Your Addresses</Text>
                    </View>
                    <AppButton
                        title="Add New"
                        onPress={() => navigation.navigate("AddressForm", { mode: "create" })}
                        size="small"
                        icon={<Ionicons name="add" size={16} color="#fff" />}
                    />
                </View>
            </View>

            <InlineError code={error} />

            <FlatList
                data={addresses}
                keyExtractor={(item, idx) => String(item?.id || idx)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <AddressCard
                        address={item}
                        onEdit={() => navigation.navigate("AddressForm", { mode: "edit", address: item })}
                        onDelete={() => onDelete(item?.id)}
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
                            <Ionicons name="location-outline" size={48} color={colors.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Addresses Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Add your first delivery address to get started
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
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    kicker: {
        ...typography.micro,
        color: colors.accent,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    title: {
        ...typography.largeTitle,
        color: colors.text,
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
