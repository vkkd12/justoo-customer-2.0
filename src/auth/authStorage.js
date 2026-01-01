import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "customerAuthToken";
const CUSTOMER_KEY = "customerProfile";

export async function saveAuth({ token, customer }) {
    await AsyncStorage.multiSet([
        [TOKEN_KEY, String(token || "")],
        [CUSTOMER_KEY, JSON.stringify(customer || null)],
    ]);
}

export async function loadAuth() {
    const pairs = await AsyncStorage.multiGet([TOKEN_KEY, CUSTOMER_KEY]);
    const token = pairs.find(([k]) => k === TOKEN_KEY)?.[1] || "";
    const rawCustomer = pairs.find(([k]) => k === CUSTOMER_KEY)?.[1] || "";

    let customer = null;
    if (rawCustomer) {
        try {
            customer = JSON.parse(rawCustomer);
        } catch {
            customer = null;
        }
    }

    return { token: token || null, customer };
}

export async function clearAuth() {
    await AsyncStorage.multiRemove([TOKEN_KEY, CUSTOMER_KEY]);
}
