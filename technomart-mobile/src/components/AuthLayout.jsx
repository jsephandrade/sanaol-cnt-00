import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Shared layout used for authentication screens.
 *
 * Wraps children with safe-area padding and keyboard avoidance so that sign-in
 * flows look consistent without duplicating boilerplate per screen.
 * Apply any extra spacing directly on the child components to keep this layout
 * flexible.
 */
export default function AuthLayout({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-peach-50"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}
