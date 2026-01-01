import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { ApiError, apiDelete, apiGet } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import AddressCard from "../components/AddressCard";
import InlineError from "../components/InlineError";

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
                <Text style={styles.title}>Addresses</Text>
                <Button title="Add" onPress={() => navigation.navigate("AddressForm", { mode: "create" })} />
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
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
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
