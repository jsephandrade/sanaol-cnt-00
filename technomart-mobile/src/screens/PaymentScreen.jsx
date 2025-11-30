import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { useCheckout } from '../context/CheckoutContext';
import { useCart } from '../context/CartContext';
import { trackCheckoutEvent } from '../utils/trackCheckoutEvent';

const PAYMENT_OPTIONS = [
  {
    key: 'cash',
    title: 'Cash',
    subtitle: 'Pay with cash upon delivery/pickup.',
    icon: { name: 'cash-multiple', color: '#F97316' },
  },
  {
    key: 'gcash',
    title: 'GCash',
    subtitle: 'Pay via GCash wallet.',
    icon: { name: 'wallet-outline', color: '#0EA5E9' },
  },
];

const SANDBOX_MESSAGE = 'GCash checkout is in sandbox mode.';

const sandboxAuthorization = () =>
  new Promise((resolve) => {
    const reference = `SANDBOX-${Date.now()}`;
    setTimeout(() => resolve(reference), 750);
  });

function Banner({ tone = 'info', message }) {
  if (!message) {
    return null;
  }

  const background = tone === 'error' ? '#FEE2E2' : '#DBEAFE';
  const textColor = tone === 'error' ? '#B91C1C' : '#1D4ED8';
  const iconName = tone === 'error' ? 'alert-triangle' : 'info';
  const iconColor = tone === 'error' ? '#DC2626' : '#2563EB';

  return (
    <View className="mb-4 rounded-2xl px-4 py-3" style={{ backgroundColor: background }}>
      <View className="flex-row items-center">
        <Feather name={iconName} size={18} color={iconColor} />
        <Text className="ml-2 text-sm" style={{ color: textColor }}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const ORDER_TYPE_LABELS = {
  'dine-in': 'Dine-in',
  takeout: 'Takeout',
};

export default function PaymentScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { totalItems, orderType: cartOrderType } = useCart();
  const { paymentMethod, selectPaymentMethod, markPaymentStatus } = useCheckout();
  const [processing, setProcessing] = React.useState(false);
  const [infoMessage, setInfoMessage] = React.useState(
    paymentMethod === 'gcash' ? SANDBOX_MESSAGE : null
  );
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [isOnline, setIsOnline] = React.useState(true);
  const routeOrderType = route?.params?.orderType;
  const activeOrderType = routeOrderType ?? cartOrderType ?? null;

  const showNavigationError = React.useCallback(() => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('Unable to continue. Please try again.', ToastAndroid.SHORT);
    } else {
      Alert.alert('Unable to continue', 'Please try again.');
    }
  }, []);

  const safeNavigate = React.useCallback(
    (...args) => {
      try {
        navigation.navigate(...args);
      } catch (error) {
        console.error('PaymentScreen navigation error', error);
        showNavigationError();
      }
    },
    [navigation, showNavigationError]
  );

  React.useEffect(() => {
    if (!totalItems) {
      navigation.goBack?.();
      return;
    }
    if (!activeOrderType) {
      console.warn('PaymentScreen: Missing order type. Returning to cart to prompt selection.');
      navigation.goBack?.();
    }
  }, [totalItems, activeOrderType, navigation]);

  React.useEffect(() => {
    let isMounted = true;
    let subscription;

    const applyState = (state) => {
      if (!isMounted) return;
      const online = Boolean(state?.isConnected && (state.isInternetReachable ?? true));
      setIsOnline(online);
    };

    Network.getNetworkStateAsync()
      .then(applyState)
      .catch(() => {
        if (typeof navigator !== 'undefined' && navigator.onLine !== undefined) {
          setIsOnline(Boolean(navigator.onLine));
        }
      });

    if (Network.addNetworkStateListener) {
      subscription = Network.addNetworkStateListener(applyState);
    }

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  React.useEffect(() => {
    if (paymentMethod === 'gcash') {
      setInfoMessage(SANDBOX_MESSAGE);
    } else {
      setInfoMessage(null);
    }
  }, [paymentMethod]);

  const handleSelect = React.useCallback(
    (method) => {
      selectPaymentMethod(method);
      setErrorMessage(null);
    },
    [selectPaymentMethod]
  );

  const handleContinue = React.useCallback(async () => {
    if (!paymentMethod || processing) {
      return;
    }

    if (!activeOrderType) {
      console.warn('PaymentScreen: Attempted to continue without an order type.');
      showNavigationError();
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    trackCheckoutEvent('checkout_continue_to_review', {
      orderType: activeOrderType,
      paymentMethod,
    });

    if (paymentMethod === 'cash') {
      markPaymentStatus('pending', { orderType: activeOrderType });
      setProcessing(false);
      safeNavigate('OrderReview', { orderType: activeOrderType });
      return;
    }

    if (!isOnline) {
      markPaymentStatus('selecting', { orderType: activeOrderType });
      setErrorMessage('You appear to be offline. Connect to continue with GCash.');
      setProcessing(false);
      return;
    }

    markPaymentStatus('authorizing', { orderType: activeOrderType });

    try {
      const reference = await sandboxAuthorization();
      markPaymentStatus('authorized', { provider: 'gcash', reference, orderType: activeOrderType });
      safeNavigate('OrderReview', { orderType: activeOrderType });
    } catch (error) {
      markPaymentStatus('failed', { orderType: activeOrderType });
      setErrorMessage(error?.message || 'GCash payment was cancelled. Try again.');
    } finally {
      setProcessing(false);
    }
  }, [
    paymentMethod,
    processing,
    markPaymentStatus,
    isOnline,
    activeOrderType,
    safeNavigate,
    showNavigationError,
  ]);

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
            accessibilityLabel="Go back to cart">
            <Feather name="chevron-left" size={22} color="#6B4F3A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#6B4F3A]">Payment</Text>
          <View className="h-10 w-10" />
        </View>
        {activeOrderType ? (
          <View className="px-5">
            <View className="mt-4 self-start rounded-full bg-white/80 px-3 py-1">
              <Text className="text-[12px] font-semibold uppercase tracking-[1.2px] text-[#6B4F3A]">
                {ORDER_TYPE_LABELS[activeOrderType] ?? activeOrderType}
              </Text>
            </View>
          </View>
        ) : null}
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 160, 220),
        }}
        showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6">
          <Banner tone={errorMessage ? 'error' : 'info'} message={errorMessage || infoMessage} />

          <View className="rounded-[28px] border border-[#F5DFD3] bg-white p-5 shadow-[0px_6px_12px_rgba(249,115,22,0.06)]">
            <Text className="text-xs uppercase tracking-[1.5px] text-[#A16236]">
              Select payment method
            </Text>

            <View className="mt-4">
              {PAYMENT_OPTIONS.map((option) => {
                const isSelected = paymentMethod === option.key;

                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => handleSelect(option.key)}
                    activeOpacity={0.92}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={option.title}
                    className={`mb-3 flex-row items-center rounded-[22px] border px-4 py-4 ${
                      isSelected
                        ? 'border-[#EA580C] bg-[#EA580C] shadow-[0px_8px_12px_rgba(249,115,22,0.16)]'
                        : 'border-[#F5DFD3] bg-[#FFF8F2]'
                    }`}>
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: '#FFF' }}>
                      <MaterialCommunityIcons
                        name={option.icon.name}
                        size={24}
                        color={option.icon.color}
                      />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text
                        className={`text-base font-semibold ${
                          isSelected ? 'text-white' : 'text-[#6B4F3A]'
                        }`}>
                        {option.title}
                      </Text>
                      <Text
                        className={`mt-1 text-sm ${
                          isSelected ? 'text-white/90' : 'text-[rgba(107,79,58,0.75)]'
                        }`}>
                        {option.subtitle}
                      </Text>
                    </View>
                    <View
                      className={`h-5 w-5 items-center justify-center rounded-full border ${
                        isSelected ? 'border-white bg-white' : 'border-[#D6C4B3]'
                      }`}
                      accessible={false}>
                      {isSelected ? (
                        <View className="h-2.5 w-2.5 rounded-full bg-[#EA580C]" />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
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
          onPress={handleContinue}
          disabled={processing || !paymentMethod}
          className="h-14 flex-row items-center justify-center rounded-full bg-[#F07F13]"
          accessibilityRole="button"
          accessibilityLabel="Continue with selected payment method"
          accessibilityState={{ disabled: processing || !paymentMethod }}
          style={processing || !paymentMethod ? { opacity: 0.6 } : null}>
          {processing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-base font-semibold text-white">Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => safeNavigate('PaymentPolicies')}
          className="mt-4 items-center"
          accessibilityRole="link"
          accessibilityLabel="View payment policies">
          <Text className="text-sm font-medium text-peach-500">View payment policies</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
