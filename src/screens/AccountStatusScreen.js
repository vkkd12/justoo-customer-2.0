import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ApiError, apiGet } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import InlineError from "../components/InlineError";

export default function AccountStatusScreen() {
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiGet("/customer/me/status", { token });
                if (cancelled) return;
                setData(res || null);
            } catch (e) {
                if (cancelled) return;
                setError(e instanceof ApiError ? e.code : "NETWORK_ERROR");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [token]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Account Status</Text>

            <View style={styles.card}>
                <Text style={styles.row}>status: {String(data?.status || "")}</Text>
                <Text style={styles.row}>
                    isWhitelisted: {data?.isWhitelisted ? "true" : "false"}
                </Text>
                <Text style={styles.row}>customerId: {String(data?.customer?.id || "")}</Text>
                <Text style={styles.row}>
                    createdAt: {String(data?.customer?.createdAt || "")}
                </Text>

                <InlineError code={error} />
            </View>
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
        justifyContent: "center",
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
    },
    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        gap: 8,
    },
    row: {
        fontSize: 14,
    },
});
