import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CartEmptyState({ onBrowse }) {
  return (
    <View className="items-center justify-center rounded-[28px] border border-[#F5DFD3] bg-white px-6 py-12 shadow-[0px_6px_12px_rgba(249,115,22,0.06)]">
      <MaterialCommunityIcons name="food-variant-off" size={48} color="#D1D5DB" />
      <Text className="mt-4 text-base font-semibold text-text">Your cart is empty</Text>
      <Text className="mt-1 text-center text-sm text-sub">
        Add your campus favorites from the home screen to get started.
      </Text>
      <TouchableOpacity
        onPress={onBrowse}
        className="mt-4 rounded-full bg-peach-500 px-5 py-3"
        accessibilityRole="button"
        accessibilityLabel="Browse menu">
        <Text className="text-sm font-semibold text-white">Browse menu</Text>
      </TouchableOpacity>
    </View>
  );
}
