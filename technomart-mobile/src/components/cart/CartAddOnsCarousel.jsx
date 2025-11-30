import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { peso } from '../../utils/currency';

export default function CartAddOnsCarousel({ addOns, onAdd, onViewAll }) {
  if (!addOns?.length) {
    return null;
  }

  return (
    <View className="mt-6 px-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-text">Add something extra</Text>
        <TouchableOpacity
          onPress={() => onViewAll?.()}
          accessibilityRole="button"
          accessibilityLabel="Browse all add-ons">
          <Text className="text-sm font-medium text-peach-500">View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 14 }}>
        {addOns.map((addOn) => (
          <TouchableOpacity
            key={addOn.id}
            className="mr-4 w-[150px] rounded-[24px] border border-[#F5DFD3] bg-[#FFF4E6] p-3.5 shadow-[0px_6px_12px_rgba(249,115,22,0.06)]"
            onPress={() => onAdd?.(addOn)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${addOn.title}`}>
            <Image
              source={{ uri: addOn.image }}
              className="h-24 w-full rounded-2xl"
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <Text className="mt-3 text-sm font-semibold text-text">{addOn.title}</Text>
            <Text className="mt-1 text-xs text-sub">Perfect with your meal</Text>
            <Text className="mt-2 text-lg font-bold text-peach-500">{peso(addOn.price)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
