import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { ApiError, apiDelete, apiGet } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import AddressCard from "../components/AddressCard";
import AppButton from "../components/AppButton";
import InlineError from "../components/InlineError";
import { colors } from "../theme";

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
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.kicker}>Your drop points</Text>
                    <Text style={styles.title}>Addresses</Text>
                </View>
                <AppButton title="Add" onPress={() => navigation.navigate("AddressForm", { mode: "create" })} compact />
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ isRefresh: true })} />}
                ListEmptyComponent={<Text style={styles.empty}>No addresses yet.</Text>}
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
        backgroundColor: colors.page,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    kicker: {
        color: colors.accent,
        fontWeight: "700",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.text,
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
