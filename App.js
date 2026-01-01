import React from "react";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "./src/auth/AuthContext";
import { CartProvider } from "./src/cart/CartContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </CartProvider>
    </AuthProvider>
  );
}
