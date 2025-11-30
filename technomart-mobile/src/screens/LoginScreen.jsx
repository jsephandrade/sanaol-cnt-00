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
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  // --- State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Touch & submit state (kept for UI hints only) ---
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const {
    signIn: signInWithAuth,
    authenticating,
    error: authError,
    clearError,
    hydrated,
  } = useAuth();

  // --- Refs for focus management ---
  const passwordRef = useRef(null);

  // --- Safe area ---
  const insets = useSafeAreaInsets();

  // --- Derived validation state (purely visual now) ---
  const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const trimmedPassword = useMemo(() => password.trim(), [password]);

  const emailError = useMemo(() => {
    if (!trimmedEmail) return 'Please enter your email';
    if (!emailRegex.test(trimmedEmail)) return 'Please enter a valid email';
    return '';
  }, [trimmedEmail]);

  const passwordError = useMemo(() => {
    if (!trimmedPassword) return 'Please enter your password';
    if (trimmedPassword.length < 6) return 'Password must be at least 6 characters';
    return '';
  }, [trimmedPassword]);

  // Only show field errors after touch or submit
  const showEmailError = emailTouched || formSubmitted ? emailError : '';
  const showPasswordError = passwordTouched || formSubmitted ? passwordError : '';

  // Top-level inline error (server error wins; otherwise first visible field error)
  const formError = errorMessage || showEmailError || showPasswordError;

  // --- Prevent setState on unmounted component ---
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

  const setSafeError = useMemo(() => setSafeState(setErrorMessage), [setSafeState]);
  const setSafeEmail = useMemo(() => setSafeState(setEmail), [setSafeState]);
  const setSafePassword = useMemo(() => setSafeState(setPassword), [setSafeState]);
  const setSafeEmailTouched = useMemo(() => setSafeState(setEmailTouched), [setSafeState]);
  const setSafePasswordTouched = useMemo(() => setSafeState(setPasswordTouched), [setSafeState]);
  const setSafeFormSubmitted = useMemo(() => setSafeState(setFormSubmitted), [setSafeState]);

  useEffect(() => {
    if (!authError) return;
    const message =
      authError?.message ||
      authError?.data?.message ||
      'Unable to sign in. Please check your credentials.';
    setSafeError(message);
  }, [authError, setSafeError]);

  // Change handlers mark fields as touched
  const handleEmailChange = useCallback(
    (t) => {
      if (!emailTouched) setSafeEmailTouched(true);
      setSafeEmail(t);
      if (errorMessage) {
        setSafeError('');
      }
      if (authError) {
        clearError();
      }
    },
    [
      emailTouched,
      setSafeEmailTouched,
      setSafeEmail,
      errorMessage,
      authError,
      clearError,
      setSafeError,
    ]
  );

  const handlePasswordChange = useCallback(
    (t) => {
      if (!passwordTouched) setSafePasswordTouched(true);
      setSafePassword(t);
      if (errorMessage) {
        setSafeError('');
      }
      if (authError) {
        clearError();
      }
    },
    [
      passwordTouched,
      setSafePasswordTouched,
      setSafePassword,
      errorMessage,
      authError,
      clearError,
      setSafeError,
    ]
  );

  // --- Submit handler (no auth; just navigate) ---
  const handleLogin = useCallback(async () => {
    if (authenticating) return;
    setSafeFormSubmitted(true); // keeps error hints/UX, but doesn't block navigation
    setSafeError('');

    try {
      const remember = true;
      const result = await signInWithAuth(trimmedEmail, trimmedPassword, {
        remember,
      });

      if (result?.otpRequired) {
        if (!result?.otpToken) {
          setSafeError(
            'Verification could not be started. Please try again or request a new code.'
          );
          return;
        }
        const expiresInSeconds = Number(result?.expiresIn ?? result?.otpExpiresIn ?? 0) || 0;
        const issuedAt = Date.now();
        AccessibilityInfo.announceForAccessibility?.(
          'Verification required. Enter the 6-digit code we sent to your email.'
        );
        navigation.replace('OtpVerification', {
          email: trimmedEmail,
          otpToken: result.otpToken,
          remember,
          user: result.user || null,
          expiresIn: expiresInSeconds,
          issuedAt,
        });
        return;
      }

      const normalizedStatus = (result?.user?.status || '').toLowerCase();
      if (result?.pending || (normalizedStatus && normalizedStatus !== 'active')) {
        AccessibilityInfo.announceForAccessibility?.('Your account is pending verification.');
        navigation.replace('PendingVerification', {
          email: trimmedEmail,
          verifyToken: result?.verifyToken || '',
          user: result?.user || null,
        });
        return;
      }

      if (!result?.success && !result?.token && !result?.accessToken) {
        const message =
          result?.message || 'Unable to sign in. Please verify your email and password.';
        setSafeError(message);
        return;
      }

      AccessibilityInfo.announceForAccessibility?.('Logged in');
      // Clear fields/touch state (cosmetic)
      setSafeEmail('');
      setSafePassword('');
      setSafeEmailTouched(false);
      setSafePasswordTouched(false);
      setSafeFormSubmitted(false);
      // Go straight to the next screen
      navigation.replace('Home');
    } catch (err) {
      const message =
        err?.message ||
        err?.data?.detail ||
        'Unable to sign in. Please verify your email and password.';
      setSafeError(message);
    }
  }, [
    authenticating,
    signInWithAuth,
    trimmedEmail,
    trimmedPassword,
    navigation,
    setSafeError,
    setSafeEmail,
    setSafePassword,
    setSafeEmailTouched,
    setSafePasswordTouched,
    setSafeFormSubmitted,
  ]);

  // Allow pressing "Enter/Go" on the keyboard to submit
  const onEmailSubmit = useCallback(() => passwordRef.current?.focus(), []);
  const onPasswordSubmit = handleLogin;

  const inputsEditable = !authenticating && hydrated;
  const loading = authenticating;

  // --- Spinning decorative icons (same vibe as Splash) ---
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

  const rotate1 = spin1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const rotate2 = spin2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const rotate3 = spin3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <AuthLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({
          ios: insets.top,
          android: 0,
        })}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
              {/* Decorative icons (spinning) */}
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

            {/* Foreground scrollable content */}
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
                <View className="mb-4 mt-10 w-full items-center pt-7">
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
                    Log in to your account
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
                      testID="emailInput"
                      className="ml-2 flex-1 text-sm text-text"
                      placeholder="Enter your email"
                      placeholderTextColor="#A3A3A3"
                      value={email}
                      onChangeText={handleEmailChange}
                      onBlur={() => setSafeEmailTouched(true)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      onSubmitEditing={onEmailSubmit}
                      editable={inputsEditable}
                      importantForAutofill="yes"
                      accessibilityLabel="Email"
                      accessibilityHint="Enter your email address"
                    />
                  </View>

                  {/* Password */}
                  <Text className="mb-1 mt-3 text-sm text-sub">Your Password</Text>
                  <View
                    className={[
                      'flex-row items-center rounded-lg border bg-white px-3 py-2',
                      showPasswordError ? 'border-red-400' : 'border-gray-200',
                    ].join(' ')}>
                    <Feather name="lock" size={18} color="#F07F13" />
                    <TextInput
                      testID="passwordInput"
                      ref={passwordRef}
                      className="ml-2 flex-1 text-sm text-text"
                      placeholder="Enter your password"
                      placeholderTextColor="#A3A3A3"
                      value={password}
                      onChangeText={handlePasswordChange}
                      onBlur={() => setSafePasswordTouched(true)}
                      secureTextEntry={!showPassword}
                      returnKeyType="go"
                      onSubmitEditing={onPasswordSubmit}
                      editable={inputsEditable}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      textContentType="password"
                      accessibilityLabel="Password"
                      accessibilityHint="Enter your password"
                    />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      onPress={() => setShowPassword((p) => !p)}
                      disabled={!inputsEditable}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color="#A3A3A3" />
                    </TouchableOpacity>
                  </View>

                  {/* Inline errors (visual only) */}
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text
                      testID="errorText"
                      className="flex-1 text-xs text-red-500"
                      accessibilityLiveRegion="polite"
                      accessibilityRole="text">
                      {formError ? formError : ' '}
                    </Text>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('ForgotPassword')}
                      disabled={!inputsEditable}
                      accessibilityRole="button"
                      accessibilityLabel="Forgot password">
                      <Text className="text-sm text-peach-500">Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Submit */}
                  <TouchableOpacity
                    testID="continueButton"
                    disabled={!inputsEditable}
                    onPress={handleLogin}
                    className={[
                      'mt-2 rounded-xl py-3',
                      !inputsEditable ? 'bg-peach-300' : 'bg-peach-500',
                    ].join(' ')}
                    accessibilityRole="button"
                    accessibilityLabel="Continue">
                    {loading ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator />
                        <Text className="ml-2 text-center text-lg font-semibold text-white">
                          Logging in…
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-center text-lg font-semibold text-white">Continue</Text>
                    )}
                  </TouchableOpacity>

                  {/* Divider */}
                  <View className="my-5 flex-row items-center">
                    <View className="h-[1px] flex-1 bg-gray-300" />
                    <Text className="mx-3 text-gray-400">Or</Text>
                    <View className="h-[1px] flex-1 bg-gray-300" />
                  </View>

                  {/* Face login (still just routes to your FaceScan screen) */}
                  <TouchableOpacity
                    className="flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-3"
                    onPress={() => navigation.navigate('FaceScan', { autoPrompt: true })}
                    accessibilityRole="button"
                    accessibilityLabel="Login with Face">
                    <MaterialCommunityIcons name="face-recognition" size={20} color="#F07F13" />
                    <Text className="ml-8 text-base">Login with Face</Text>
                  </TouchableOpacity>

                  {/* Google */}
                  <TouchableOpacity
                    className="flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-3"
                    onPress={() => Alert.alert('Google login', 'Not implemented in this build')}
                    disabled={!inputsEditable}
                    accessibilityRole="button"
                    accessibilityLabel="Login with Google">
                    <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
                    <Text className="ml-8 text-base">Login with Google</Text>
                  </TouchableOpacity>

                  {/* Sign up */}
                  <View className="mt-4 flex-row justify-center">
                    <Text className="text-sm text-gray-600">Don&apos;t have an account? </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('SignUp')}
                      disabled={!inputsEditable}
                      accessibilityRole="button"
                      accessibilityLabel="Sign up">
                      <Text className="text-sm font-semibold text-peach-500">Sign Up</Text>
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
