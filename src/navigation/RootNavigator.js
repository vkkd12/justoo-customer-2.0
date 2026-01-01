import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../auth/AuthContext";
import LoginPhoneScreen from "../screens/LoginPhoneScreen";
import VerifyOtpScreen from "../screens/VerifyOtpScreen";
import ItemsScreen from "../screens/ItemsScreen";
import ItemSearchScreen from "../screens/ItemSearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AccountStatusScreen from "../screens/AccountStatusScreen";
import AddressesScreen from "../screens/AddressesScreen";
import AddressFormScreen from "../screens/AddressFormScreen";
import OrdersScreen from "../screens/OrdersScreen";
import CreateOrderScreen from "../screens/CreateOrderScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";

const Stack = createNativeStackNavigator();

function FullScreenLoader() {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
        </View>
    );
}

export default function RootNavigator() {
    const { isBootstrapping, isAuthed } = useAuth();

    if (isBootstrapping) return <FullScreenLoader />;

    return (
        <NavigationContainer>
            {isAuthed ? (
                <Stack.Navigator initialRouteName="Items">
                    <Stack.Screen name="Items" component={ItemsScreen} options={{ title: "Items" }} />
                    <Stack.Screen name="ItemSearch" component={ItemSearchScreen} options={{ title: "Search" }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
                    <Stack.Screen
                        name="AccountStatus"
                        component={AccountStatusScreen}
                        options={{ title: "Account Status" }}
                    />
                    <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: "Addresses" }} />
                    <Stack.Screen
                        name="AddressForm"
                        component={AddressFormScreen}
                        options={{ title: "Address" }}
                    />
                    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: "Orders" }} />
                    <Stack.Screen
                        name="CreateOrder"
                        component={CreateOrderScreen}
                        options={{ title: "Create Order" }}
                    />
                    <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Cart" }} />
                    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator>
                    <Stack.Screen name="Login" component={LoginPhoneScreen} options={{ title: "Login" }} />
                    <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ title: "Verify OTP" }} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}
