import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AuthLayout from '../components/AuthLayout';
import TermsNotice from '../components/TermsNotice';
import { requestPasswordReset } from '../utils/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation }) {
  // --- State ---
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const insets = useSafeAreaInsets();

  // --- Derived ---
  const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const emailError = useMemo(() => {
    if (!trimmedEmail) return 'Please enter your email';
    if (!emailRegex.test(trimmedEmail)) return 'Please enter a valid email';
    return '';
  }, [trimmedEmail]);
  const showEmailError = emailTouched || formSubmitted ? emailError : '';
  const formError = errorMessage || showEmailError;

  // --- Safe setState pattern like LoginScreen ---
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const setSafeState = useCallback(
    (setter) => (value) => {
      if (mountedRef.current) setter(value);
    },
    []
  );
  const setSafeEmail = setSafeState(setEmail);
  const setSafeEmailTouched = setSafeState(setEmailTouched);
  const setSafeLoading = setSafeState(setLoading);
  const setSafeError = setSafeState(setErrorMessage);
  const setSafeFormSubmitted = setSafeState(setFormSubmitted);

  // Clear server error as user edits
  useEffect(() => {
    if (errorMessage) setSafeError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const onEmailChange = useCallback(
    (t) => {
      if (!emailTouched) setSafeEmailTouched(true);
      setSafeEmail(t);
    },
    [emailTouched, setSafeEmailTouched, setSafeEmail]
  );

  // --- Submit handler ---
  const handleSendReset = useCallback(async () => {
    setSafeFormSubmitted(true);
    if (emailError) {
      setSafeError(emailError);
      AccessibilityInfo.announceForAccessibility?.(emailError);
      return;
    }
    if (loading) return;

    setSafeError('');
    setSafeLoading(true);
    try {
      await requestPasswordReset(trimmedEmail);
      const successMsg = 'If that email is registered, we’ve sent a password reset link.';
      AccessibilityInfo.announceForAccessibility?.(successMsg);
      Alert.alert(
        'Check your email',
        `${successMsg}\n\nTip: Search your inbox for “Password reset”.`,
        [{ text: 'Back to Login', onPress: () => navigation.replace('Login') }, { text: 'OK' }]
      );
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      setSafeError(message);
      AccessibilityInfo.announceForAccessibility?.(message);
    } finally {
      setSafeLoading(false);
    }
  }, [
    emailError,
    loading,
    trimmedEmail,
    navigation,
    setSafeError,
    setSafeLoading,
    setSafeFormSubmitted,
  ]);

  // --- Decorative spins (same vibe as Login) ---
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
    return () => loops.forEach((l) => l.stop());
  }, [spin1, spin2, spin3]);
  const rotate1 = spin1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotate2 = spin2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const rotate3 = spin3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const inputsEditable = !loading;

  return (
    <AuthLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({ ios: insets.top, android: 0 })}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {/* Background */}
            <View
              style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF5EE' }}
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

            {/* Content */}
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 24,
                paddingBottom: 10,
                justifyContent: 'center',
              }}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              contentInsetAdjustmentBehavior="always">
              <View className="relative flex-1">
                {/* Logo */}
                <View className="mb-4 mt-20 w-full items-center pt-5">
                  <Image
                    source={require('../../assets/logo.png')}
                    style={{ width: 120, height: 120 }}
                    resizeMode="contain"
                    accessibilityRole="image"
                    accessibilityLabel="App logo"
                  />
                </View>

                {/* Card */}
                <View className="mt-10 w-full rounded-2xl bg-[#f5f5f5] p-6">
                  <Text className="text-2xl font-bold text-sub" accessibilityRole="header">
                    Forgot your password?
                  </Text>
                  <Text className="mt-2 text-gray-600">
                    Enter your account email and we’ll send you a reset link.
                  </Text>

                  {/* Email */}
                  <Text className="mb-1 mt-5 text-sm text-sub">Your Email</Text>
                  <View
                    className={[
                      'flex-row items-center rounded-lg border bg-white px-3 py-2',
                      showEmailError ? 'border-red-400' : 'border-gray-200',
                    ].join(' ')}>
                    <Feather name="mail" size={18} color="#F07F13" />
                    <TextInput
                      className="ml-2 flex-1 text-sm text-text"
                      placeholder="Enter your email"
                      placeholderTextColor="#A3A3A3"
                      value={email}
                      onChangeText={onEmailChange}
                      onBlur={() => setSafeEmailTouched(true)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="send"
                      onSubmitEditing={handleSendReset}
                      editable={inputsEditable}
                      importantForAutofill="yes"
                      accessibilityLabel="Email"
                      accessibilityHint="Enter your email address"
                    />
                  </View>

                  {/* Inline error */}
                  <Text
                    className="mt-2 text-xs text-red-500"
                    testID="errorText"
                    accessibilityLiveRegion="polite">
                    {formError ? formError : ' '}
                  </Text>

                  {/* Submit */}
                  <TouchableOpacity
                    testID="sendResetButton"
                    disabled={loading}
                    onPress={handleSendReset}
                    className={[
                      'mt-3 rounded-xl py-3',
                      loading ? 'bg-peach-300' : 'bg-peach-500',
                    ].join(' ')}
                    accessibilityRole="button"
                    accessibilityLabel="Send reset link">
                    {loading ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator />
                        <Text className="ml-2 text-center text-lg font-semibold text-white">
                          Sending…
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-center text-lg font-semibold text-white">
                        Send reset link
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Back to login */}
                  <View className="mt-4 flex-row justify-center">
                    <Text className="text-sm text-gray-600">Changed your mind? </Text>
                    <TouchableOpacity
                      onPress={() => navigation.replace('Login')}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel="Back to login">
                      <Text className="text-sm font-semibold text-peach-500">Back to Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TermsNotice />
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}
