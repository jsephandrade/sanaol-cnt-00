import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { peso, pesoWithCents } from '../../utils/currency';

export default function CartSummaryCard({
  subtotal,
  total,
  redeemCredits,
  canRedeemCredits,
  creditSummaryText,
  creditDiscount,
  creditEarnedThisOrder,
  onToggleCredits,
}) {
  return (
    <View className="mt-2 rounded-[28px] border border-[#F5DFD3] bg-white p-5 shadow-[0px_6px_10px_rgba(249,115,22,0.06)]">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-text">Subtotal</Text>
        <Text className="text-sm font-semibold text-text">{peso(subtotal)}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggleCredits}
        activeOpacity={canRedeemCredits ? 0.85 : 1}
        className={`mt-3 rounded-[20px] border border-[#F5DFD3] px-4 py-3 ${
          redeemCredits ? 'bg-[#FDEAD8]' : 'bg-[#FFF4E6]'
        } ${!canRedeemCredits ? 'opacity-75' : ''}`}
        accessibilityRole="button"
        accessibilityLabel="Apply credit points"
        accessibilityState={{ disabled: !canRedeemCredits, selected: redeemCredits }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-semibold text-text">Credit points</Text>
            <Text className="mt-1 text-[11px] text-sub">{creditSummaryText}</Text>
          </View>
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${
              redeemCredits ? 'bg-peach-500' : 'border border-[#F5DFD3] bg-white'
            }`}>
            <Feather
              name={redeemCredits ? 'check' : canRedeemCredits ? 'plus' : 'lock'}
              size={18}
              color={redeemCredits ? '#FFFFFF' : canRedeemCredits ? '#EA580C' : '#A8A29E'}
            />
          </View>
        </View>
      </TouchableOpacity>
      {redeemCredits ? (
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-[#EA580C]">Credits applied</Text>
          <Text className="text-sm font-semibold text-[#EA580C]">
            -{pesoWithCents(creditDiscount)}
          </Text>
        </View>
      ) : null}
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-[#9A6A46]">Points to earn after checkout</Text>
        <Text className="text-xs font-semibold text-[#9A6A46]">
          {creditEarnedThisOrder.toFixed(2)} pts
        </Text>
      </View>
      <View className="mb-3 mt-4 h-px bg-[#F2D4C4]" />
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-text">Total</Text>
          <Text className="text-[11px] text-sub">No additional fees apply</Text>
        </View>
        <Text className="text-xl font-bold text-peach-500">{peso(total)}</Text>
      </View>
    </View>
  );
}
