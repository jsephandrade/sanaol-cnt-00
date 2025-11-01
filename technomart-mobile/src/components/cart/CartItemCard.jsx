import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { peso } from '../../utils/currency';

export default function CartItemCard({ item, onIncrement, onDecrement, onEdit }) {
  const unitPrice = item.basePrice + item.extrasTotal;
  const lineTotal = unitPrice * item.quantity;

  return (
    <View className="mb-4 flex-row rounded-[28px] border border-[#F5DFD3] bg-[#FFF4E6] p-4 shadow-[0px_8px_12px_rgba(249,115,22,0.08)]">
      <Image
        source={{ uri: item.image }}
        className="h-20 w-20 rounded-2xl"
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View className="ml-4 flex-1">
        <View className="flex-row justify-between">
          <View className="flex-1 pr-6">
            <Text className="text-sm font-semibold text-text">{item.title}</Text>
            <Text className="mt-1 text-xs text-sub">{item.restaurant || 'TechnoMart Kitchen'}</Text>
            {item.notes ? (
              <View className="mt-2 flex-row items-start">
                <MaterialCommunityIcons name="note-text-outline" size={14} color="#A16236" />
                <Text className="ml-1 flex-1 text-xs italic text-[#A16236]">{item.notes}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.title}`}
            className="p-1">
            <Feather name="edit-2" size={18} color="#D97706" />
          </TouchableOpacity>
        </View>

        {item.extras?.length ? (
          <View className="mt-2 flex-row flex-wrap">
            {item.extras.map((extra) => (
              <View
                key={extra.key}
                className="mr-2 mt-2 rounded-full border border-[#F5DFD3] bg-[#FFF2E6] px-3 py-[3px]">
                <Text className="text-[11px] text-peach-500">
                  +{peso(extra.price)} {extra.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-sub">
              {peso(item.basePrice)}
              {item.extrasTotal ? ` + ${peso(item.extrasTotal)} extras` : ''}
            </Text>
            <Text className="mt-1 text-lg font-bold text-peach-500">{peso(lineTotal)}</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={onDecrement}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#FFE8D6]"
              accessibilityRole="button"
              accessibilityLabel={`Decrease quantity of ${item.title}`}>
              <Feather name="minus" size={16} color="#F07F13" />
            </TouchableOpacity>
            <Text className="mx-3 text-sm font-semibold text-text">{item.quantity}</Text>
            <TouchableOpacity
              onPress={onIncrement}
              className="h-8 w-8 items-center justify-center rounded-full bg-peach-500"
              accessibilityRole="button"
              accessibilityLabel={`Increase quantity of ${item.title}`}>
              <Feather name="plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
