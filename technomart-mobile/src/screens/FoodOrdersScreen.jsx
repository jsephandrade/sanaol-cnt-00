// screens/FoodOrdersScreen.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AuthLayout from '../components/AuthLayout';

// ---- Demo data (wire up to API/store later) ----
const CURRENT_ORDERS = [
  {
    id: 'D0124',
    title: 'Bam-i',
    price: 30,
    size: 'Regular',
    quantity: 1,
    imageUri:
      'https://images.unsplash.com/photo-1562004760-aceed7bb0fe1?q=80&w=800&auto=format&fit=crop',
    status: 'preparing',
  },
  {
    id: 'D0125',
    title: 'Fried Chicken',
    price: 32,
    size: 'Regular',
    quantity: 1,
    customize: 'Wings',
    spiciness: 'Regular',
    imageUri:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
    status: 'ready',
  },
];

const ORDER_HISTORY = [
  {
    id: 'D0789',
    title: 'Paliya',
    price: 25,
    size: 'Regular',
    quantity: 1,
    imageUri:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'D0790',
    title: 'Coke',
    price: 20,
    quantity: 1,
    imageUri:
      'https://images.unsplash.com/photo-1622484211087-8b7a5d7a5a1a?q=80&w=800&auto=format&fit=crop',
  },
];

// ---- Small helpers ----
const Peso = ({ amount }) => <Text className="text-lg font-bold text-[#1f2937]">₱{amount}</Text>;

function StatusPill({ status }) {
  if (!status) return null;
  const map = {
    preparing: { label: 'Preparing', bg: '#FEF3C7', text: '#92400E' },
    ready: { label: 'Ready', bg: '#DCFCE7', text: '#166534' },
    completed: { label: 'Completed', bg: '#E5E7EB', text: '#374151' },
    delivered: { label: 'Delivered', bg: '#E0E7FF', text: '#3730A3' },
  };
  const s = map[status] || map.completed;
  return (
    <View
      accessible
      accessibilityLabel={`Status: ${s.label}`}
      style={{ backgroundColor: s.bg }}
      className="self-start rounded-full px-3 py-1">
      <Text style={{ color: s.text }} className="text-xs font-semibold">
        {s.label}
      </Text>
    </View>
  );
}

function Chip({ children }) {
  return (
    <View className="self-start rounded-r-xl bg-[#C51610] px-3 py-1">
      <Text className="text-xs font-bold text-white">{children}</Text>
    </View>
  );
}

function OrderCard({ item, onDetails, onReorder }) {
  const imgSource = useMemo(
    () => (item.image ? item.image : { uri: item.imageUri }),
    [item.image, item.imageUri]
  );

  return (
    <View className="mb-3 rounded-2xl border border-gray-200 bg-white p-4">
      <View className="flex-row">
        <Image
          source={imgSource}
          accessibilityIgnoresInvertColors
          className="h-16 w-16 rounded-xl bg-gray-100"
        />
        <View className="ml-3 flex-1">
          <Chip>Order ID: {item.id}</Chip>
          <Text className="mt-1 text-base font-semibold text-[#1f2937]">{item.title}</Text>

          <View className="mt-0.5">
            {item.size ? <Text className="text-xs text-gray-600">Size: {item.size}</Text> : null}
            {item.customize ? (
              <Text className="text-xs text-gray-600">Customize: {item.customize}</Text>
            ) : null}
            {item.spiciness ? (
              <Text className="text-xs text-gray-600">Spiciness: {item.spiciness}</Text>
            ) : null}
            <Text className="text-xs text-gray-600">Quantity: {item.quantity}</Text>
          </View>
        </View>

        <View className="items-end">
          <Peso amount={item.price} />
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <StatusPill status={item.status} />
        <View className="flex-row">
          {onDetails && (
            <TouchableOpacity
              onPress={() => onDetails(item)}
              className="mr-3 flex-row items-center"
              accessibilityRole="button"
              accessibilityLabel="Order details">
              <Feather name="file-text" size={16} color="#C51610" />
              <Text className="ml-1 text-sm font-semibold text-[#C51610]">Order Details</Text>
            </TouchableOpacity>
          )}
          {onReorder && (
            <TouchableOpacity
              onPress={() => onReorder(item)}
              className="flex-row items-center"
              accessibilityRole="button"
              accessibilityLabel="Re-order">
              <Feather name="rotate-ccw" size={16} color="#6B7280" />
              <Text className="ml-1 text-sm font-semibold text-gray-600">Re-Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function FoodOrdersScreen() {
  const insets = useSafeAreaInsets();

  // --- Reuse LoginScreen’s decorative animated icons for consistency ---
  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const spin3 = useRef(new Animated.Value(0)).current;
  const rotate1 = spin1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const rotate2 = spin2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const rotate3 = spin3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.timing(spin1, {
          toValue: 1,
          duration: 9000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(spin2, {
          toValue: 1,
          duration: 11000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(spin3, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [spin1, spin2, spin3]);

  // --- Handlers ---
  const onDetails = (o) => Alert.alert('Order Details', `${o.title}\nOrder ID: ${o.id}`);
  const onReorder = (o) => Alert.alert('Re-Order', `Added ${o.title} to cart.`);

  return (
    <AuthLayout>
      {/* Background layer (same palette as LoginScreen) */}
      <View
        style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF5EE' }}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none">
        <Animated.View
          style={{
            position: 'absolute',
            top: 40,
            left: 20,
            opacity: 0.15,
            transform: [{ rotate: rotate1 }],
          }}>
          <MaterialCommunityIcons name="pizza" size={96} color="#FFC999" />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            top: 120,
            right: 20,
            opacity: 0.15,
            transform: [{ rotate: rotate2 }],
          }}>
          <MaterialCommunityIcons name="french-fries" size={96} color="#FFC999" />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            top: 220,
            left: 80,
            opacity: 0.15,
            transform: [{ rotate: rotate3 }],
          }}>
          <MaterialCommunityIcons name="cup" size={96} color="#FFC999" />
        </Animated.View>
      </View>

      {/* Foreground */}
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: Platform.select({ ios: insets.top + 8, android: 16 }),
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}>
        {/* Header */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-[#1f2937]" accessibilityRole="header">
            Food Orders
          </Text>
          <TouchableOpacity
            className="rounded-xl border border-gray-200 bg-white px-3 py-2"
            onPress={() => Alert.alert('Cart', 'Open cart')}
            accessibilityRole="button"
            accessibilityLabel="Open cart">
            <Feather name="shopping-cart" size={18} color="#F07F13" />
          </TouchableOpacity>
        </View>

        {/* Today’s Orders */}
        <View className="mb-2 mt-1">
          <Text className="mb-2 text-sm font-semibold text-gray-600">Today&apos;s Order</Text>
          {CURRENT_ORDERS.map((it) => (
            <OrderCard key={it.id} item={it} onDetails={onDetails} onReorder={onReorder} />
          ))}
        </View>

        {/* History */}
        <View className="mt-4">
          <Text className="mb-2 text-sm font-semibold text-gray-600">History</Text>
          {ORDER_HISTORY.map((it) => (
            <OrderCard key={it.id} item={it} onDetails={onDetails} onReorder={onReorder} />
          ))}
        </View>

        {/* Bottom safe spacing */}
        <View style={{ height: insets.bottom + 8 }} />
      </ScrollView>
    </AuthLayout>
  );
}
