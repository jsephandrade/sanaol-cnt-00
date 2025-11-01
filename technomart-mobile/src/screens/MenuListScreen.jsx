import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RECOMMENDED_ITEMS, MENU_ITEMS } from '../utils/menuData';

const SEGMENTS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'menu', label: 'Menu Items' },
];

const CATEGORY_LABELS = {
  hotMeals: 'Hot Meals',
  snacks: 'Snacks',
  drinks: 'Drinks',
  desserts: 'Desserts',
};

export default function MenuListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initialView = route?.params?.initialView;
  const filterKey = route?.params?.filter;
  const [activeSegment, setActiveSegment] = useState(
    initialView === 'menu' ? 'menu' : 'recommended'
  );
  const inferredCategoryLabel = useMemo(() => {
    if (!filterKey) return null;
    if (CATEGORY_LABELS[filterKey]) return CATEGORY_LABELS[filterKey];
    const spaced = filterKey.replace(/([A-Z])/g, ' $1').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }, [filterKey]);
  const headerTitle = useMemo(() => {
    if (route?.params?.title) return route.params.title;
    if (inferredCategoryLabel) return inferredCategoryLabel;
    return 'Campus Menu';
  }, [inferredCategoryLabel, route?.params?.title]);

  useEffect(() => {
    if (filterKey) {
      setActiveSegment('menu');
    }
  }, [filterKey]);

  const items = useMemo(() => {
    const source = activeSegment === 'menu' ? MENU_ITEMS : RECOMMENDED_ITEMS;
    if (!filterKey) return source;
    return source.filter((item) => item.categories?.includes(filterKey));
  }, [activeSegment, filterKey]);

  const handleSelect = (item) => {
    navigation.navigate('CustomizeItem', { item });
  };

  return (
    <View className="flex-1 bg-cream">
      {/* Background icons */}
      <View
        className="absolute inset-0"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none">
        <MaterialCommunityIcons
          name="bread-slice"
          size={88}
          color="#FFE5CF"
          style={{ position: 'absolute', top: 260, left: 10, opacity: 0.12 }}
        />
        <MaterialCommunityIcons
          name="food-drumstick"
          size={92}
          color="#FFE5CF"
          style={{ position: 'absolute', top: 360, right: -18, opacity: 0.1 }}
        />
        <MaterialCommunityIcons
          name="ice-cream"
          size={84}
          color="#FFE5CF"
          style={{ position: 'absolute', bottom: 120, left: 70, opacity: 0.08 }}
        />
      </View>

      {/* Header */}
      <View className="rounded-b-[36px] bg-[#FFE0C2] pb-5" style={{ paddingTop: insets.top + 12 }}>
        <View
          className="absolute inset-0"
          accessible={false}
          importantForAccessibility="no-hide-descendants">
          <MaterialCommunityIcons
            name="pizza"
            size={96}
            color="#FFD4B4"
            style={{ position: 'absolute', top: 12, left: -10, opacity: 0.22 }}
          />
          <MaterialCommunityIcons
            name="french-fries"
            size={96}
            color="#FFD4B4"
            style={{ position: 'absolute', top: 70, right: -16, opacity: 0.18 }}
          />
          <MaterialCommunityIcons
            name="cup"
            size={96}
            color="#FFD4B4"
            style={{ position: 'absolute', top: 150, left: 60, opacity: 0.14 }}
          />
        </View>

        <View className="flex-row items-center justify-between px-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={20} color="#6B4F3A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#6B4F3A]">{headerTitle}</Text>
          <View className="h-10 w-10" />
        </View>

        {/* Segmented Control (FIXED VERSION) */}
        <View
          className="mx-5 mt-5 flex-row overflow-hidden rounded-[28px] border border-[#F5DFD3] bg-white p-1 shadow-[0px_6px_10px_rgba(249,115,22,0.06)]"
          style={{ borderRadius: 28 }}>
          {SEGMENTS.map((segment) => {
            const isActive = activeSegment === segment.key;
            return (
              <TouchableOpacity
                key={segment.key}
                onPress={() => setActiveSegment(segment.key)}
                className="flex-1 overflow-hidden rounded-[26px]"
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={segment.label}>
                <View
                  className={`items-center justify-center py-3 ${
                    isActive ? 'bg-[#FFE8D6]' : 'bg-transparent'
                  }`}
                  style={{ borderRadius: 26 }}>
                  <Text
                    className={`text-sm font-semibold ${
                      isActive ? 'text-[#F07F13]' : 'text-[#6B4F3A]'
                    }`}>
                    {segment.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        className="px-5 pt-6">
        <Text className="text-sm text-sub">
          {items.length} {items.length === 1 ? 'dish' : 'dishes'} available inside campus
        </Text>

        <View className="mt-4">
          {items.length === 0 ? (
            <View className="items-center justify-center rounded-[26px] border border-[#F5DFD3] bg-white px-6 py-24 shadow-[0px_6px_10px_rgba(249,115,22,0.06)]">
              <MaterialCommunityIcons name="food-off-outline" size={48} color="#D1D5DB" />
              <Text className="mt-4 text-base font-semibold text-text">
                Nothing matched this category
              </Text>
              <Text className="mt-1 text-center text-sm text-sub">
                Try switching tabs or exploring another icon from the home screen.
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={`${item.id}-menu`}
                className="mb-3 flex-row items-center rounded-[26px] border border-[#F5DFD3] bg-white p-4 shadow"
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
                  className="h-[72px] w-[72px] rounded-2xl"
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
                  <View className="mt-2 flex-row items-center">
                    <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                    <Text className="ml-1 text-xs text-sub">
                      {item.rating?.toFixed(1) ?? '4.5'} ({item.reviews ?? 20} reviews)
                    </Text>
                  </View>
                </View>
                <Text className="text-sm font-semibold text-peach-500">₱{item.price}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
