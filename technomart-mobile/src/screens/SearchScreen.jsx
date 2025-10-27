import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RECOMMENDED_ITEMS, MENU_ITEMS } from '../utils/menuData';

const ALL_ITEMS = [...RECOMMENDED_ITEMS, ...MENU_ITEMS];

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_ITEMS;
    const q = query.trim().toLowerCase();
    return ALL_ITEMS.filter(
      (item) => item.title.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (item) => {
    navigation.navigate('CustomizeItem', { item });
  };

  return (
    <View className="flex-1 bg-cream">
      <View className="rounded-b-[32px] bg-[#FFE0C2] pb-5" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center px-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={20} color="#6B4F3A" />
          </TouchableOpacity>
          <Text className="ml-3 text-lg font-semibold text-[#6B4F3A]">Search Menu</Text>
        </View>

        <View className="mt-4 px-5">
          <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm">
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search dishes, drinks, snacks..."
              placeholderTextColor="#9CA3AF"
              className="ml-3 flex-1 text-sm text-text"
              autoFocus
              returnKeyType="search"
            />
            {query ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search">
                <Feather name="x-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        className="px-5 pt-5">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-sub">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MenuList')}
            accessibilityRole="button"
            accessibilityLabel="Open full menu">
            <Text className="text-sm font-semibold text-peach-500">Browse full menu</Text>
          </TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <View className="items-center justify-center py-40">
            <MaterialCommunityIcons name="food-off-outline" size={48} color="#D1D5DB" />
            <Text className="mt-4 text-base font-semibold text-text">No matches on campus</Text>
            <Text className="mt-1 text-center text-sm text-sub">
              Try another search term or check the full menu.
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={`${item.id}-search`}
              className="mb-3 flex-row items-center rounded-[24px] border border-[#F5DFD3] bg-white p-[14px] shadow"
              style={{
                elevation: 2,
                shadowColor: '#F97316',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
              onPress={() => handleSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`Customize ${item.title}`}>
              <Image
                source={{ uri: item.image }}
                className="h-16 w-16 rounded-2xl"
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <View className="ml-4 flex-1">
                <Text className="text-sm font-semibold text-text">{item.title}</Text>
                {item.description ? (
                  <Text className="mt-1 text-xs text-sub" numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View className="mt-1 flex-row items-center">
                  <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                  <Text className="ml-1 text-xs text-sub">
                    {item.rating?.toFixed(1) ?? '4.5'} ({item.reviews ?? 24})
                  </Text>
                </View>
              </View>
              <Text className="text-sm font-semibold text-peach-500">₱{item.price}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
