// Expo environment variables must be prefixed with EXPO_PUBLIC_
// Example: EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:4000
export const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";
