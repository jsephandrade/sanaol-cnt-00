import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { peso } from '../../utils/currency';

export default function EstimatedArrivalCard({
  isVisible,
  estimatedArrivalLabel,
  total,
  canCheckout,
  onCheckout,
  safeBottomInset,
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#F97316', '#FB923C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="absolute left-5 right-5 rounded-[28px] px-6 py-5"
      style={{
        bottom: 20 + safeBottomInset,
        borderRadius: 28,
        paddingBottom: 26,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
        elevation: 12,
      }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-[11px] uppercase tracking-[1.2px] text-white/75">
            Estimated arrival
          </Text>
          <Text className="mt-2 text-xl font-semibold text-white">{estimatedArrivalLabel}</Text>
          <View className="mt-3 flex-row items-center">
            <Feather name="clock" size={14} color="#FFE8D6" />
            <Text className="ml-2 text-xs text-white/80">
              We will notify you when everything is warm and ready.
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-[11px] uppercase tracking-[1.1px] text-white/75">Total due</Text>
          <Text className="mt-1 text-lg font-semibold text-white">{peso(total)}</Text>
          <TouchableOpacity
            onPress={onCheckout}
            disabled={!canCheckout}
            className="mt-4 rounded-full bg-white px-5 py-3 shadow-md shadow-black/10"
            accessibilityRole="button"
            accessibilityLabel="Checkout"
            style={!canCheckout ? { opacity: 0.55 } : null}>
            <Text className="text-sm font-semibold text-[#F97316]">Checkout {peso(total)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
