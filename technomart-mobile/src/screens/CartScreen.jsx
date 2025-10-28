import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

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

const formatTimeLabel = (hour, minute) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const adjustedHour = hour % 12 || 12;
  const minuteLabel = minute.toString().padStart(2, '0');
  return `${adjustedHour}:${minuteLabel} ${period}`;
};

const getNowInManila = () => {
  try {
    const localeString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    return new Date(localeString);
  } catch (error) {
    console.warn('Falling back to device time, unable to resolve Asia/Manila timezone.', error);
    return new Date();
  }
};

const PICKUP_TIME_SLOTS = (() => {
  const slots = [];
  let hour = 10;
  let minute = 0;

  while (hour < 14 || (hour === 14 && minute === 0)) {
    slots.push({
      key: `${hour}-${minute}`,
      hour,
      minute,
      label: formatTimeLabel(hour, minute),
    });

    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }

  return slots;
})();

const peso = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;

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
  const [pickupOption, setPickupOption] = React.useState('now');
  const [selectedPickupTime, setSelectedPickupTime] = React.useState(null);
  const [timeTick, setTimeTick] = React.useState(() => Date.now());
  const { items, updateItemQuantity, removeItem, subtotal, totalItems, addItem } = useCart();

  const hasItems = totalItems > 0;
  const total = subtotal;
  const canCheckout = hasItems && (pickupOption !== 'later' || Boolean(selectedPickupTime));

  React.useEffect(() => {
    if (pickupOption === 'later') {
      const now = getNowInManila();
      const firstAvailable = PICKUP_TIME_SLOTS.find((slot) => {
        const slotDate = new Date(now);
        slotDate.setHours(slot.hour, slot.minute, 0, 0);
        return slotDate > now;
      });

      setSelectedPickupTime((prev) => {
        if (prev) {
          const currentSlot = PICKUP_TIME_SLOTS.find((slot) => slot.key === prev);
          if (currentSlot) {
            const slotDate = new Date(now);
            slotDate.setHours(currentSlot.hour, currentSlot.minute, 0, 0);
            if (slotDate > now) {
              return prev;
            }
          }
        }
        return firstAvailable?.key ?? null;
      });
    } else {
      setSelectedPickupTime(null);
    }
  }, [pickupOption, timeTick]);

  React.useEffect(() => {
    if (pickupOption !== 'later') {
      return undefined;
    }

    setTimeTick(Date.now());
    const interval = setInterval(() => {
      setTimeTick(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, [pickupOption]);

  const nowInManila = React.useMemo(() => getNowInManila(), [pickupOption, timeTick]);
  const scheduleOptions = PICKUP_TIME_SLOTS.map((slot) => {
    const slotDate = new Date(nowInManila);
    slotDate.setHours(slot.hour, slot.minute, 0, 0);
    return { ...slot, isPast: slotDate <= nowInManila };
  });
  const allSlotsPast = scheduleOptions.every((option) => option.isPast);

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
    navigation.navigate('CustomizeItem', variantCopy);
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

  const onCheckout = () => {
    if (!hasItems) {
      Alert.alert('Cart is empty', 'Add items before proceeding to checkout.');
      return;
    }
    if (pickupOption === 'later' && !selectedPickupTime) {
      Alert.alert(
        'No pickup slots available',
        'All scheduled pickup times for today have passed. Please choose Pickup Now or check again tomorrow.'
      );
      return;
    }
    Alert.alert('Checkout', 'Proceeding to payment soon.');
  };

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
            onPress={() => navigation.goBack()}
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

        <View className="mx-5 mt-5 rounded-3xl bg-white/80 px-5 py-4">
          <Text className="text-xs uppercase tracking-[1.5px] text-[#A16236]">Pickup options</Text>
          <View className="mt-3 flex-row">
            <TouchableOpacity
              onPress={() => setPickupOption('now')}
              accessibilityRole="button"
              accessibilityLabel="Select pickup now"
              className={`flex-1 rounded-2xl border border-[#F5DFD3] bg-[#FFF4E8C7] px-4 py-4 ${
                pickupOption === 'now'
                  ? 'bg-[#EA580C] border-[#EA580C] shadow-[0px_8px_12px_rgba(249,115,22,0.18)] -translate-y-[1.5px]'
                  : ''
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  pickupOption === 'now' ? 'text-white' : 'text-[rgba(107,79,58,0.6)]'
                }`}>
                Pickup Now
              </Text>
              <Text
                className={`mt-1 text-xs ${
                  pickupOption === 'now'
                    ? 'text-white/95'
                    : 'text-[rgba(140,114,91,0.6)]'
                }`}>
                Ready within 15 minutes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPickupOption('later')}
              accessibilityRole="button"
              accessibilityLabel="Select pickup for later"
              className={`ml-3 flex-1 rounded-2xl border border-[#F5DFD3] bg-[#FFF4E8C7] px-4 py-4 ${
                pickupOption === 'later'
                  ? 'bg-[#EA580C] border-[#EA580C] shadow-[0px_8px_12px_rgba(249,115,22,0.18)] -translate-y-[1.5px]'
                  : ''
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  pickupOption === 'later' ? 'text-white' : 'text-[rgba(107,79,58,0.6)]'
                }`}>
                Pickup for later
              </Text>
              <Text
                className={`mt-1 text-xs ${
                  pickupOption === 'later'
                    ? 'text-white/95'
                    : 'text-[rgba(140,114,91,0.6)]'
                }`}>
                Schedule a convenient time
              </Text>
            </TouchableOpacity>
          </View>
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
                onPress={() => navigation.navigate('Home')}
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

      <View
        className="absolute bottom-5 left-5 right-5 rounded-[30px] bg-[#F07F13] px-6 pt-[18px] shadow-[0px_12px_16px_rgba(249,115,22,0.30)]"
        style={{
          paddingBottom: Math.max(insets.bottom + 12, 20),
        }}>
        {pickupOption === 'later' ? (
          <View className="mb-4 rounded-[22px] border border-[#F5DFD3] bg-[#FFF4E8D9] px-4 py-3.5">
            <Text className="text-[12px] font-bold uppercase tracking-[1.1px] text-[#6B4F3A]">
              Select pickup time
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToAlignment="center"
              snapToInterval={108}
              contentContainerClassName="mt-2.5 flex-row items-center px-1.5 pr-4 py-1.5">
              {scheduleOptions.map((option) => {
                const isSelected = selectedPickupTime === option.key;
                const isDisabled = option.isPast;

                const baseSlotClasses =
                  'mr-3 min-w-[88px] items-center justify-center rounded-2xl border border-[#F5DFD3] px-4 py-2.5';
                const stateClasses = [
                  'bg-[rgba(255,255,255,0.95)]',
                  isSelected
                    ? 'bg-[#EA580C] border-[#EA580C] shadow-[0px_4px_8px_rgba(249,115,22,0.25)]'
                    : '',
                  isDisabled ? 'bg-[#E5E7EB8C] border-[#E5E7EB]' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setSelectedPickupTime(option.key)}
                    disabled={isDisabled}
                    className={`${baseSlotClasses} ${stateClasses}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                    accessibilityLabel={`Pickup at ${option.label}`}>
                    <Text
                      className={`text-[13px] font-semibold ${
                        isSelected
                          ? 'text-white'
                          : isDisabled
                          ? 'text-[#A1A1AA]'
                          : 'text-[#7C5E43]'
                      }`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {allSlotsPast ? (
              <Text className="mt-2 text-[12px] text-[#7C5E43]">
                All pickup windows for today have passed. Please check back tomorrow.
              </Text>
            ) : null}
          </View>
        ) : null}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs uppercase tracking-[1.5px] text-white/70">
              Estimated arrival
            </Text>
            <Text className="text-base font-semibold text-white">35 - 45 mins</Text>
          </View>
          <TouchableOpacity
            onPress={onCheckout}
            disabled={!canCheckout}
            className="rounded-full bg-white px-5 py-3"
            accessibilityRole="button"
            accessibilityLabel="Checkout"
            style={!canCheckout ? { opacity: 0.55 } : null}>
            <Text className="text-sm font-semibold text-peach-500">Checkout ₱ {peso(total)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

