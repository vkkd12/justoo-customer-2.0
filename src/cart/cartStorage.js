import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_KEY = "customerCart";

export async function loadCart() {
    const raw = await AsyncStorage.getItem(CART_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function saveCart(items) {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items || []));
}

export async function clearCartStorage() {
    await AsyncStorage.removeItem(CART_KEY);
}
