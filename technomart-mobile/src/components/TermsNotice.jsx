import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

export default function TermsNotice() {
  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <View className="mt-5 items-center px-4">
      <Text className="text-center text-xs text-gray-500">
        By using TechoMart, you agree to the{' '}
        <Text>
          <TouchableOpacity
            onPress={() => openLink('https://www.facebook.com/jseph.andrade')}
            accessibilityRole="link"
            accessibilityLabel="Read Terms">
            <Text className="text-xs text-peach-500">Terms</Text>
          </TouchableOpacity>
        </Text>{' '}
        and{' '}
        <Text>
          <TouchableOpacity
            onPress={() => openLink('https://www.facebook.com/jseph.andrade')}
            accessibilityRole="link"
            accessibilityLabel="Read Privacy Policy">
            <Text className="text-xs text-peach-500">Privacy Policy</Text>
          </TouchableOpacity>
        </Text>
        .
      </Text>
    </View>
  );
}
