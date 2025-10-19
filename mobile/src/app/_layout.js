import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Platform } from 'react-native';

import { queryClient } from '../api/queryClient';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { NotificationProvider } from '../context/NotificationContext';
import { DietaryProvider } from '../context/DietaryContext';

export default function RootLayout() {
  const isDev = process.env.NODE_ENV !== 'production';
  const showDevtools = isDev && Platform.OS === 'web';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <DietaryProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="splash" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="forgotpassword" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </DietaryProvider>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
      {showDevtools ? <ReactQueryDevtools /> : null}
    </QueryClientProvider>
  );
}
