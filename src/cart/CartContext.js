import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearCartStorage, loadCart, saveCart } from "./cartStorage";
import { useAuth } from "../auth/AuthContext";

// Cart item shape stored locally:
// {
//   productId: string,
//   name?: string,
//   sellingPrice?: string,
//   discountPercent?: string,
//   quantity: number
// }

const CartContext = createContext(null);

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}

export function CartProvider({ children }) {
    const { isBootstrapping: authBootstrapping, isAuthed } = useAuth();
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (authBootstrapping) return;
        if (isAuthed) return;
        // When logged out, clear cart.
        setItems([]);
        clearCartStorage();
    }, [authBootstrapping, isAuthed]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const stored = await loadCart();
                if (cancelled) return;
                setItems(stored);
            } finally {
                if (!cancelled) setIsBootstrapping(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const persist = useCallback(async (nextItems) => {
        setItems(nextItems);
        await saveCart(nextItems);
    }, []);

    const addItem = useCallback(
        async (product, quantity = 1) => {
            const productId = String(product?.id || product?.productId || "").trim();
            if (!productId) return;

            const qty = Number(quantity);
            if (!Number.isFinite(qty) || qty <= 0) return;

            const next = [...items];
            const idx = next.findIndex((it) => String(it.productId) === productId);
            if (idx >= 0) {
                next[idx] = { ...next[idx], quantity: Number(next[idx].quantity || 0) + qty };
            } else {
                next.push({
                    productId,
                    name: product?.name,
                    sellingPrice: product?.sellingPrice,
                    discountPercent: product?.discountPercent,
                    quantity: qty,
                });
            }
            await persist(next);
        },
        [items, persist]
    );

    const setQuantity = useCallback(
        async (productId, quantity) => {
            const id = String(productId || "").trim();
            if (!id) return;
            const qty = Number(quantity);
            if (!Number.isFinite(qty)) return;

            const next = items
                .map((it) => (String(it.productId) === id ? { ...it, quantity: qty } : it))
                .filter((it) => Number(it.quantity) > 0);

            await persist(next);
        },
        [items, persist]
    );

    const removeItem = useCallback(
        async (productId) => {
            const id = String(productId || "").trim();
            const next = items.filter((it) => String(it.productId) !== id);
            await persist(next);
        },
        [items, persist]
    );

    const clear = useCallback(async () => {
        setItems([]);
        await clearCartStorage();
    }, []);

    const totalCount = useMemo(
        () => items.reduce((sum, it) => sum + Number(it.quantity || 0), 0),
        [items]
    );

    const value = useMemo(
        () => ({
            isBootstrapping,
            items,
            totalCount,
            addItem,
            setQuantity,
            removeItem,
            clear,
        }),
        [isBootstrapping, items, totalCount, addItem, setQuantity, removeItem, clear]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
