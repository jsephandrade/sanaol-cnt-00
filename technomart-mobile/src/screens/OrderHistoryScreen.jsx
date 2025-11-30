import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrders } from '../context/OrdersContext';

const peso = (amount) =>
  `\u20B1${Number(amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

function StatusStep({ step, isLast }) {
  if (!step) return null;
  const { label, time, state } = step;
  const isCurrent = state === 'current';
  const isCompleted = state === 'completed';
  const tint = '#F07F13';
  const idle = '#E5E7EB';

  return (
    <View className="flex-row">
      <View className="mr-3 items-center">
        <View
          className="rounded-full"
          style={{
            width: 16,
            height: 16,
            borderWidth: 2,
            borderColor: isCurrent || isCompleted ? tint : idle,
            backgroundColor: isCompleted ? tint : '#FFF',
            marginTop: 2,
          }}
        />
        {!isLast && (
          <View
            className="flex-1"
            style={{
              width: 2,
              backgroundColor: isCompleted ? tint : idle,
              marginTop: 4,
              marginBottom: 4,
            }}
          />
        )}
      </View>
      <View className="flex-1" style={{ paddingBottom: isLast ? 0 : 16 }}>
        <Text
          className={`text-sm font-semibold ${
            isCurrent ? 'text-peach-500' : isCompleted ? 'text-[#111827]' : 'text-gray-400'
          }`}>
          {label}
        </Text>
        <Text className="mt-1 text-xs text-gray-400">{time}</Text>
      </View>
    </View>
  );
}

function PastOrderCard({ order, onReorder }) {
  if (!order) return null;
  return (
    <View className="mb-4 flex-row rounded-[28px] border border-[#F5DFD3] bg-white p-4 shadow-sm">
      <Image
        source={{ uri: order.imageUri }}
        className="h-20 w-20 rounded-3xl bg-gray-100"
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View className="ml-4 flex-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-bold text-text">{order.restaurant}</Text>
            <Text className="mt-0.5 text-xs text-sub">{order.date}</Text>
          </View>
          <View className="flex-row items-center rounded-full bg-[#FFF2EA] px-2 py-1">
            <MaterialCommunityIcons name="star" size={12} color="#FBBF24" />
            <Text className="ml-1 text-xs font-semibold text-sub">{order.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text className="mt-2 text-sm text-[#4B5563]" numberOfLines={2}>
          {order.summary}
        </Text>
        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <View className="self-start rounded-full bg-[#E6F4EA] px-3 py-1">
              <Text className="text-[11px] font-semibold text-[#15803D]">{order.status}</Text>
            </View>
            <Text className="mt-1 text-sm font-semibold text-text">{peso(order.total)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onReorder(order)}
            className="rounded-2xl border border-peach-300 bg-white px-4 py-2"
            accessibilityRole="button"
            accessibilityLabel={`Reorder from ${order.restaurant}`}>
            <Text className="text-sm font-semibold text-peach-500">Reorder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function OrderHistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    currentOrder,
    pastOrders,
    loadingCurrent,
    loadingHistory,
    refreshOrders,
    contactSupport,
  } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [supportBusy, setSupportBusy] = useState(false);

  const currentOrderTotal = useMemo(() => {
    if (!currentOrder?.items?.length) return 0;
    const subtotal = currentOrder.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    return (
      subtotal +
      Number(currentOrder.deliveryFee || 0) +
      Number(currentOrder.platformFee || 0) +
      Number(currentOrder.tip || 0)
    );
  }, [currentOrder]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
    } catch (err) {
      Alert.alert('Refresh failed', err.message || 'Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [refreshOrders]);

  const handlePickupGuide = useCallback(() => {
    const details =
      currentOrder?.instructions ||
      'Head to the campus canteen pickup window once the screen shows READY.';
    Alert.alert('Pickup instructions', details);
  }, [currentOrder]);

  const handleSupport = useCallback(async () => {
    if (!currentOrder) {
      navigation.navigate('Feedback');
      return;
    }

    try {
      setSupportBusy(true);
      const ticket = await contactSupport(currentOrder.id);
      navigation.navigate('Feedback', {
        category: 'Bug',
        message: `Need help with order ${currentOrder.id}\nTicket: ${ticket.ticketId}`,
      });
    } catch (err) {
      Alert.alert('Support unavailable', err.message || 'Please try again.');
    } finally {
      setSupportBusy(false);
    }
  }, [contactSupport, currentOrder, navigation]);

  const handleReorder = useCallback((order) => {
    Alert.alert('Reorder almost ready', `We saved ${order.restaurant} items for quick checkout.`);
  }, []);

  const renderCurrentOrder = () => {
    if (loadingCurrent && !currentOrder) {
      return (
        <View className="mb-6 items-center justify-center rounded-[32px] border border-dashed border-[#F5DFD3] bg-white p-6">
          <ActivityIndicator color="#F07F13" />
          <Text className="mt-3 text-sm font-semibold text-sub">Loading your latest order...</Text>
        </View>
      );
    }

    if (!currentOrder) {
      return (
        <View className="mb-6 rounded-[32px] border border-dashed border-[#F5DFD3] bg-white p-6">
          <Text className="text-base font-semibold text-text">You&apos;re all caught up!</Text>
          <Text className="mt-1 text-sm text-sub">
            Once you place a new order, you&apos;ll see live kitchen updates here.
          </Text>
          <TouchableOpacity
            className="mt-4 self-start rounded-2xl border border-peach-200 px-4 py-2"
            onPress={handleRefresh}>
            <Text className="text-sm font-semibold text-peach-500">Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <LinearGradient
          colors={['#FFE5D0', '#FFD0A4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mb-6 rounded-[32px] p-5">
          <View className="flex-row items-start">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase text-[#8B5A3C]">Current order</Text>
              <Text className="mt-2 text-2xl font-black text-[#6B3C1F]">
                ETA {currentOrder.etaMinutes} min
              </Text>
              <Text className="mt-1 text-sm text-[#7C4A2C]">{currentOrder.placedAt}</Text>
            </View>
            <View className="ml-4 items-end">
              <View className="rounded-3xl bg-white/70 px-3 py-2">
                <Text className="text-xs font-semibold text-[#AA5B25]">Pickup spot</Text>
                <Text className="text-sm font-bold text-[#6B3C1F]" numberOfLines={2}>
                  {currentOrder.pickupSpot}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handlePickupGuide}
                className="mt-3 flex-row items-center rounded-full bg-[#6B3C1F] px-4 py-2"
                accessibilityRole="button"
                accessibilityLabel="Pickup instructions">
                <Feather name="info" size={14} color="#FFEEDA" />
                <Text className="ml-2 text-xs font-semibold text-[#FFEEDA]">Pickup tips</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View className="mb-7 rounded-[32px] border border-[#F5DFD3] bg-white p-5 shadow-sm">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-sub">{currentOrder.restaurant}</Text>
              <Text className="mt-1 text-xl font-bold text-text">Preparing your meal</Text>
            </View>
            <View className="rounded-2xl bg-cream px-3 py-2">
              <Text className="text-xs font-semibold text-sub">Pickup counter</Text>
              <Text className="text-sm font-semibold text-text" numberOfLines={2}>
                {currentOrder.pickupSpot}
              </Text>
            </View>
          </View>

          <View className="mt-4">
            {currentOrder.items.map((item, index) => (
              <View
                key={`${item.name}-${item.quantity}`}
                className="flex-row items-center justify-between"
                style={{ marginBottom: index === currentOrder.items.length - 1 ? 0 : 12 }}>
                <Text className="text-sm font-semibold text-text">
                  {item.quantity}× {item.name}
                </Text>
                <Text className="text-sm font-semibold text-sub">{peso(item.price)}</Text>
              </View>
            ))}
          </View>

          <View className="mt-4 border-t border-dashed border-[#F3D9C5] pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase text-sub">Total</Text>
              <Text className="text-base font-bold text-text">{peso(currentOrderTotal)}</Text>
            </View>
          </View>

          <View className="mt-5 rounded-[24px] bg-[#FFF8F2] p-4">
            {currentOrder.statusSteps?.map((step, index) => (
              <StatusStep
                key={`${step.label}-${step.state}`}
                step={step}
                isLast={index === currentOrder.statusSteps.length - 1}
              />
            ))}
          </View>

          <View className="mt-5 flex-row justify-between">
            <TouchableOpacity
              onPress={handlePickupGuide}
              className="flex-1 flex-row items-center justify-center rounded-2xl bg-peach-500 px-4 py-3"
              accessibilityRole="button"
              accessibilityLabel="Pickup instructions">
              <Feather name="info" size={16} color="#FFF" />
              <Text className="ml-2 text-sm font-semibold text-white">Pickup tips</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSupport}
              className="ml-3 flex-1 flex-row items-center justify-center rounded-2xl border border-peach-200 bg-white px-4 py-3"
              accessibilityRole="button"
              accessibilityLabel="Contact support"
              disabled={supportBusy}>
              {supportBusy ? (
                <ActivityIndicator size="small" color="#F07F13" />
              ) : (
                <Feather name="message-circle" size={16} color="#F07F13" />
              )}
              <Text className="ml-2 text-sm font-semibold text-peach-500">Help center</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  const isLoadingHistory = loadingHistory && (!pastOrders || pastOrders.length === 0);

  return (
    <View className="flex-1 bg-cream">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F07F13"
            colors={['#F07F13']}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 32,
        }}>
        <View className="mb-6 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow"
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={20} color="#6B4F3A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-text">Order history</Text>
          <TouchableOpacity
            onPress={handleSupport}
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow"
            accessibilityRole="button"
            accessibilityLabel="Contact support">
            <Feather name="headphones" size={18} color="#F07F13" />
          </TouchableOpacity>
        </View>

        {renderCurrentOrder()}

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-text">Past orders</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Filters', 'Filtering by status coming soon.')}
            className="flex-row items-center rounded-full bg-white px-3 py-2"
            accessibilityRole="button"
            accessibilityLabel="Filter order history">
            <Feather name="sliders" size={14} color="#F07F13" />
            <Text className="ml-1 text-xs font-semibold text-peach-500">Filters</Text>
          </TouchableOpacity>
        </View>

        {isLoadingHistory ? (
          <View className="items-center rounded-[24px] border border-dashed border-[#F5DFD3] bg-white px-4 py-10">
            <ActivityIndicator color="#F07F13" />
            <Text className="mt-3 text-sm font-semibold text-sub">
              Fetching your previous meals...
            </Text>
          </View>
        ) : pastOrders?.length ? (
          pastOrders.map((order) => (
            <PastOrderCard key={order.id} order={order} onReorder={handleReorder} />
          ))
        ) : (
          <View className="rounded-[24px] border border-dashed border-[#F5DFD3] bg-white px-4 py-8">
            <Text className="text-base font-semibold text-text">No past orders yet</Text>
            <Text className="mt-1 text-sm text-sub">
              Your previous meals will show up here once you start ordering.
            </Text>
          </View>
        )}

        <View className="mt-4 rounded-[28px] border border-dashed border-[#FCD9BD] bg-white px-4 py-5">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="information" size={20} color="#F07F13" />
            <Text className="ml-2 flex-1 text-sm text-sub">
              Need something again? Tap reorder and we&apos;ll pre-fill your cart with your last
              combo.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
