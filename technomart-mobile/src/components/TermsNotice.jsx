import React from 'react';
import { View, Text, Linking } from 'react-native';

export default function TermsNotice() {
  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <View className="mt-5 items-center px-4">
      <Text className="text-center text-xs text-gray-500">
        By using TechnoMart, you agree to the{' '}
        <Text
          className="text-xs text-peach-500"
          onPress={() => openLink('https://www.facebook.com/jseph.andrade')}
          accessibilityRole="link"
          accessibilityLabel="Read Terms">
          Terms
        </Text>{' '}
        and{' '}
        <Text
          className="text-xs text-peach-500"
          onPress={() => openLink('https://www.facebook.com/jseph.andrade')}
          accessibilityRole="link"
          accessibilityLabel="Read Privacy Policy">
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  );
}
