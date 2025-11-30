import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const POLICIES = [
  {
    title: 'Cash payments',
    description:
      'Have the exact amount ready upon pickup or delivery. Riders carry limited change for safety.',
  },
  {
    title: 'GCash payments',
    description:
      'Payments authorized via GCash will appear as pending until your order is confirmed by our team.',
  },
  {
    title: 'Refunds',
    description:
      'Refunds follow the payment method used at checkout and may take 3-5 business days to reflect.',
  },
];

export default function PaymentPoliciesScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={['#FFE0C2', '#FFEBD8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-b-[36px] pb-6"
        style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between px-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={22} color="#6B4F3A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#6B4F3A]">Payment policies</Text>
          <View className="h-10 w-10" />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6">
          {POLICIES.map((policy) => (
            <View
              key={policy.title}
              className="mb-4 rounded-[28px] border border-[#F5DFD3] bg-white px-5 py-4 shadow-[0px_6px_12px_rgba(249,115,22,0.06)]">
              <Text className="text-base font-semibold text-text">{policy.title}</Text>
              <Text className="mt-2 text-sm text-sub">{policy.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
