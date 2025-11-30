import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { trackCheckoutEvent } from '../utils/trackCheckoutEvent';
import {
  ORDER_TYPE_OPTIONS,
  RECOMMENDED_ADDONS,
  PICKUP_TIME_SLOTS_TEMPLATE,
} from '../constants/cart';
import CartItemCard from '../components/cart/CartItemCard';
import CartEmptyState from '../components/cart/CartEmptyState';
import CartSummaryCard from '../components/cart/CartSummaryCard';
import CartAddOnsCarousel from '../components/cart/CartAddOnsCarousel';
import EstimatedArrivalCard from '../components/cart/EstimatedArrivalCard';
import OrderTypeModal from '../components/cart/OrderTypeModal';
import { useCartCredits } from '../hooks/useCartCredits';

const SLOT_INTERVAL_MINUTES = 15;

const PICKUP_MODE_OPTIONS = [
  {
    key: 'now',
    title: 'Pickup now',
    subtitle: 'Ready in ~15 min',
  },
  {
    key: 'later',
    title: 'Order for later',
    subtitle: 'Choose a time slot',
  },
];

const formatSlotTime = (date) => {
  const pad = String(date.getMinutes()).padStart(2, '0');
  let hours = date.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${pad} ${suffix}`;
};

const buildPickupSlots = () => {
  const now = new Date();
  const base = new Date(now.getTime());
  const remainder = base.getMinutes() % SLOT_INTERVAL_MINUTES;
  if (remainder !== 0) {
    base.setMinutes(base.getMinutes() + (SLOT_INTERVAL_MINUTES - remainder), 0, 0);
  } else {
    base.setSeconds(0, 0);
    base.setMilliseconds(0);
  }

  return PICKUP_TIME_SLOTS_TEMPLATE.map((template, index) => {
    const start = new Date(base.getTime() + template.offsetMinutes * 60000);
    const end = new Date(start.getTime() + SLOT_INTERVAL_MINUTES * 60000);
    return {
      id: template.id,
      label: `${formatSlotTime(start)} - ${formatSlotTime(end)}`,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      badge:
        index === 0
          ? 'Earliest'
          : index === PICKUP_TIME_SLOTS_TEMPLATE.length - 1
            ? 'Latest'
            : 'Standard',
    };
  });
};

export default function CartScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const {
    items,
    updateItemQuantity,
    removeItem,
    subtotal,
    totalItems,
    addItem,
    orderType,
    updateOrderType,
  } = useCart();
  const { beginCheckout } = useCheckout();
  const [isOrderTypeModalVisible, setIsOrderTypeModalVisible] = React.useState(false);
  const [selectedOrderType, setSelectedOrderType] = React.useState(null);
  const isDarkMode = colorScheme === 'dark';
  const sheetBackgroundColor = isDarkMode ? '#1F1F1F' : '#FFFFFF';
  const sheetTitleColor = isDarkMode ? '#F9FAFB' : '#6B4F3A';
  const sheetSubtitleColor = isDarkMode ? '#D4D4D8' : '#8C725B';
  const sheetAccentColor = '#F97316';
  const safeBottomInset = Math.max(insets.bottom, 0);

  const hasItems = totalItems > 0;

  const {
    redeemCredits,
    canRedeemCredits,
    creditSummaryText,
    creditDiscount,
    creditEarnedThisOrder,
    handleToggleCredits,
    total,
    creditApplied,
  } = useCartCredits({
    subtotal,
    hasItems,
    creditPointsParam: route?.params?.creditPoints,
  });

  const pickupTimeSlots = React.useMemo(
    () => (hasItems ? buildPickupSlots() : []),
    [hasItems, totalItems]
  );
  const [pickupSlotId, setPickupSlotId] = React.useState(null);
  const [pickupMode, setPickupMode] = React.useState('now');

  React.useEffect(() => {
    if (!hasItems) {
      setPickupMode('now');
      setPickupSlotId(null);
      return;
    }
    if (pickupMode !== 'later') {
      return;
    }
    if (!pickupTimeSlots.length) {
      return;
    }
    const currentSlotExists = pickupTimeSlots.some((slot) => slot.id === pickupSlotId);
    if (!pickupSlotId || !currentSlotExists) {
      setPickupSlotId(pickupTimeSlots[0].id);
    }
  }, [hasItems, pickupMode, pickupSlotId, pickupTimeSlots]);

  const selectedPickupSlot = React.useMemo(
    () =>
      pickupMode === 'later'
        ? (pickupTimeSlots.find((slot) => slot.id === pickupSlotId) ?? null)
        : null,
    [pickupMode, pickupSlotId, pickupTimeSlots]
  );

  const estimatedArrivalLabel =
    pickupMode === 'later' && selectedPickupSlot
      ? selectedPickupSlot.label
      : 'Ready within 15 minutes';
  const canCheckout = hasItems;

  const handleIncrement = (item) => updateItemQuantity(item.variantKey, item.quantity + 1);
  const handleDecrement = (item) => updateItemQuantity(item.variantKey, item.quantity - 1);
  const handleEdit = (item) => {
    if (navigation?.navigate) {
      const variantCopy = {
        item: {
          id: item.id,
          title: item.title,
          price: item.basePrice,
          image: item.image,
          restaurant: item.restaurant,
        },
        extras: item.extras,
        notes: item.notes,
        quantity: 1,
      };
      removeItem(item.variantKey);
      navigation.navigate('CustomizeItem', variantCopy);
    } else {
      Alert.alert('Edit unavailable', 'Item editing requires navigation support.');
    }
  };

  const handleAddOn = React.useCallback(
    (addOn) => {
      if (!addOn) {
        return;
      }
      addItem({
        item: {
          id: addOn.id,
          title: addOn.title,
          price: addOn.price,
          image: addOn.image,
        },
        extras: [],
        notes: '',
        quantity: 1,
      });
      Alert.alert('Added to cart', `${addOn.title} was added to your cart.`);
    },
    [addItem]
  );

  const handleViewAllAddOns = React.useCallback(() => {
    Alert.alert('Add-ons', 'More add-ons are coming soon.');
  }, []);

  const openOrderTypeModal = React.useCallback(() => {
    setSelectedOrderType(orderType ?? null);
    setIsOrderTypeModalVisible(true);
  }, [orderType]);

  const onCheckout = () => {
    if (!hasItems) {
      Alert.alert('Cart is empty', 'Add items before proceeding to checkout.');
      return;
    }
    openOrderTypeModal();
  };

  React.useEffect(() => {
    if (isOrderTypeModalVisible) {
      trackCheckoutEvent('checkout_option_viewed');
    }
  }, [isOrderTypeModalVisible]);

  const handleSelectOrderType = React.useCallback((type) => {
    setSelectedOrderType((prev) => {
      if (prev === type) {
        return prev;
      }
      trackCheckoutEvent('checkout_option_selected', { orderType: type });
      return type;
    });
  }, []);

  const closeOrderTypeModal = React.useCallback(() => {
    setIsOrderTypeModalVisible(false);
  }, []);

  const handleContinueToPayment = React.useCallback(() => {
    if (!selectedOrderType) {
      return;
    }
    const pickupSlotPayload = selectedPickupSlot
      ? {
          id: selectedPickupSlot.id,
          label: selectedPickupSlot.label,
          startISO: selectedPickupSlot.startISO,
          endISO: selectedPickupSlot.endISO,
        }
      : null;
    if (pickupMode === 'later' && !selectedPickupSlot) {
      Alert.alert('Select pickup time', 'Choose a pickup slot before continuing.');
      return;
    }
    trackCheckoutEvent('checkout_continue_to_payment', {
      orderType: selectedOrderType,
      creditApplied,
      creditEarned: creditEarnedThisOrder,
      pickupMode,
      pickupSlot: pickupSlotPayload?.id ?? null,
      pickupSlotLabel: pickupSlotPayload?.label ?? null,
    });
    updateOrderType(selectedOrderType);
    closeOrderTypeModal();
    try {
      beginCheckout();
      if (navigation?.navigate) {
        navigation.navigate('Payment', {
          orderType: selectedOrderType,
          creditApplied,
          creditEarned: creditEarnedThisOrder,
          pickupMode,
          pickupSlot: pickupSlotPayload,
        });
      }
    } catch (error) {
      console.error('Failed to continue to payment', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Unable to continue to payment. Please try again.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Unable to continue', 'Please try again.');
      }
    }
  }, [
    beginCheckout,
    closeOrderTypeModal,
    selectedOrderType,
    updateOrderType,
    creditApplied,
    creditEarnedThisOrder,
    pickupMode,
    selectedPickupSlot,
    navigation,
  ]);

  return (
    <View className="flex-1 bg-white/85">
      <View
        className="absolute inset-0"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none">
        <View className="absolute left-[-10px] top-[260px] opacity-[0.12]">
          <MaterialCommunityIcons name="bread-slice" size={92} color="#FFE6D2" />
        </View>
        <View className="absolute bottom-[180px] right-[-20px] opacity-10">
          <MaterialCommunityIcons name="noodles" size={100} color="#FFE6D2" />
        </View>
        <View className="absolute left-[80px] top-[420px] opacity-[0.08]">
          <MaterialCommunityIcons name="cup" size={88} color="#FFE6D2" />
        </View>
      </View>
      <LinearGradient
        colors={['#FFE0C2', '#FFEBD8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-b-[36px] pb-6"
        style={{ paddingTop: insets.top + 12 }}>
        <View
          className="absolute inset-0"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none">
          <View className="absolute left-[-12px] top-[10px] opacity-[0.22]">
            <MaterialCommunityIcons name="pizza" size={100} color="#FFD6B9" />
          </View>
          <View className="absolute right-[-18px] top-[60px] opacity-[0.18]">
            <MaterialCommunityIcons name="french-fries" size={96} color="#FFD6B9" />
          </View>
          <View className="absolute left-[70px] top-[160px] opacity-[0.16]">
            <MaterialCommunityIcons name="ice-cream" size={92} color="#FFD6B9" />
          </View>
        </View>
        <View className="flex-row items-center justify-between px-5">
          <TouchableOpacity
            onPress={() => {
              if (navigation?.goBack) {
                navigation.goBack();
              }
            }}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Feather name="chevron-left" size={22} color="#6B4F3A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#6B4F3A]">
            {hasItems ? `Your Cart (${totalItems})` : 'Your Cart'}
          </Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Help', 'Chat with support soon.')}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            accessibilityRole="button"
            accessibilityLabel="Need help">
            <Feather name="help-circle" size={20} color="#6B4F3A" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: (insets.bottom || 0) + 260,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="mt-5 px-5">
          {hasItems ? (
            <>
              <View className="mb-5 rounded-[26px] border border-[#F5DFD3] bg-white p-1 shadow-[0px_4px_12px_rgba(249,115,22,0.05)]">
                <View className="flex-row rounded-[22px] bg-[#FFF4E6]">
                  {PICKUP_MODE_OPTIONS.map((option) => {
                    const isActive = pickupMode === option.key;
                    return (
                      <TouchableOpacity
                        key={option.key}
                        onPress={() => setPickupMode(option.key)}
                        className={`flex-1 rounded-[22px] px-4 py-3 ${
                          isActive ? 'bg-peach-500 shadow-[0px_6px_14px_rgba(249,115,22,0.18)]' : ''
                        }`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={option.title}>
                        <Text
                          className={`text-sm font-semibold ${
                            isActive ? 'text-white' : 'text-[#6B4F3A]'
                          }`}>
                          {option.title}
                        </Text>
                        <Text
                          className={`mt-1 text-[11px] ${
                            isActive ? 'text-white/80' : 'text-[#A87952]'
                          }`}>
                          {option.subtitle}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {pickupMode === 'later' ? (
                <View className="mb-5 rounded-[28px] border border-[#F5DFD3] bg-white p-5 shadow-[0px_6px_12px_rgba(249,115,22,0.05)]">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons name="clock-outline" size={18} color="#F97316" />
                        <Text className="ml-2 text-sm font-semibold text-text">
                          Pickup time slot
                        </Text>
                      </View>
                      <Text className="mt-2 text-xs text-sub">
                        Reserve a pickup window so your meal is ready when you arrive.
                      </Text>
                    </View>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 12 }}>
                    {pickupTimeSlots.map((slot) => {
                      const isSelected = slot.id === pickupSlotId;
                      return (
                        <TouchableOpacity
                          key={slot.id}
                          onPress={() => setPickupSlotId(slot.id)}
                          className={`mr-3 rounded-[22px] border px-4 py-3 ${
                            isSelected
                              ? 'border-peach-500 bg-peach-500 shadow-[0px_8px_16px_rgba(249,115,22,0.18)]'
                              : 'border-[#F5DFD3] bg-[#FFF4E6] shadow-[0px_4px_10px_rgba(249,115,22,0.08)]'
                          }`}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`Pickup between ${slot.label}`}>
                          <Text
                            className={`text-xs font-semibold ${
                              isSelected ? 'text-white' : 'text-[#6B4F3A]'
                            }`}>
                            {slot.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  {selectedPickupSlot ? (
                    <View className="mt-2 flex-row items-center rounded-[18px] bg-[#FFF4E6] px-3 py-2">
                      <MaterialCommunityIcons
                        name="clock-check-outline"
                        size={16}
                        color="#EA580C"
                      />
                      <Text className="ml-2 text-xs text-[#9A6A46]">
                        We will prepare your order for {selectedPickupSlot.label}.
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {items.map((item) => (
                <CartItemCard
                  key={item.variantKey}
                  item={item}
                  onIncrement={() => handleIncrement(item)}
                  onDecrement={() => handleDecrement(item)}
                  onEdit={() => handleEdit(item)}
                />
              ))}
            </>
          ) : (
            <CartEmptyState
              onBrowse={() => {
                if (navigation?.navigate) {
                  navigation.navigate('Home');
                }
              }}
            />
          )}
        </View>

        {hasItems && pickupMode === 'later' ? (
          <View className="mt-4 px-5">
            <View className="rounded-[28px] border border-[#F5DFD3] bg-white p-5 shadow-[0px_6px_12px_rgba(249,115,22,0.05)]">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="clock-outline" size={18} color="#F97316" />
                    <Text className="ml-2 text-sm font-semibold text-text">Pickup time slot</Text>
                  </View>
                  <Text className="mt-2 text-xs text-sub">
                    Reserve a pickup window so your meal is ready when you arrive.
                  </Text>
                </View>
              </View>
              <View className="mt-4 flex-row flex-wrap">
                {pickupTimeSlots.map((slot) => {
                  const isSelected = slot.id === pickupSlotId;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => setPickupSlotId(slot.id)}
                      className={`mr-2 mt-2 rounded-full border px-4 py-2 ${
                        isSelected
                          ? 'border-peach-500 bg-peach-500'
                          : 'border-[#F5DFD3] bg-[#FFF4E6]'
                      }`}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Pickup between ${slot.label}`}>
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-white' : 'text-[#6B4F3A]'
                        }`}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {selectedPickupSlot ? (
                <View className="mt-4 flex-row items-center rounded-[18px] bg-[#FFF4E6] px-3 py-2">
                  <MaterialCommunityIcons name="clock-check-outline" size={16} color="#EA580C" />
                  <Text className="ml-2 text-xs text-[#9A6A46]">
                    We will prepare your order for {selectedPickupSlot.label}.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        <View className="mt-4 px-5">
          <CartSummaryCard
            subtotal={subtotal}
            total={total}
            redeemCredits={redeemCredits}
            canRedeemCredits={canRedeemCredits}
            creditSummaryText={creditSummaryText}
            creditDiscount={creditDiscount}
            creditEarnedThisOrder={creditEarnedThisOrder}
            onToggleCredits={handleToggleCredits}
          />
        </View>

        <CartAddOnsCarousel
          addOns={RECOMMENDED_ADDONS}
          onAdd={handleAddOn}
          onViewAll={handleViewAllAddOns}
        />
      </ScrollView>

      <EstimatedArrivalCard
        isVisible={hasItems}
        estimatedArrivalLabel={estimatedArrivalLabel}
        total={total}
        canCheckout={canCheckout}
        onCheckout={onCheckout}
        safeBottomInset={safeBottomInset}
      />

      <OrderTypeModal
        visible={isOrderTypeModalVisible}
        onClose={closeOrderTypeModal}
        options={ORDER_TYPE_OPTIONS}
        selectedOrderType={selectedOrderType}
        onSelect={handleSelectOrderType}
        onContinue={handleContinueToPayment}
        sheetBackgroundColor={sheetBackgroundColor}
        sheetTitleColor={sheetTitleColor}
        sheetSubtitleColor={sheetSubtitleColor}
        sheetAccentColor={sheetAccentColor}
        insets={insets}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}
