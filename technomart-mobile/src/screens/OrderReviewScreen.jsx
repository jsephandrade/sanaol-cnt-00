import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCheckout } from '../context/CheckoutContext';
import { useCart } from '../context/CartContext';

const peso = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;

const PAYMENT_COPY = {
  cash: {
    title: 'Cash',
    subtitle: 'Pay upon delivery/pickup. Have exact change ready when possible.',
  },
  gcash: {
    title: 'GCash',
    subtitle: 'Your GCash wallet will be charged once the order is confirmed.',
  },
};

const STATUS_COPY = {
  idle: 'Review and continue when you are ready.',
  selecting: 'Choose how you want to pay to continue.',
  pending: 'Cash payment selected. No charges until handoff.',
  authorizing: 'Authorizing your GCash payment…',
  authorized: 'GCash payment authorized. You are all set!',
  failed: 'Payment attempt did not go through. Please try again.',
  completed: 'Order placed. Watch for updates shortly.',
};

export default function OrderReviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { subtotal, totalItems, clearCart } = useCart();
  const { paymentMethod, paymentStatus, paymentMetadata, completeCheckout } = useCheckout();

  const paymentDetails = PAYMENT_COPY[paymentMethod] ?? PAYMENT_COPY.cash;
  const statusDetails = STATUS_COPY[paymentStatus] ?? STATUS_COPY.idle;

  const handlePlaceOrder = React.useCallback(() => {
    completeCheckout(paymentMetadata ?? { total: subtotal });
    clearCart();
    Alert.alert('Order placed', 'Your order is on its way! You can review it anytime in Order History.', [
      {
        text: 'View order history',
        onPress: () => navigation.navigate('OrderHistory'),
      },
    ]);
    navigation.navigate('Home');
  }, [completeCheckout, paymentMetadata, subtotal, clearCart, navigation]);

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={['#FFE0C2', '#FFEBD8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-b-[36px] pb-6"
        style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between px-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            accessibilityRole="button"
            accessibilityLabel="Go back to payment">
            <Feather name="chevron-left" size={22} color="#6B4F3A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#6B4F3A]">Review order</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Payment')}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/70"
            accessibilityRole="button"
            accessibilityLabel="Change payment method">
            <Feather name="edit-3" size={20} color="#6B4F3A" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6">
          <View className="rounded-[28px] border border-[#F5DFD3] bg-white p-5 shadow-[0px_6px_12px_rgba(249,115,22,0.06)]">
            <Text className="text-xs uppercase tracking-[1.5px] text-[#A16236]">Payment summary</Text>
            <View className="mt-4 flex-row items-start">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FFF6EF]">
                <MaterialCommunityIcons
                  name={paymentMethod === 'gcash' ? 'wallet-outline' : 'cash-multiple'}
                  size={26}
                  color={paymentMethod === 'gcash' ? '#0EA5E9' : '#F97316'}
                />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-text">{paymentDetails.title}</Text>
                <Text className="mt-1 text-sm text-sub">{paymentDetails.subtitle}</Text>
                <Text className="mt-3 text-xs uppercase tracking-[1.4px] text-[#F97316]">Status</Text>
                <Text className="mt-1 text-sm text-text">{statusDetails}</Text>
                {paymentMetadata?.reference ? (
                  <Text className="mt-2 text-xs text-sub">
                    Reference: <Text className="font-medium text-text">{paymentMetadata.reference}</Text>
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-[28px] border border-[#F5DFD3] bg-white p-5 shadow-[0px_6px_12px_rgba(249,115,22,0.06)]">
            <Text className="text-xs uppercase tracking-[1.5px] text-[#A16236]">Order details</Text>
            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-text">Items</Text>
              <Text className="text-sm font-semibold text-text">{totalItems}</Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-text">Total due</Text>
              <Text className="text-xl font-bold text-peach-500">{peso(subtotal)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-5 left-5 right-5 rounded-[28px] bg-white px-6 py-5 shadow-xl"
        style={{
          paddingBottom: Math.max(insets.bottom + 16, 24),
          shadowColor: '#F97316',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 10,
        }}>
        <TouchableOpacity
          onPress={handlePlaceOrder}
          className="h-14 items-center justify-center rounded-full bg-[#F07F13]"
          accessibilityRole="button"
          accessibilityLabel="Place order"
          accessibilityState={{ busy: paymentStatus === 'authorizing' }}
          disabled={paymentStatus === 'authorizing'}
          style={paymentStatus === 'authorizing' ? { opacity: 0.6 } : null}>
          <Text className="text-base font-semibold text-white">
            {paymentMethod === 'gcash' ? 'Confirm authorized payment' : 'Place order'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('PaymentPolicies')}
          className="mt-4 items-center"
          accessibilityRole="link"
          accessibilityLabel="Review payment policies">
          <Text className="text-sm font-medium text-peach-500">Review payment policies</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
