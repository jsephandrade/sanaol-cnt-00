import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

const TabIcon = ({ name, label, focused }) => (
  <View
    style={[
      styles.iconWrapper,
      focused ? styles.iconWrapperActive : styles.iconWrapperInactive,
    ]}
  >
    <Feather name={name} size={20} color={focused ? '#fff' : '#f97316'} />
    <Text
      style={[
        styles.iconLabel,
        focused ? styles.iconLabelActive : styles.iconLabelInactive,
      ]}
    >
      {label}
    </Text>
  </View>
);

const tabIconRenderer =
  (name, label) =>
  ({ focused }) => <TabIcon name={name} label={label} focused={focused} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: tabIconRenderer('home', 'Home'),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: tabIconRenderer('shopping-cart', 'Cart'),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: tabIconRenderer('clock', 'Orders'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: tabIconRenderer('user', 'Profile'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 72,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 6,
    shadowColor: 'rgba(15, 23, 42, 0.18)',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 74,
  },
  iconWrapperInactive: {
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
  },
  iconWrapperActive: {
    backgroundColor: '#f97316',
  },
  iconLabel: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  iconLabelInactive: {
    color: '#f97316',
  },
  iconLabelActive: {
    color: '#fff',
  },
});
