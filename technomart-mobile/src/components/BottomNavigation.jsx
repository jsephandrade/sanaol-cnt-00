import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const BOTTOM_TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'cart', label: 'Cart', icon: 'shopping-bag' },
  { key: 'history', label: 'History', icon: 'clock' },
  { key: 'alerts', label: 'Alerts', icon: 'bell', badge: true },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

export default function BottomNavigation({
  activeKey,
  cartHasItems = false,
  onTabPress,
  disableAll = false,
}) {
  const insets = useSafeAreaInsets();
  const safeBottomInset = Math.max(insets.bottom, 0);
  const containerBottom = 20 + safeBottomInset;

  return (
    <View
      className="absolute left-5 right-5 flex-row justify-between rounded-[28px] bg-white px-[18px] shadow-xl"
      style={{
        bottom: containerBottom,
        paddingBottom: 12,
        paddingTop: 12,
        elevation: 12,
        shadowColor: '#0F172A',
      }}
      pointerEvents={disableAll ? 'none' : 'auto'}>
      {BOTTOM_TABS.map((tab) => {
        const isActive = tab.key === activeKey;
        const showBadge = tab.key === 'cart' ? cartHasItems : tab.badge;
        const accessibilityState = { selected: isActive };
        if (disableAll) {
          accessibilityState.disabled = true;
        }

        return (
          <TouchableOpacity
            key={tab.key}
            className="flex-1 items-center"
            onPress={() => {
              if (disableAll) return;
              onTabPress?.(tab.key);
            }}
            disabled={disableAll}
            accessibilityRole="tab"
            accessibilityState={accessibilityState}
            accessibilityLabel={tab.label}>
            <View
              className={`relative items-center justify-center rounded-full p-2 ${
                isActive ? 'bg-[#FFE8D6]' : 'bg-transparent'
              }`}>
              <Feather name={tab.icon} size={22} color={isActive ? '#F07F13' : '#A8A29E'} />
              {showBadge ? (
                <View className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              ) : null}
            </View>
            <Text
              className={`mt-1 text-xs font-medium ${
                isActive ? 'text-[#F07F13]' : 'text-[#A8A29E]'
              }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
