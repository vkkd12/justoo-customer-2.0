import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "../api/http";
import { clearAuth, loadAuth, saveAuth } from "./authStorage";

const AUTH_ERROR_CODES = new Set([
    "TOKEN_REQUIRED",
    "TOKEN_INVALID",
    "TOKEN_REVOKED",
    "CUSTOMER_NOT_FOUND",
]);

const AuthContext = createContext(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export function AuthProvider({ children }) {
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [token, setToken] = useState(null);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const stored = await loadAuth();
                if (cancelled) return;
                setToken(stored.token);
                setCustomer(stored.customer);
            } finally {
                if (!cancelled) setIsBootstrapping(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const completeLogin = useCallback(async ({ token: nextToken, customer: nextCustomer }) => {
        setToken(nextToken);
        setCustomer(nextCustomer);
        await saveAuth({ token: nextToken, customer: nextCustomer });
    }, []);

    const forceLogoutLocal = useCallback(async () => {
        setToken(null);
        setCustomer(null);
        await clearAuth();
    }, []);

    const logout = useCallback(async () => {
        if (token) {
            try {
                await apiPost("/customer/auth/logout", { token });
            } catch {
                // Even if server logout fails, clear local auth.
            }
        }

        await forceLogoutLocal();
    }, [token, forceLogoutLocal]);

    const authedCall = useCallback(
        async (fn) => {
            if (!token) throw new ApiError("TOKEN_REQUIRED", { status: 401, code: "TOKEN_REQUIRED" });
            try {
                return await fn(token);
            } catch (e) {
                if (e instanceof ApiError && AUTH_ERROR_CODES.has(String(e.code || ""))) {
                    await forceLogoutLocal();
                }
                throw e;
            }
        },
        [token, forceLogoutLocal]
    );

    const authedGet = useCallback(
        async (path, { query } = {}) => authedCall((t) => apiGet(path, { token: t, query })),
        [authedCall]
    );
    const authedPost = useCallback(
        async (path, { body } = {}) => authedCall((t) => apiPost(path, { token: t, body })),
        [authedCall]
    );
    const authedPatch = useCallback(
        async (path, { body } = {}) => authedCall((t) => apiPatch(path, { token: t, body })),
        [authedCall]
    );
    const authedDelete = useCallback(
        async (path) => authedCall((t) => apiDelete(path, { token: t })),
        [authedCall]
    );

    const value = useMemo(
        () => ({
            isBootstrapping,
            isAuthed: Boolean(token),
            token,
            customer,
            setCustomer,
            completeLogin,
            logout,
            authedGet,
            authedPost,
            authedPatch,
            authedDelete,
        }),
        [
            isBootstrapping,
            token,
            customer,
            completeLogin,
            logout,
            authedGet,
            authedPost,
            authedPatch,
            authedDelete,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
