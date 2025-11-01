import React from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
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

const RECOMMENDED_ADDONS = [
  {
    id: 'rec-1',
    title: 'Peach Lychee Tea',
    price: 65,
    image:
      'https://images.unsplash.com/photo-1484659619207-9165d119dafe?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'rec-2',
    title: 'Mini Churros',
    price: 85,
    image:
      'https://images.unsplash.com/photo-1509474520651-53cf07c07d2d?q=80&w=800&auto=format&fit=crop',
  },
];

const ORDER_TYPE_OPTIONS = [
  {
    key: 'dine-in',
    title: 'Dine-in',
    description: 'Enjoy your meal at the TechnoMart Café lounge.',
    accessibilityLabel: 'Choose dine-in',
  },
  {
    key: 'takeout',
    title: 'Takeout',
    description: 'Pick up at the counter and head to class.',
    accessibilityLabel: 'Choose takeout',
  },
];

const peso = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;

const fallbackNavigation = Object.freeze({
  goBack: () => {},
  navigate: () => {},
});

function CartItem({ item, onIncrement, onDecrement, onEdit }) {
  const unitPrice = item.basePrice + item.extrasTotal;
  const lineTotal = unitPrice * item.quantity;

  return (
    <View className="mb-4 flex-row rounded-[28px] border border-[#F5DFD3] bg-white p-4 shadow-[0px_8px_12px_rgba(249,115,22,0.08)]">
      <Image
        source={{ uri: item.image }}
        className="h-20 w-20 rounded-2xl"
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View className="ml-4 flex-1">
        <View className="flex-row justify-between">
          <View className="flex-1 pr-6">
            <Text className="text-sm font-semibold text-text">{item.title}</Text>
            <Text className="mt-1 text-xs text-sub">{item.restaurant || 'TechnoMart Kitchen'}</Text>
            {item.notes ? (
              <View className="mt-2 flex-row items-start">
                <MaterialCommunityIcons name="note-text-outline" size={14} color="#A16236" />
                <Text className="ml-1 flex-1 text-xs italic text-[#A16236]">{item.notes}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.title}`}
            className="p-1">
            <Feather name="edit-2" size={18} color="#D97706" />
          </TouchableOpacity>
        </View>

        {item.extras?.length ? (
          <View className="mt-2 flex-row flex-wrap">
            {item.extras.map((extra) => (
              <View
                key={extra.key}
                className="mr-2 mt-2 rounded-full border border-[#F5DFD3] bg-[#FFF2E6] px-3 py-[3px]">
                <Text className="text-[11px] text-peach-500">
                  +{peso(extra.price)} {extra.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-sub">
              {peso(item.basePrice)}
              {item.extrasTotal ? ` + ${peso(item.extrasTotal)} extras` : ''}
            </Text>
            <Text className="mt-1 text-base font-semibold text-peach-500">{peso(lineTotal)}</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={onDecrement}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#FFE8D6]"
              accessibilityRole="button"
              accessibilityLabel={`Decrease quantity of ${item.title}`}>
              <Feather name="minus" size={16} color="#F07F13" />
            </TouchableOpacity>
            <Text className="mx-3 text-sm font-semibold text-text">{item.quantity}</Text>
            <TouchableOpacity
              onPress={onIncrement}
              className="h-8 w-8 items-center justify-center rounded-full bg-peach-500"
              accessibilityRole="button"
              accessibilityLabel={`Increase quantity of ${item.title}`}>
              <Feather name="plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen({ navigation }) {
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
  const sheetBorderColor = isDarkMode ? '#3F3F46' : '#F5DFD3';
  const sheetAccentColor = '#F97316';

  const safeNavigation = React.useMemo(() => navigation ?? fallbackNavigation, [navigation]);

  const hasItems = totalItems > 0;
  const total = subtotal;
  const canCheckout = hasItems;
  const estimatedArrivalLabel = 'Ready within 15 minutes';
  const handleIncrement = (item) => updateItemQuantity(item.variantKey, item.quantity + 1);
  const handleDecrement = (item) => updateItemQuantity(item.variantKey, item.quantity - 1);
  const handleEdit = (item) => {
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
    safeNavigation.navigate('CustomizeItem', variantCopy);
  };

  const handleAddOn = (addOn) => {
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
  };

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
    trackCheckoutEvent('checkout_continue_to_payment', { orderType: selectedOrderType });
    updateOrderType(selectedOrderType);
    closeOrderTypeModal();
    try {
      beginCheckout();
      safeNavigation.navigate('Payment', { orderType: selectedOrderType });
    } catch (error) {
      console.error('Failed to continue to payment', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Unable to continue to payment. Please try again.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Unable to continue', 'Please try again.');
      }
    }
  }, [beginCheckout, closeOrderTypeModal, safeNavigation, selectedOrderType, updateOrderType]);

  return (
    <View className="flex-1 bg-cream">
      <View
        className="absolute inset-0"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none">
        <MaterialCommunityIcons
          name="bread-slice"
          size={92}
          color="#FFE6D2"
          style={{ position: 'absolute', top: 260, left: -10, opacity: 0.12 }}
        />
        <MaterialCommunityIcons
          name="noodles"
          size={100}
          color="#FFE6D2"
          style={{ position: 'absolute', bottom: 180, right: -20, opacity: 0.1 }}
        />
        <MaterialCommunityIcons
          name="cup"
          size={88}
          color="#FFE6D2"
          style={{ position: 'absolute', top: 420, left: 80, opacity: 0.08 }}
        />
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
          <MaterialCommunityIcons
            name="pizza"
            size={100}
            color="#FFD6B9"
            style={{ position: 'absolute', top: 10, left: -12, opacity: 0.22 }}
          />
          <MaterialCommunityIcons
            name="french-fries"
            size={96}
            color="#FFD6B9"
            style={{ position: 'absolute', top: 60, right: -18, opacity: 0.18 }}
          />
          <MaterialCommunityIcons
            name="ice-cream"
            size={92}
            color="#FFD6B9"
            style={{ position: 'absolute', top: 160, left: 70, opacity: 0.16 }}
          />
        </View>
        <View className="flex-row items-center justify-between px-5">
          <TouchableOpacity
            onPress={() => safeNavigation.goBack()}
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
          paddingBottom: insets.bottom + 160,
        }}
        showsVerticalScrollIndicator={false}>
        <View className="mt-5 px-5">
          {hasItems ? (
            items.map((item) => (
              <CartItem
                key={item.variantKey}
                item={item}
                onIncrement={() => handleIncrement(item)}
                onDecrement={() => handleDecrement(item)}
                onEdit={() => handleEdit(item)}
              />
            ))
          ) : (
            <View className="items-center justify-center rounded-[28px] border border-[#F5DFD3] bg-white px-6 py-12 shadow-[0px_6px_12px_rgba(249,115,22,0.06)]">
              <MaterialCommunityIcons name="food-variant-off" size={48} color="#D1D5DB" />
              <Text className="mt-4 text-base font-semibold text-text">Your cart is empty</Text>
              <Text className="mt-1 text-center text-sm text-sub">
                Add your campus favorites from the home screen to get started.
              </Text>
              <TouchableOpacity
                onPress={() => safeNavigation.navigate('Home')}
                className="mt-4 rounded-full bg-peach-500 px-5 py-3"
                accessibilityRole="button"
                accessibilityLabel="Browse menu">
                <Text className="text-sm font-semibold text-white">Browse menu</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="px-5">
          <View className="mt-2 rounded-[28px] border border-[#F5DFD3] bg-white p-5 shadow-[0px_6px_10px_rgba(249,115,22,0.06)]">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-text">Subtotal</Text>
              <Text className="text-sm font-semibold text-text">{peso(subtotal)}</Text>
            </View>
            <View className="my-3 h-px bg-[#F2D4C4]" />
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-semibold text-text">Total</Text>
                <Text className="text-[11px] text-sub">No additional fees apply</Text>
              </View>
              <Text className="text-xl font-bold text-peach-500">{peso(total)}</Text>
            </View>
          </View>
        </View>

        <View className="mt-6 px-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-text">Add something extra</Text>
            <TouchableOpacity
              onPress={() => Alert.alert('Add-ons', 'More add-ons are coming soon.')}
              accessibilityRole="button"
              accessibilityLabel="Browse all add-ons">
              <Text className="text-sm font-medium text-peach-500">View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 14 }}>
            {RECOMMENDED_ADDONS.map((addOn) => (
              <TouchableOpacity
                key={addOn.id}
                className="mr-4 w-[150px] rounded-[24px] border border-[#F5DFD3] bg-white p-3.5 shadow-[0px_6px_12px_rgba(249,115,22,0.06)]"
                onPress={() => handleAddOn(addOn)}
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
                <Text className="mt-2 text-sm font-semibold text-peach-500">
                  {peso(addOn.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <LinearGradient
        colors={['#F97316', '#FB923C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute bottom-5 left-5 right-5 rounded-[32px] px-6 py-5"
        style={{
          paddingBottom: Math.max(insets.bottom + 18, 26),
          shadowColor: '#F97316',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.28,
          shadowRadius: 20,
          elevation: 12,
        }}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-[11px] uppercase tracking-[1.2px] text-white/75">
              Estimated arrival
            </Text>
            <Text className="mt-2 text-xl font-semibold text-white">{estimatedArrivalLabel}</Text>
            <View className="mt-3 flex-row items-center">
              <Feather name="clock" size={14} color="#FFE8D6" />
              <Text className="ml-2 text-xs text-white/80">
                We will notify you when everything is warm and ready.
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-[11px] uppercase tracking-[1.1px] text-white/75">Total due</Text>
            <Text className="mt-1 text-lg font-semibold text-white">{peso(total)}</Text>
            <TouchableOpacity
              onPress={onCheckout}
              disabled={!canCheckout}
              className="mt-4 rounded-full bg-white px-5 py-3 shadow-md shadow-black/10"
              accessibilityRole="button"
              accessibilityLabel="Checkout"
              style={!canCheckout ? { opacity: 0.55 } : null}>
              <Text className="text-sm font-semibold text-[#F97316]">Checkout {peso(total)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <Modal
        animationType="slide"
        transparent
        visible={isOrderTypeModalVisible}
        onRequestClose={closeOrderTypeModal}
        statusBarTranslucent>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close order type selection"
            onPress={closeOrderTypeModal}
            style={{ flex: 1, backgroundColor: 'rgba(17,17,17,0.45)' }}
          />
          <View
            style={{
              backgroundColor: sheetBackgroundColor,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: insets.bottom + 24,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderColor: sheetBorderColor,
              borderWidth: isDarkMode ? 1 : 0,
            }}>
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: sheetTitleColor,
                }}>
                Choose how you like to receive your order
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: sheetSubtitleColor,
                }}>
                Pick an option to continue to payment. You can change this later from the cart.
              </Text>
            </View>
            {ORDER_TYPE_OPTIONS.map((option) => {
              const isSelected = selectedOrderType === option.key;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={option.accessibilityLabel}
                  onPress={() => handleSelectOrderType(option.key)}
                  style={{
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: isSelected ? sheetAccentColor : sheetBorderColor,
                    backgroundColor: isDarkMode ? '#27272A' : '#FFF6EE',
                    padding: 18,
                    marginBottom: 14,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: isSelected ? '700' : '600',
                          color: sheetTitleColor,
                        }}>
                        {option.title}
                      </Text>
                      <Text
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          color: sheetSubtitleColor,
                        }}>
                        {option.description}
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 22,
                        width: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: isSelected ? sheetAccentColor : sheetBorderColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? sheetAccentColor : 'transparent',
                      }}
                      accessible={false}>
                      {isSelected ? (
                        <View
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: '#FFFFFF',
                          }}
                        />
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
            <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={handleContinueToPayment}
                disabled={!selectedOrderType}
                accessibilityRole="button"
                accessibilityLabel="Continue to payment"
                style={{
                  flex: 1,
                  backgroundColor: selectedOrderType ? sheetAccentColor : `${sheetAccentColor}55`,
                  paddingVertical: 14,
                  borderRadius: 999,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#FFFFFF',
                  }}>
                  Continue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeOrderTypeModal}
                accessibilityRole="button"
                accessibilityLabel="Cancel order type selection"
                style={{ marginLeft: 16 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: sheetAccentColor,
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
