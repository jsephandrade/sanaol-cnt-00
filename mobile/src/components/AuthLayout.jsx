import React from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

/**
 * Shared layout for all authentication-related screens.
 *
 * - Provides SafeAreaView to respect notches/status bars
 * - Adds KeyboardAvoidingView to prevent inputs from being hidden by the keyboard
 * - Applies Tailwind background color (peach-50, from your tailwind config)
 */
export default function AuthLayout({ children }) {
  return (
    <SafeAreaView className="flex-1 bg-peach-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
