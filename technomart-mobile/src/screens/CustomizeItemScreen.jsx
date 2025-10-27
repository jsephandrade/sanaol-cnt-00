import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const EXTRA_OPTIONS = [
  { key: 'extraRice', label: 'Extra rice', price: 18 },
  { key: 'egg', label: 'Add egg', price: 15 },
  { key: 'cheese', label: 'Cheese drizzle', price: 12 },
  { key: 'veggies', label: 'Extra veggies', price: 10 },
];

const peso = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;

export default function CustomizeItemScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const item = route?.params?.item;
  const { addItem } = useCart();

  const [selectedExtras, setSelectedExtras] = useState([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.key === extra.key)
        ? prev.filter((e) => e.key !== extra.key)
        : [...prev, extra]
    );
  };

  const total = useMemo(() => {
    const basePrice = item?.price ?? 0;
    const extras = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return (basePrice + extras) * quantity;
  }, [item?.price, quantity, selectedExtras]);

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

    Alert.alert(
      'Added to cart',
      `${quantity}× ${item?.title || 'Campus Meal'} for ${peso(total)}`,
      [
        {
          text: 'Keep browsing',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'View cart',
          onPress: () => navigation.navigate('Cart'),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-cream">
      <View className="overflow-hidden rounded-b-[40px]" style={{ paddingTop: insets.top + 12 }}>
        <Image
          source={{ uri: item?.image }}
          className="absolute inset-0 h-full w-full"
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

        <View className="px-5 pb-6">
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

          <View className="mt-6 items-center px-8 pb-6">
            <Image
              source={{ uri: item?.image }}
              className="h-40 w-40 rounded-3xl border-4 border-white/70"
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
        className="px-5 pt-5">
        <View>
          <Text className="text-sm font-semibold text-text">Add extras</Text>
          <View className="mt-3">
            {EXTRA_OPTIONS.map((extra) => {
              const isActive = !!selectedExtras.find((e) => e.key === extra.key);
              return (
                <TouchableOpacity
                  key={extra.key}
                  onPress={() => toggleExtra(extra)}
                  className={`mb-3 flex-row items-center rounded-[20px] border border-[#F5DFD3] bg-white px-4 py-3 shadow ${
                    isActive ? 'border-[#EA580C] bg-[#EA580C]' : ''
                  }`}
                  style={{
                    elevation: isActive ? 5 : 2,
                    shadowColor: '#F97316',
                    shadowOpacity: isActive ? 0.22 : 0.05,
                    shadowRadius: isActive ? 14 : 8,
                    shadowOffset: { width: 0, height: 4 },
                    transform: isActive ? [{ translateY: -2 }] : undefined,
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={extra.label}>
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border ${
                      isActive ? 'border-white bg-white' : 'border-[#D6D3D1] bg-white'
                    }`}>
                    {isActive ? <Feather name="check" size={14} color="#EA580C" /> : null}
                  </View>
                  <Text
                    className={`ml-3 flex-1 text-sm font-semibold ${
                      isActive ? 'text-white' : 'text-[#5D3E29]'
                    }`}>
                    {extra.label}
                  </Text>
                  <Text
                    className={`text-sm font-semibold ${
                      isActive ? 'text-white' : 'text-[#F07F13]'
                    }`}>
                    +₱{extra.price}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

        <View className="mt-6 flex-row items-center justify-between rounded-2xl border border-[#F5DFD3] bg-white px-4 py-3">
          <Text className="text-sm font-semibold text-text">Quantity</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#FFE8D6]"
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity">
              <Feather name="minus" size={16} color="#F07F13" />
            </TouchableOpacity>
            <Text className="mx-3 text-sm font-semibold text-text">{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity((q) => q + 1)}
              className="h-8 w-8 items-center justify-center rounded-full bg-peach-500"
              accessibilityRole="button"
              accessibilityLabel="Increase quantity">
              <Feather name="plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-5 left-5 right-5 rounded-[32px] bg-[#F07F13] px-6 py-5 shadow-xl"
        style={{
          paddingBottom: Math.max(insets.bottom + 12, 20),
          shadowColor: '#F97316',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.28,
          shadowRadius: 18,
          elevation: 12,
        }}>
        <View className="items-center">
          <Text className="text-xs uppercase tracking-[1.5px] text-white/70">Total</Text>
          <Text className="mt-1 text-2xl font-semibold text-white">{peso(total)}</Text>
        </View>
        <TouchableOpacity
          onPress={handleAddToCart}
          className="mt-4 self-center rounded-full bg-white px-8 py-3 shadow-md shadow-black/10"
          accessibilityRole="button"
          accessibilityLabel="Add to cart">
          <Text className="text-sm font-semibold text-peach-500">Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
