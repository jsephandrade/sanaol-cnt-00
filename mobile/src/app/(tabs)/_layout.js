// app/(tabs)/_layout.js
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home-dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'orange',
      }}
    >
      {/* Home tab */}
      <Tabs.Screen
        name="home-dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Cart tab */}
      <Tabs.Screen
        name="customer-cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Orders tab */}
      <Tabs.Screen
        name="order-tracking"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile tab */}
      <Tabs.Screen
        name="account-profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
