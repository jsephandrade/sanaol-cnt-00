import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { peso } from '../utils/currency';

const EXTRA_OPTIONS = [
  { key: 'extraRice', label: 'Extra rice', price: 18 },
  { key: 'egg', label: 'Add egg', price: 15 },
  { key: 'cheese', label: 'Cheese drizzle', price: 12 },
  { key: 'veggies', label: 'Extra veggies', price: 10 },
];

const PICNIC_PATTERN_URI = 'https://www.transparenttextures.com/patterns/red-oxford.png';
const HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1600&auto=format&fit=crop';

export default function CustomizeItemScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const item = route?.params?.item;
  const { addItem, totalItems } = useCart();
  const safeBottomInset = Math.max(insets.bottom, 0);

  const availableExtras = useMemo(() => {
    const extrasSource = item?.extras;

    if (Array.isArray(extrasSource) && extrasSource.length) {
      return extrasSource
        .filter(Boolean)
        .map((extra, index) => {
          const rawPrice =
            typeof extra?.price === 'number' ? extra.price : Number(extra?.price ?? 0);

          return {
            key: extra?.key ?? extra?.id ?? `extra-${index}`,
            label: extra?.label ?? extra?.name ?? `Extra ${index + 1}`,
            price: Number.isFinite(rawPrice) ? rawPrice : 0,
          };
        })
        .filter((extra) => extra.key);
    }

    if (extrasSource && typeof extrasSource === 'object') {
      return Object.entries(extrasSource)
        .map(([key, value]) => {
          const rawPrice =
            typeof value?.price === 'number' ? value.price : Number(value?.price ?? 0);

          return {
            key,
            label: value?.label ?? value?.name ?? key,
            price: Number.isFinite(rawPrice) ? rawPrice : 0,
          };
        })
        .filter((extra) => extra.key);
    }

    return EXTRA_OPTIONS;
  }, [item?.extras]);

  const [selectedExtraKey, setSelectedExtraKey] = useState(null);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!selectedExtraKey) return;
    if (!availableExtras.some((extra) => extra.key === selectedExtraKey)) {
      setSelectedExtraKey(null);
    }
  }, [availableExtras, selectedExtraKey]);

  const selectedExtras = useMemo(() => {
    const match = availableExtras.find((extra) => extra.key === selectedExtraKey);
    return match ? [match] : [];
  }, [availableExtras, selectedExtraKey]);

  const toggleExtra = (extraKey) => {
    setSelectedExtraKey((prev) => (prev === extraKey ? null : extraKey));
  };

  const total = useMemo(() => {
    const basePrice = item?.price ?? 0;
    const extras = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return (basePrice + extras) * quantity;
  }, [item?.price, quantity, selectedExtras]);

  const normalizedTotalItems = Number.isFinite(totalItems) ? totalItems : 0;
  const totalItemsLabel = normalizedTotalItems > 99 ? '99+' : String(normalizedTotalItems);
  const heroImageUri = item?.image || HERO_FALLBACK_IMAGE;

  const handleAddToCart = () => {
    const trimmedNotes = notes.trim();

    addItem({
      item: {
        id: item?.id,
        title: item?.title || 'Campus Meal',
        price: item?.price ?? 0,
        image: item?.image,
        restaurant: item?.restaurant,
      },
      extras: selectedExtras,
      notes: trimmedNotes,
      quantity,
    });

    navigation.navigate('Home');
  };

  return (
    <ImageBackground source={{ uri: PICNIC_PATTERN_URI }} resizeMode="repeat" className="flex-1">
      <View className="flex-1 bg-white/85">
        <View
          className="relative overflow-hidden rounded-b-[32px]"
          style={{ paddingTop: insets.top + 10 }}>
          <Image
            source={{ uri: heroImageUri }}
            className="absolute inset-0"
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            blurRadius={18}
          />
          <BlurView intensity={40} tint="dark" className="absolute inset-0" />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.55)', 'rgba(0, 0, 0, 0.35)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="absolute inset-0"
          />

          <View
            className="absolute inset-0"
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none">
            <MaterialCommunityIcons
              name="pizza"
              size={90}
              color="rgba(255,255,255,0.15)"
              style={{ position: 'absolute', top: 20, left: -18 }}
            />
            <MaterialCommunityIcons
              name="food-apple"
              size={84}
              color="rgba(255,255,255,0.12)"
              style={{ position: 'absolute', top: 110, right: -12 }}
            />
            <MaterialCommunityIcons
              name="cup"
              size={88}
              color="rgba(255,255,255,0.1)"
              style={{ position: 'absolute', top: 190, left: 60 }}
            />
          </View>

          <View className="px-5 pb-5">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/30"
                accessibilityRole="button"
                accessibilityLabel="Close customization">
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-white">Customize</Text>
              <View className="h-10 w-10" />
            </View>

            <View className="mt-4 items-center px-6 pb-4">
              <Image
                source={{ uri: item?.image }}
                className="h-28 w-28 rounded-3xl border-4 border-white/70"
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <Text className="mt-4 text-xl font-semibold text-white">{item?.title}</Text>
              <View className="mt-2 flex-row items-center">
                <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
                <Text className="ml-1 text-xs text-white/90">
                  {(item?.rating ?? 4.6).toFixed(1)} ({item?.reviews ?? 24} reviews)
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: (insets.bottom || 0) + 260 }}
          className="px-5 pt-5">
          <View>
            <Text className="text-sm font-semibold text-text">Add extras</Text>
            <View className="mt-3">
              {availableExtras.length ? (
                availableExtras.map((extra) => {
                  const isActive = selectedExtraKey === extra.key;
                  const content = (
                    <>
                      <View
                        className={`h-6 w-6 items-center justify-center rounded-full border ${
                          isActive ? 'bg-white/15' : 'bg-white'
                        }`}
                        style={{
                          borderColor: isActive
                            ? 'rgba(255,255,255,0.65)'
                            : 'rgba(249,115,22,0.28)',
                        }}>
                        {isActive ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
                      </View>
                      <Text
                        className={`ml-3 flex-1 text-sm font-semibold ${
                          isActive ? 'text-white' : 'text-[#5D3E29]'
                        }`}>
                        {extra.label}
                      </Text>
                      <Text
                        className={`text-sm font-semibold ${
                          isActive ? 'text-white' : 'text-[#F97316]'
                        }`}>
                        {`+${peso(extra.price)}`}
                      </Text>
                    </>
                  );

                  return (
                    <TouchableOpacity
                      key={extra.key}
                      onPress={() => toggleExtra(extra.key)}
                      activeOpacity={0.92}
                      className="mb-3 rounded-[20px]"
                      style={{
                        borderRadius: 20,
                        elevation: isActive ? 6 : 2,
                        shadowColor: '#F97316',
                        shadowOpacity: isActive ? 0.25 : 0.08,
                        shadowRadius: isActive ? 16 : 8,
                        shadowOffset: { width: 0, height: 4 },
                        transform: [{ translateY: 0 }],
                        overflow: 'hidden',
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isActive }}
                      accessibilityLabel={extra.label}>
                      {isActive ? (
                        <LinearGradient
                          colors={['#F97316', '#FB923C']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          className="flex-row items-center px-4 py-3"
                          style={{ borderRadius: 20 }}>
                          {content}
                        </LinearGradient>
                      ) : (
                        <View className="flex-row items-center rounded-[20px] border border-[#F5DFD3] bg-[#FFF4E6] px-4 py-3">
                          {content}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text className="text-xs text-[#8F6B56]">Extras are currently unavailable.</Text>
              )}
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-sm font-semibold text-text">Special instructions</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholder="E.g. Less oil, deliver to Lab 3 entrance"
              placeholderTextColor="#A1A1AA"
              className="mt-3 rounded-2xl border border-[#F5DFD3] bg-white px-4 py-3 text-sm text-text"
            />
          </View>
        </ScrollView>

        <LinearGradient
          colors={['#F97316', '#FB923C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute left-5 right-5 rounded-[20px] px-6 py-5"
          style={{
            bottom: 20 + safeBottomInset,
            borderRadius: 20,
            paddingBottom: 26,
            shadowColor: '#F97316',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.28,
            shadowRadius: 20,
            elevation: 12,
          }}>
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[11px] uppercase tracking-[1.2px] text-white/75">Total</Text>
              <Text className="mt-2 text-2xl font-semibold text-white">{peso(total)}</Text>
              <Text className="mt-2 text-[11px] text-white/75">
                Includes extras and quantity ({quantity}x)
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              className="relative h-11 w-11 items-center justify-center rounded-full bg-white"
              accessibilityRole="button"
              accessibilityLabel="Open cart"
              style={{
                shadowColor: '#000000',
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}>
              <Feather name="shopping-cart" size={22} color="#F97316" />
              <View
                className="absolute -right-1 -top-1 items-center justify-center rounded-full bg-[#DC2626]"
                style={{ minWidth: 18, aspectRatio: 1 }}>
                <Text className="text-[10px] font-semibold text-white">{totalItemsLabel}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View className="mt-5 flex-row items-center space-x-3">
            <View
              className="flex-row items-center rounded-full bg-white/15 px-2 py-1"
              style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-9 w-9 items-center justify-center rounded-full bg-white"
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity">
                <Feather name="minus" size={18} color="#F97316" />
              </TouchableOpacity>
              <Text className="mx-3 text-base font-semibold text-white">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                className="h-9 w-9 items-center justify-center rounded-full bg-peach-500"
                accessibilityRole="button"
                accessibilityLabel="Increase quantity">
                <Feather name="plus" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleAddToCart}
              className="flex-1 items-center justify-center rounded-full bg-white px-4 py-3 shadow-md shadow-black/10"
              accessibilityRole="button"
              accessibilityLabel="Add to cart"
              style={{ elevation: 4 }}>
              <Text className="text-sm font-semibold text-[#F97316]">Add to cart</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </ImageBackground>
  );
}
