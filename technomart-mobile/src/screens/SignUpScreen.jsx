// screens/SignUpScreen.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import AuthLayout from '../components/AuthLayout';
import TermsNotice from '../components/TermsNotice';
// ⬇️ Removed API for now
// import { register } from "../utils/auth"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen({ navigation }) {
  // --- State ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // You can keep loading in case you re-enable API later
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Touch & submit state ---
  const [firstTouched, setFirstTouched] = useState(false);
  const [lastTouched, setLastTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [roleTouched, setRoleTouched] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // --- Refs for focus flow ---
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const insets = useSafeAreaInsets();

  // --- Derived, trimmed values ---
  const trimmedFirst = useMemo(() => firstName.trim(), [firstName]);
  const trimmedLast = useMemo(() => lastName.trim(), [lastName]);
  const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const trimmedPassword = useMemo(() => password.trim(), [password]);
  const trimmedConfirm = useMemo(() => confirm.trim(), [confirm]);

  // --- Field-level validation ---
  const firstError = useMemo(() => {
    if (!trimmedFirst) return 'Please enter your first name';
    return '';
  }, [trimmedFirst]);

  const lastError = useMemo(() => {
    if (!trimmedLast) return 'Please enter your last name';
    return '';
  }, [trimmedLast]);

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

  const confirmError = useMemo(() => {
    if (!trimmedConfirm) return 'Please confirm your password';
    if (trimmedConfirm !== trimmedPassword) return 'Passwords do not match';
    return '';
  }, [trimmedConfirm, trimmedPassword]);

  const allowedRoles = useMemo(() => ['Customer', 'Faculty Member'], []);

  const roleError = useMemo(() => {
    if (!role) return 'Please select your role';
    if (!allowedRoles.includes(role)) return 'Please select a valid role';
    return '';
  }, [role, allowedRoles]);

  // Only show after touch or submit
  const showFirstError = firstTouched || formSubmitted ? firstError : '';
  const showLastError = lastTouched || formSubmitted ? lastError : '';
  const showEmailError = emailTouched || formSubmitted ? emailError : '';
  const showRoleError = roleTouched || formSubmitted ? roleError : '';
  const showPasswordError = passwordTouched || formSubmitted ? passwordError : '';
  const showConfirmError = confirmTouched || formSubmitted ? confirmError : '';

  // Top-level error (no server error now; still shows first visible field error)
  const formError =
    errorMessage ||
    showFirstError ||
    showLastError ||
    showEmailError ||
    showRoleError ||
    showPasswordError ||
    showConfirmError;

  // --- Prevent setState on unmounted ---
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

  const setSafeLoading = useMemo(() => setSafeState(setLoading), [setSafeState]);
  const setSafeError = useMemo(() => setSafeState(setErrorMessage), [setSafeState]);
  const setSafeFirstName = useMemo(() => setSafeState(setFirstName), [setSafeState]);
  const setSafeLastName = useMemo(() => setSafeState(setLastName), [setSafeState]);
  const setSafeEmail = useMemo(() => setSafeState(setEmail), [setSafeState]);
  const setSafePassword = useMemo(() => setSafeState(setPassword), [setSafeState]);
  const setSafeConfirm = useMemo(() => setSafeState(setConfirm), [setSafeState]);
  const setSafeRole = useMemo(() => setSafeState(setRole), [setSafeState]);
  const setSafeFirstTouched = useMemo(() => setSafeState(setFirstTouched), [setSafeState]);
  const setSafeLastTouched = useMemo(() => setSafeState(setLastTouched), [setSafeState]);
  const setSafeEmailTouched = useMemo(() => setSafeState(setEmailTouched), [setSafeState]);
  const setSafePasswordTouched = useMemo(() => setSafeState(setPasswordTouched), [setSafeState]);
  const setSafeConfirmTouched = useMemo(() => setSafeState(setConfirmTouched), [setSafeState]);
  const setSafeRoleTouched = useMemo(() => setSafeState(setRoleTouched), [setSafeState]);
  const setSafeFormSubmitted = useMemo(() => setSafeState(setFormSubmitted), [setSafeState]);

  // Clear top-level error as user edits
  useEffect(() => {
    if (errorMessage) setSafeError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName, email, password, confirm, role]);

  // Change handlers mark as touched
  const handleFirstChange = useCallback(
    (t) => {
      if (!firstTouched) setSafeFirstTouched(true);
      setSafeFirstName(t);
    },
    [firstTouched, setSafeFirstTouched, setSafeFirstName]
  );

  const handleLastChange = useCallback(
    (t) => {
      if (!lastTouched) setSafeLastTouched(true);
      setSafeLastName(t);
    },
    [lastTouched, setSafeLastTouched, setSafeLastName]
  );

  const handleEmailChange = useCallback(
    (t) => {
      if (!emailTouched) setSafeEmailTouched(true);
      setSafeEmail(t);
    },
    [emailTouched, setSafeEmailTouched, setSafeEmail]
  );

  const handlePasswordChange = useCallback(
    (t) => {
      if (!passwordTouched) setSafePasswordTouched(true);
      setSafePassword(t);
    },
    [passwordTouched, setSafePasswordTouched, setSafePassword]
  );

  const handleConfirmChange = useCallback(
    (t) => {
      if (!confirmTouched) setSafeConfirmTouched(true);
      setSafeConfirm(t);
    },
    [confirmTouched, setSafeConfirmTouched, setSafeConfirm]
  );

  const handleRoleSelect = useCallback(
    (selectedRole) => {
      if (!roleTouched) setSafeRoleTouched(true);
      setSafeRole(selectedRole);
    },
    [roleTouched, setSafeRoleTouched, setSafeRole]
  );

  // --- Submit handler (NO API; just navigate on valid form) ---
  const handleRegister = useCallback(async () => {
    setSafeFormSubmitted(true);

    if (firstError || lastError || roleError || emailError || passwordError || confirmError) {
      const firstVisibleError =
        firstError ||
        lastError ||
        roleError ||
        emailError ||
        passwordError ||
        confirmError;
      setSafeError(firstVisibleError);
      AccessibilityInfo.announceForAccessibility?.(firstVisibleError);
      return;
    }
    if (loading) return;

    setSafeError('');
    setSafeLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      AccessibilityInfo.announceForAccessibility?.('Account created successfully');

      // Clear inputs & touch state after success
      setSafeFirstName('');
      setSafeLastName('');
      setSafeEmail('');
      setSafePassword('');
      setSafeConfirm('');
      setSafeRole('');
      setSafeFirstTouched(false);
      setSafeLastTouched(false);
      setSafeEmailTouched(false);
      setSafePasswordTouched(false);
      setSafeConfirmTouched(false);
      setSafeRoleTouched(false);
      setSafeFormSubmitted(false);

      navigation.navigate('AccountCreated', { email: trimmedEmail });
    } finally {
      setSafeLoading(false);
    }
  }, [
    firstError,
    lastError,
    emailError,
    passwordError,
    confirmError,
    roleError,
    loading,
    trimmedEmail,
    setSafeError,
    setSafeLoading,
    setSafeFirstName,
    setSafeLastName,
    setSafeEmail,
    setSafePassword,
    setSafeConfirm,
    setSafeRole,
    setSafeFirstTouched,
    setSafeLastTouched,
    setSafeEmailTouched,
    setSafePasswordTouched,
    setSafeConfirmTouched,
    setSafeRoleTouched,
    setSafeFormSubmitted,
    navigation,
  ]);

  // Keyboard "next/go" flow
  const onFirstSubmit = useCallback(() => lastNameRef.current?.focus(), []);
  const onLastSubmit = useCallback(() => emailRef.current?.focus(), []);
  const onEmailSubmit = useCallback(() => passwordRef.current?.focus(), []);
  const onPasswordSubmit = useCallback(() => confirmRef.current?.focus(), []);
  const onConfirmSubmit = handleRegister;

  const inputsEditable = !loading;

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
              {/* Decorative icons (unchanged) */}
              <View accessible={false} importantForAccessibility="no-hide-descendants">
                <MaterialCommunityIcons
                  name="pizza"
                  size={96}
                  color="#FFC999"
                  style={{
                    position: 'absolute',
                    top: 40,
                    left: 20,
                    opacity: 0.15,
                  }}
                />
                <MaterialCommunityIcons
                  name="french-fries"
                  size={96}
                  color="#FFC999"
                  style={{
                    position: 'absolute',
                    top: 120,
                    right: 20,
                    opacity: 0.15,
                  }}
                />
                <MaterialCommunityIcons
                  name="cup"
                  size={96}
                  color="#FFC999"
                  style={{
                    position: 'absolute',
                    top: 220,
                    left: 80,
                    opacity: 0.15,
                  }}
                />
              </View>
              <View className="mt-15 pt-12" />

              {/* Card */}
              <View className="mt-20 w-full rounded-2xl bg-[#f5f5f5] p-6">
                <Text className="text-2xl font-bold text-sub" accessibilityRole="header">
                  Create your account
                </Text>

                {/* First/Last Name */}
                <Text className="mb-1 mt-5 text-sm text-sub">Your Name</Text>
                <View className="flex-row" style={{ columnGap: 8 }}>
                  {/* First name */}
                  <View
                    className={[
                      'flex-1 flex-row items-center rounded-lg border bg-white px-3 py-2',
                      showFirstError ? 'border-red-400' : 'border-gray-200',
                    ].join(' ')}>
                    <Feather name="user" size={18} color="#F07F13" />
                    <TextInput
                      testID="firstNameInput"
                      className="ml-2 flex-1 text-sm text-text"
                      placeholder="First name"
                      placeholderTextColor="#A3A3A3"
                      value={firstName}
                      onChangeText={handleFirstChange}
                      onBlur={() => setSafeFirstTouched(true)}
                      returnKeyType="next"
                      onSubmitEditing={onFirstSubmit}
                      editable={inputsEditable}
                      autoCapitalize="words"
                      autoCorrect={false}
                      autoComplete="given-name"
                      textContentType="givenName"
                      accessibilityLabel="First name"
                      accessibilityHint="Enter your first name"
                    />
                  </View>

                  {/* Last name */}
                  <View
                    className={[
                      'flex-1 flex-row items-center rounded-lg border bg-white px-3 py-2',
                      showLastError ? 'border-red-400' : 'border-gray-200',
                    ].join(' ')}>
                    <Feather name="user" size={18} color="#F07F13" />
                    <TextInput
                      testID="lastNameInput"
                      ref={lastNameRef}
                      className="ml-2 flex-1 text-sm text-text"
                      placeholder="Last name"
                      placeholderTextColor="#A3A3A3"
                      value={lastName}
                      onChangeText={handleLastChange}
                      onBlur={() => setSafeLastTouched(true)}
                      returnKeyType="next"
                      onSubmitEditing={onLastSubmit}
                      editable={inputsEditable}
                      autoCapitalize="words"
                      autoCorrect={false}
                      autoComplete="family-name"
                      textContentType="familyName"
                      accessibilityLabel="Last name"
                      accessibilityHint="Enter your last name"
                    />
                  </View>
                </View>

                {/* Email */}
                <Text className="mb-1 mt-3 text-sm text-sub">Your Email</Text>
                <View
                  className={[
                    'flex-row items-center rounded-lg border bg-white px-3 py-2',
                    showEmailError ? 'border-red-400' : 'border-gray-200',
                  ].join(' ')}>
                  <Feather name="mail" size={18} color="#F07F13" />
                  <TextInput
                    testID="emailInput"
                    ref={emailRef}
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

                {/* Role Selection */}
                <Text className="mb-2 mt-3 text-sm text-sub">Select Role</Text>
                <View
                  className="flex-row"
                  style={{ columnGap: 8 }}
                  accessibilityRole="radiogroup"
                  accessibilityLabel="Select your role">
                  {allowedRoles.map((option) => {
                    const selected = role === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        className={[
                          'flex-1 flex-row items-center rounded-lg border px-3 py-3',
                          'bg-white',
                          selected ? 'border-peach-500' : 'border-gray-200',
                          loading ? 'opacity-60' : '',
                        ].join(' ')}
                        onPress={() => handleRoleSelect(option)}
                        disabled={loading}
                        accessibilityRole="radio"
                        accessibilityState={{ disabled: loading, selected }}
                        accessibilityLabel={option}
                        accessibilityHint="Select your account role">
                        <View
                          className={[
                            'mr-2 h-4 w-4 rounded-full border',
                            selected ? 'border-peach-500 bg-peach-500' : 'border-gray-300',
                          ].join(' ')}
                        />
                        <Text className="text-sm font-medium text-text">{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {showRoleError ? (
                  <Text className="mt-1 text-xs text-red-500" accessibilityRole="alert">
                    {showRoleError}
                  </Text>
                ) : null}

                {/* Password */}
                <Text className="mb-1 mt-3 text-sm text-sub">Create Password</Text>
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
                    returnKeyType="next"
                    onSubmitEditing={onPasswordSubmit}
                    editable={inputsEditable}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="newPassword"
                    accessibilityLabel="Password"
                    accessibilityHint="Enter a password at least 6 characters"
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

                {/* Confirm Password */}
                <Text className="mb-1 mt-3 text-sm text-sub">Confirm Password</Text>
                <View
                  className={[
                    'flex-row items-center rounded-lg border bg-white px-3 py-2',
                    showConfirmError ? 'border-red-400' : 'border-gray-200',
                  ].join(' ')}>
                  <Feather name="lock" size={18} color="#F07F13" />
                  <TextInput
                    testID="confirmInput"
                    ref={confirmRef}
                    className="ml-2 flex-1 text-sm text-text"
                    placeholder="Re-enter your password"
                    placeholderTextColor="#A3A3A3"
                    value={confirm}
                    onChangeText={handleConfirmChange}
                    onBlur={() => setSafeConfirmTouched(true)}
                    secureTextEntry={!showConfirm}
                    returnKeyType="go"
                    onSubmitEditing={onConfirmSubmit}
                    editable={inputsEditable}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    accessibilityLabel="Confirm password"
                    accessibilityHint="Re-enter your password"
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirm ? 'Hide confirm password' : 'Show confirm password'
                    }
                    onPress={() => setShowConfirm((p) => !p)}
                    disabled={!inputsEditable}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Feather name={showConfirm ? 'eye' : 'eye-off'} size={18} color="#A3A3A3" />
                  </TouchableOpacity>
                </View>

                {/* Inline error + switch to login */}
                <View className="mt-2 flex-row items-center justify-between">
                  <Text
                    testID="errorText"
                    className="flex-1 text-xs text-red-500"
                    accessibilityLiveRegion="polite"
                    accessibilityRole="text">
                    {formError ? formError : ' '}
                  </Text>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Already have an account? Log in"
                  />
                </View>

                {/* Submit */}
                <TouchableOpacity
                  testID="signUpButton"
                  disabled={loading}
                  onPress={handleRegister}
                  className={[
                    'mt-2 rounded-xl py-3',
                    loading ? 'bg-peach-300' : 'bg-peach-500',
                  ].join(' ')}
                  accessibilityRole="button"
                  accessibilityLabel="Create account">
                  {loading ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator />
                      <Text className="ml-2 text-center text-lg font-semibold text-white">
                        Creating account…
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center text-lg font-semibold text-white">
                      Create account
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View className="my-5 flex-row items-center">
                  <View className="h-[1px] flex-1 bg-gray-300" />
                  <Text className="mx-3 text-gray-400">Or</Text>
                  <View className="h-[1px] flex-1 bg-gray-300" />
                </View>

                {/* Google */}
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-3"
                  onPress={() => {
                    alert('Google sign up not implemented in this build');
                  }}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Sign up with Google">
                  <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
                  <Text className="ml-8 text-base">Sign up with Google</Text>
                </TouchableOpacity>

                {/* Bottom switch to login */}
                <View className="mt-4 flex-row justify-center">
                  <Text className="text-sm text-gray-600">Already have an account? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Log in">
                    <Text className="text-sm font-semibold text-peach-500">Log In</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TermsNotice />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}
