import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Image,
  TouchableWithoutFeedback,
  StatusBar,
  Animated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // logo animations
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const logoY = useRef(new Animated.Value(10)).current;

  // decorative spin animations
  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const spin3 = useRef(new Animated.Value(0)).current;

  const goNext = useCallback(() => {
    // prevent double navigation
    if (navigation.getState?.()?.routes?.slice(-1)[0]?.name !== 'Login') {
      navigation.replace('Login');
    }
  }, [navigation]);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility?.('TechnoMart is loading');

    // Spin loops for decorative icons (different durations so they de-sync)
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

    let timeoutId;

    // Logo intro + hold + delayed navigate
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(650),
    ]);

    animation.start(() => {
      timeoutId = setTimeout(goNext, 2500); // extra pause before navigating
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      animation.stop();
      loops.forEach((l) => l.stop());
    };
  }, [goNext, logoY, opacity, scale, spin1, spin2, spin3]);

  // map spin values to degrees (spin2 reversed for variety)
  const rotate1 = spin1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotate2 = spin2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const rotate3 = spin3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <TouchableWithoutFeedback
      onPress={goNext}
      accessibilityRole="button"
      accessibilityLabel="Skip intro and continue to login">
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <StatusBar barStyle="dark-content" />

        {/* Spinning decorative icons */}
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0 }}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 60,
              left: 30,
              opacity: 0.18,
              transform: [{ rotate: rotate1 }],
            }}>
            <MaterialCommunityIcons name="pizza" size={110} color="#FFC999" />
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 130,
              right: 30,
              opacity: 0.18,
              transform: [{ rotate: rotate2 }],
            }}>
            <MaterialCommunityIcons name="french-fries" size={110} color="#FFC999" />
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              bottom: 110,
              left: 80,
              opacity: 0.18,
              transform: [{ rotate: rotate3 }],
            }}>
            <MaterialCommunityIcons name="cup" size={110} color="#FFC999" />
          </Animated.View>
        </View>

        {/* Logo */}
        <Animated.View
          accessible
          accessibilityRole="image"
          accessibilityLabel="TechnoMart logo"
          style={{
            opacity,
            transform: [{ scale }, { translateY: logoY }],
          }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}
