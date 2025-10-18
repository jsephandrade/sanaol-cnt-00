// app/_layout.js
import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';
import { NotificationProvider } from '../context/NotificationContext';
import { DietaryProvider } from '../context/DietaryContext'; // ✅ your dietary provider

export default function RootLayout() {
  return (
    <CartProvider>
      <NotificationProvider>
        <DietaryProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Splash screen first */}
            <Stack.Screen name="splash" />

            {/* Authentication screens */}
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgotpassword" />

            {/* Main app with tabs */}
            <Stack.Screen name="(tabs)" />
          </Stack>
        </DietaryProvider>
      </NotificationProvider>
    </CartProvider>
  );
}
