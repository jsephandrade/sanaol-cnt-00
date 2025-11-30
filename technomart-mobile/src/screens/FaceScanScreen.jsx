// FaceScanScreen.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
  Alert,
  Modal,
  BackHandler,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

import AuthLayout from '../components/AuthLayout';
import TermsNotice from '../components/TermsNotice';

export default function FaceScanScreen({ navigation, route }) {
  // Route options you may pass in: { autoPrompt: true } to auto-trigger biometrics
  const autoPrompt = route?.params?.autoPrompt ?? false;
  const autoPromptedRef = useRef(false); // <- prevents repeated auto-prompts

  // --- Biometrics state ---
  const [isSupported, setIsSupported] = useState(null); // hardware present?
  const [hasEnrollment, setHasEnrollment] = useState(null); // some biometric enrolled?
  const [biometryTypes, setBiometryTypes] = useState([]); // enum types supported
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Derived flags
  const hasFace = useMemo(
    () => biometryTypes?.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION),
    [biometryTypes]
  );
  const hasFingerprint = useMemo(
    () => biometryTypes?.includes(LocalAuthentication.AuthenticationType.FINGERPRINT),
    [biometryTypes]
  );
  const supportedLabel = hasFace ? 'Face' : hasFingerprint ? 'Biometric' : 'Biometric';
  const canScan = !!isSupported && !!hasEnrollment && (hasFace || hasFingerprint) && !authLoading;

  // --- Camera test state ---
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [requesting, setRequesting] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // --- Safe area ---
  const insets = useSafeAreaInsets();

  // --- Decorative animations (unchanged) ---
  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const spin3 = useRef(new Animated.Value(0)).current;
  const rotate1 = spin1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotate2 = spin2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const rotate3 = spin3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
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

  // Pulsing ring
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.15] });

  // Pause camera preview when screen unfocused
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  // Detect device biometric support
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!mounted) return;
        setIsSupported(compatible);
        setBiometryTypes(types || []);
        setHasEnrollment(enrolled);
      } catch (err) {
        if (!mounted) return;
        setIsSupported(false);
        setHasEnrollment(false);
        setBiometryTypes([]);
        setErrorMessage(err?.message || "We couldn't check biometrics on this device.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // --- BIOMETRIC AUTH ---
  const handleBiometricAuth = useCallback(async () => {
    if (authLoading) return;
    setErrorMessage('');
    setAuthLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Scan ${supportedLabel} to continue`,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use passcode',
        // Keep it biometric-first; avoids auto-jumping to PIN.
        disableDeviceFallback: true,
      });
      if (result.success) {
        AccessibilityInfo.announceForAccessibility?.('Authenticated successfully');
        navigation.navigate('Home');
      } else {
        // Common cases: user/system cancel; lockout; unknown
        if (result.error === 'lockout') {
          setErrorMessage('Too many attempts. Try your password instead.');
          AccessibilityInfo.announceForAccessibility?.(
            'Too many attempts. Try your password instead.'
          );
        } else if (
          result.error === 'user_cancel' ||
          result.error === 'system_cancel' ||
          result.error === 'app_cancel'
        ) {
          // Silent no-op
          setErrorMessage('');
        } else {
          setErrorMessage('Authentication failed. Please try again.');
          AccessibilityInfo.announceForAccessibility?.('Authentication failed. Please try again.');
        }
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Something went wrong with biometric authentication.');
      AccessibilityInfo.announceForAccessibility?.(
        'Something went wrong with biometric authentication.'
      );
    } finally {
      setAuthLoading(false);
    }
  }, [authLoading, supportedLabel, navigation]);

  // Optional auto prompt (biometrics) - run ONCE per mount
  useEffect(() => {
    if (autoPrompt && canScan && !autoPromptedRef.current) {
      autoPromptedRef.current = true;
      const id = setTimeout(handleBiometricAuth, 300);
      return () => clearTimeout(id);
    }
  }, [autoPrompt, canScan, handleBiometricAuth]);

  // Reset the auto-prompt flag when leaving the screen (so it can run again on re-entry)
  useFocusEffect(
    useCallback(() => {
      return () => {
        autoPromptedRef.current = false;
      };
    }, [])
  );

  // --- CAMERA TEST HELPERS ---
  const openSettings = useCallback(() => {
    Linking.openSettings?.();
  }, []);

  const openCamera = useCallback(async () => {
    try {
      if (!permission || !permission.granted) {
        setRequesting(true);
        const res = await requestPermission();
        setRequesting(false);
        if (!res.granted) {
          Alert.alert(
            'Camera permission needed',
            'Enable camera access in Settings to test the camera.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openSettings },
            ]
          );
          return;
        }
      }
      setCameraOpen(true);
      AccessibilityInfo.announceForAccessibility?.('Camera opened');
    } catch (e) {
      setRequesting(false);
      Alert.alert('Error', e?.message || 'Could not open camera.');
    }
  }, [permission, requestPermission, openSettings]);

  const closeCamera = useCallback(() => {
    setCameraOpen(false);
    AccessibilityInfo.announceForAccessibility?.('Camera closed');
  }, []);

  // Android: back button closes camera modal
  useEffect(() => {
    if (!cameraOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeCamera();
      return true;
    });
    return () => sub.remove();
  }, [cameraOpen, closeCamera]);

  const goPasswordLogin = useCallback(() => {
    navigation.replace?.('Login') || navigation.navigate('Login');
  }, [navigation]);

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
                {/* Card */}
                <View className="mt-10 w-full rounded-2xl bg-[#f5f5f5] p-6">
                  <Text className="text-2xl font-bold text-sub" accessibilityRole="header">
                    {hasFace ? 'Face Scan' : 'Biometric Login'}
                  </Text>

                  {/* Status / Hints */}
                  <Text className="mt-2 text-sm text-gray-600">
                    {isSupported === null || hasEnrollment === null
                      ? 'Checking device capabilities…'
                      : !isSupported
                        ? 'Biometric hardware not available on this device.'
                        : !hasEnrollment
                          ? 'No biometric enrolled. Please add Face ID / biometrics in your device settings.'
                          : hasFace
                            ? 'Use your face to sign in securely.'
                            : 'Use your device biometrics to sign in securely.'}
                  </Text>

                  {/* Scanner Visual */}
                  <View className="mb-2 mt-6 items-center">
                    <View
                      style={{
                        width: 160,
                        height: 160,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Animated.View
                        style={{
                          position: 'absolute',
                          width: 160,
                          height: 160,
                          borderRadius: 80,
                          backgroundColor: '#F07F13',
                          opacity: ringOpacity,
                          transform: [{ scale: ringScale }],
                        }}
                        accessible={false}
                        pointerEvents="none"
                      />
                      <View
                        style={{
                          position: 'absolute',
                          width: 160,
                          height: 160,
                          borderRadius: 80,
                          borderWidth: 3,
                          borderColor: '#F07F13',
                          backgroundColor: 'white',
                          opacity: 0.9,
                        }}
                        accessible={false}
                        pointerEvents="none"
                      />
                      <MaterialCommunityIcons name="face-recognition" size={64} color="#F07F13" />
                    </View>

                    {isSupported && hasEnrollment ? (
                      <Text className="mt-3 text-xs text-gray-500">
                        Hold your phone at eye level · Center your face in the circle
                      </Text>
                    ) : null}
                  </View>

                  {/* Inline error */}
                  <View className="mt-2 min-h-[18px]">
                    <Text className="text-xs text-red-500" accessibilityLiveRegion="polite">
                      {errorMessage ? errorMessage : ' '}
                    </Text>
                  </View>

                  {/* Primary CTA: Biometrics */}
                  <TouchableOpacity
                    disabled={!canScan}
                    onPress={handleBiometricAuth}
                    className={[
                      'mt-2 rounded-xl py-3',
                      canScan ? 'bg-peach-500' : 'bg-peach-300',
                    ].join(' ')}
                    accessibilityRole="button"
                    accessibilityLabel={canScan ? `Scan ${supportedLabel}` : 'Scan unavailable'}>
                    {authLoading ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator />
                        <Text className="ml-2 text-center text-lg font-semibold text-white">
                          Authenticating…
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-center text-lg font-semibold text-white">
                        {canScan ? `Scan ${supportedLabel}` : 'Unavailable'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Secondary CTA: Open Camera (Test) */}
                  <TouchableOpacity
                    onPress={openCamera}
                    disabled={requesting}
                    className={[
                      'mt-3 rounded-xl border border-gray-200 bg-white py-3',
                      requesting ? 'opacity-70' : '',
                    ].join(' ')}
                    accessibilityRole="button"
                    accessibilityLabel="Open camera to test">
                    <Text className="text-center text-base font-semibold">
                      {requesting ? 'Requesting camera permission…' : 'Open Camera (Test)'}
                    </Text>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View className="my-5 flex-row items-center">
                    <View className="h-[1px] flex-1 bg-gray-300" />
                    <Text className="mx-3 text-gray-400">Or</Text>
                    <View className="h-[1px] flex-1 bg-gray-300" />
                  </View>

                  {/* Fallback to password */}
                  <TouchableOpacity
                    className="flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-3"
                    onPress={goPasswordLogin}
                    disabled={authLoading || requesting}
                    accessibilityRole="button"
                    accessibilityLabel="Use email & password instead">
                    <Feather name="lock" size={20} color="#F07F13" />
                    <Text className="ml-8 text-base">Use email & password instead</Text>
                  </TouchableOpacity>
                </View>

                <TermsNotice />
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Fullscreen Camera Modal */}
      <Modal
        visible={cameraOpen}
        animationType="slide"
        onRequestClose={closeCamera}
        presentationStyle="fullScreen">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          {isFocused ? (
            <CameraView style={{ flex: 1 }} facing="front" enableTorch={false} />
          ) : (
            <View style={{ flex: 1, backgroundColor: 'black' }} />
          )}

          {/* Close button overlay */}
          <View
            style={{
              position: 'absolute',
              top: insets.top + 12,
              right: 12,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}>
            <TouchableOpacity
              onPress={closeCamera}
              accessibilityRole="button"
              accessibilityLabel="Close camera">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="x" size={20} color="#fff" />
                <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '600' }}>Close</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AuthLayout>
  );
}
