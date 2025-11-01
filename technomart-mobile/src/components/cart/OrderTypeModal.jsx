import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function OrderTypeOption({ option, isSelected, onSelect, isDarkMode }) {
  if (!option) {
    return null;
  }

  const circleBorderColor = isSelected ? option.accentColor : option.idleBorderColor;
  const outerBackground = isDarkMode ? '#2E2A27' : option.circleBackground;
  const innerBackground = isSelected ? option.accentColor : isDarkMode ? '#3F3F46' : '#FFFFFF';

  return (
    <Pressable
      key={option.key}
      onPress={() => onSelect(option.key)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={option.accessibilityLabel}
      className="w-full items-center">
      <View
        className="h-[138px] w-[138px] items-center justify-center rounded-full border-[4px]"
        style={{
          borderColor: circleBorderColor,
          backgroundColor: outerBackground,
          shadowColor: option.accentColor,
          shadowOpacity: isSelected ? 0.28 : 0.18,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: isSelected ? 20 : 14,
          elevation: isSelected ? 12 : 6,
        }}>
        <View
          className="h-[82px] w-[82px] items-center justify-center rounded-full"
          style={{
            backgroundColor: innerBackground,
          }}>
          <MaterialCommunityIcons
            name={option.iconName}
            size={40}
            color={isSelected ? '#FFFFFF' : option.accentColor}
          />
        </View>
      </View>
      <Text className="mt-5 max-w-[190px] text-center text-lg font-extrabold tracking-[1.2px] text-white">
        {option.title}
      </Text>
      <Text className="mt-[6px] max-w-[180px] px-[6px] text-center text-xs text-white">
        {option.description}
      </Text>
    </Pressable>
  );
}

export default function OrderTypeModal({
  visible,
  onClose,
  options,
  selectedOrderType,
  onSelect,
  onContinue,
  sheetBackgroundColor,
  sheetTitleColor,
  sheetSubtitleColor,
  sheetAccentColor,
  insets,
  isDarkMode,
}) {
  const [primaryOption, secondaryOption] = options ?? [];

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View
        className="flex-1 items-center justify-center bg-[rgba(17,17,17,0.6)] px-6"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close order type selection"
          onPress={onClose}
          className="absolute inset-0"
        />
        <View className="w-full max-w-[420px] items-center">
          <View className="mb-8 w-full flex-row items-center justify-center px-3">
            <View className="flex-1 items-center">
              <OrderTypeOption
                option={primaryOption}
                isSelected={selectedOrderType === primaryOption?.key}
                onSelect={onSelect}
                isDarkMode={isDarkMode}
              />
            </View>
            <Text
              className="mx-[18px] text-base font-bold tracking-[1.3px]"
              style={{ color: sheetSubtitleColor }}>
              or
            </Text>
            <View className="flex-1 items-center">
              <OrderTypeOption
                option={secondaryOption}
                isSelected={selectedOrderType === secondaryOption?.key}
                onSelect={onSelect}
                isDarkMode={isDarkMode}
              />
            </View>
          </View>
          <View
            className="w-full items-center rounded-[32px] px-6 pt-8"
            style={{
              backgroundColor: sheetBackgroundColor,
              paddingBottom: Math.max(insets.bottom + 12, 28),
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: isDarkMode ? 0.45 : 0.18,
              shadowRadius: 28,
              elevation: 18,
            }}>
            <Text className="text-center text-xl font-bold" style={{ color: sheetTitleColor }}>
              Choose how you like to receive your order
            </Text>
            <Text className="mt-2 text-center text-sm" style={{ color: sheetSubtitleColor }}>
              Tap an option above to continue. You can change this later from the cart.
            </Text>
            <TouchableOpacity
              onPress={onContinue}
              disabled={!selectedOrderType}
              accessibilityRole="button"
              accessibilityLabel="Proceed to payment"
              className="mt-7 w-full">
              <LinearGradient
                colors={selectedOrderType ? ['#F97316', '#F63D0C'] : ['#F4C6A6', '#F4C6A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="items-center rounded-full py-4"
                style={{
                  opacity: selectedOrderType ? 1 : 0.6,
                }}>
                <Text
                  className="text-base font-bold uppercase tracking-[1.05px]"
                  style={{ color: selectedOrderType ? '#FFFFFF' : '#B45309' }}>
                  Proceed to Pay
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel order type selection"
              className="mt-[18px]">
              <Text className="text-[15px] font-semibold" style={{ color: sheetAccentColor }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
