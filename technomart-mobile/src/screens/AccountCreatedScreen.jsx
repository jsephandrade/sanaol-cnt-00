// screens/AccountCreatedScreen.jsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Easing,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AuthLayout from '../components/AuthLayout';

export default function AccountCreatedScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const email = route?.params?.email;

  // Spinning decorative icons (same as LoginScreen)
  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const spin3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.timing(spin1, {
          toValue: 1,
          duration: 9000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(spin2, {
          toValue: 1,
          duration: 11000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(spin3, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ];
    loops.forEach((l) => l.start());
    AccessibilityInfo.announceForAccessibility?.(
      'Your account was successfully created. Click Log in to get started.'
    );
    return () => loops.forEach((l) => l.stop());
  }, [spin1, spin2, spin3]);

  const rotate1 = spin1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotate2 = spin2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const rotate3 = spin3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const goToLogin = () => {
    // keep this simple to play nice with your existing navigator names
    navigation.navigate('Login');
  };

  return (
    <AuthLayout>
      <View style={{ flex: 1 }}>
        {/* Full-screen background layer */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: '#FFF5EE',
          }}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none">
          <Animated.View
            style={{
              position: 'absolute',
              top: 40,
              left: 20,
              opacity: 0.15,
              transform: [{ rotate: rotate1 }],
            }}>
            <MaterialCommunityIcons name="pizza" size={96} color="#FFC999" />
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 120,
              right: 20,
              opacity: 0.15,
              transform: [{ rotate: rotate2 }],
            }}>
            <MaterialCommunityIcons name="french-fries" size={96} color="#FFC999" />
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 220,
              left: 80,
              opacity: 0.15,
              transform: [{ rotate: rotate3 }],
            }}>
            <MaterialCommunityIcons name="cup" size={96} color="#FFC999" />
          </Animated.View>
        </View>

        {/* Foreground content */}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 10,
            paddingTop: Platform.select({ ios: insets.top + 24, android: 24 }),
            justifyContent: 'center',
          }}
          contentInsetAdjustmentBehavior="always"
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View className="mb-4 w-full items-center pt-5">
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="App logo"
            />
          </View>

          {/* Card */}
          <View className="mt-6 w-full rounded-2xl bg-[#f5f5f5] p-6">
            <View className="mb-2 flex-row items-center">
              <MaterialCommunityIcons name="check-decagram" size={28} color="#16A34A" />
              <Text className="ml-2 text-2xl font-bold text-sub" accessibilityRole="header">
                You&apos;re all set!
              </Text>
            </View>

            <Text className="mt-1 text-base text-gray-700">
              Your account was successfully created! Click Log in to get started.
            </Text>
            {email ? (
              <Text className="mt-2 text-sm text-gray-600">
                We will send important updates to {email}.
              </Text>
            ) : null}

            {/* Primary action */}
            <TouchableOpacity
              testID="loginButton"
              onPress={goToLogin}
              className="mt-6 rounded-xl bg-peach-500 py-3"
              accessibilityRole="button"
              accessibilityLabel="Log in">
              <Text className="text-center text-lg font-semibold text-white">Log in</Text>
            </TouchableOpacity>

            {/* Subtle tip */}
            <View className="mt-4">
              <Text className="text-xs text-gray-500">
                Having trouble? You can always reset your password on the login screen.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthLayout>
  );
}
