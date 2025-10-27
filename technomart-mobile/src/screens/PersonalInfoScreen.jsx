// screens/PersonalInfoScreen.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

const FieldCard = ({ children }) => (
  <View className="mt-3 rounded-2xl bg-[#f5f5f5]">{children}</View>
);

const Label = ({ children }) => (
  <Text className="px-4 pb-1 pt-3 text-[12px] font-medium uppercase text-gray-500">{children}</Text>
);

const Row = ({ children }) => <View className="px-4 py-3">{children}</View>;

// Allow secureTextEntry (new)
const Input = React.forwardRef(
  (
    {
      value,
      onChangeText,
      placeholder,
      keyboardType,
      autoCapitalize,
      textContentType,
      accessibilityLabel,
      secureTextEntry, // NEW
      autoComplete, // optional nice-to-have
    },
    ref
  ) => (
    <TextInput
      ref={ref}
      className="rounded-xl bg-white px-4 py-3 text-[15px] text-text"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9AA3AF"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      textContentType={textContentType}
      accessibilityLabel={accessibilityLabel || placeholder}
      returnKeyType="done"
      secureTextEntry={secureTextEntry}
      autoComplete={autoComplete}
    />
  )
);

Input.displayName = 'Input';

const Pill = ({ color = '#16A34A', text }) => (
  <View
    className="rounded-full px-2 py-[2px]"
    style={{ backgroundColor: `${color}22`, borderWidth: 1, borderColor: color }}>
    <Text style={{ color }} className="text-[11px] font-semibold">
      {text}
    </Text>
  </View>
);

export default function PersonalInfoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // Prefill with whatever you have in your store / route params:
  const [firstName, setFirstName] = React.useState('Joseph');
  const [lastName, setLastName] = React.useState('Andrade');
  const [email, setEmail] = React.useState('joseph@example.com');
  const [emailVerified, setEmailVerified] = React.useState(false); // replace with real status
  const [mobile, setMobile] = React.useState('+63 900 000 0000');

  const [saving, setSaving] = React.useState(false);
  const [sendingLink, setSendingLink] = React.useState(false);

  // Password state (NEW)
  const [currentPwd, setCurrentPwd] = React.useState('');
  const [newPwd, setNewPwd] = React.useState('');
  const [confirmPwd, setConfirmPwd] = React.useState('');
  const [changingPwd, setChangingPwd] = React.useState(false);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Face auth state
  const [faceSupported, setFaceSupported] = React.useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = React.useState(false);
  const [checkingBio, setCheckingBio] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const hasHW = await LocalAuthentication.hasHardwareAsync();
        const types = hasHW ? await LocalAuthentication.supportedAuthenticationTypesAsync() : [];
        const supportsFace = types?.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        );
        const enrolled = hasHW ? await LocalAuthentication.isEnrolledAsync() : false;
        if (mounted) {
          setFaceSupported(Boolean(supportsFace));
          setBiometricEnrolled(Boolean(enrolled));
        }
      } catch (e) {
        // Non-fatal; surface a friendly message
        console.warn('LocalAuth check failed', e);
      } finally {
        if (mounted) setCheckingBio(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- Mock API hooks (replace with real ones) ----
  const sendVerificationLink = async (emailAddr) => {
    // call your /email/verify endpoint
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true };
  };

  const saveProfile = async (payload) => {
    // call your /profile/update endpoint
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true };
  };

  // NEW: change password mock
  const changePassword = async ({ currentPassword, newPassword }) => {
    // call your /auth/change-password endpoint
    await new Promise((r) => setTimeout(r, 900));
    // return { ok: false, code: "INCORRECT_CURRENT" } // example failure
    return { ok: true };
  };
  // -----------------------------------------------

  const onSendVerify = async () => {
    try {
      setSendingLink(true);
      const res = await sendVerificationLink(email);
      if (!res.ok) throw new Error('Failed to send verification email');
      Alert.alert('Verification sent', 'Check your inbox for a link to verify your email.');
    } catch (e) {
      Alert.alert('Oops', e.message || 'Could not send the verification link.');
    } finally {
      setSendingLink(false);
    }
  };

  const onSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing info', 'First name and last name are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (!/^\+?\d[0-9\s\-()]{6,}$/.test(mobile)) {
      Alert.alert('Invalid number', 'Please enter a valid mobile number.');
      return;
    }

    try {
      setSaving(true);
      const res = await saveProfile({ firstName, lastName, email, mobile });
      if (!res.ok) throw new Error('Save failed');
      Alert.alert('Saved', 'Your personal info has been updated.');
      // If user changed email, flip verified state off until they verify
      // (In real app, rely on server response)
      setEmailVerified((prev) => prev && email === 'joseph@example.com');
    } catch (e) {
      Alert.alert('Oops', e.message || 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

  // NEW: Password change handler
  const onChangePassword = async () => {
    const hasMin = newPwd.length >= 8;
    const hasNum = /\d/.test(newPwd);
    const hasLetter = /[A-Za-z]/.test(newPwd);

    if (!currentPwd) {
      Alert.alert('Current password required', 'Please enter your current password.');
      return;
    }
    if (!hasMin || !hasNum || !hasLetter) {
      Alert.alert(
        'Weak password',
        'New password must be at least 8 characters and include letters and numbers.'
      );
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert("Passwords don't match", 'Please confirm your new password.');
      return;
    }

    try {
      setChangingPwd(true);
      const res = await changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      if (!res.ok) {
        if (res.code === 'INCORRECT_CURRENT') {
          Alert.alert('Incorrect password', 'Your current password is incorrect.');
        } else {
          Alert.alert("Couldn't change password", 'Please try again.');
        }
        return;
      }
      Alert.alert('Password updated', 'Your password has been changed.');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (_error) {
      Alert.alert('Oops', 'Something went wrong while changing your password.');
    } finally {
      setChangingPwd(false);
    }
  };

  const onRegisterFace = async () => {
    if (!faceSupported) {
      Alert.alert('Not supported', "Your device doesn't support Face Recognition.");
      return;
    }

    if (!biometricEnrolled) {
      // take user to OS settings to enroll
      Alert.alert(
        'Set up Face Recognition',
        "You'll be taken to device settings to enroll your face.",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                // Most Androids will open Settings; on iOS this opens the app's settings screen
                Linking.openSettings();
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return;
    }

    // If already enrolled, let them test/refresh the biometric
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      if (result.success) {
        Alert.alert('Face recognized', 'Face authentication is active on this device.');
      } else {
        Alert.alert('Authentication failed', result.warning || 'Please try again.');
      }
    } catch (_error) {
      Alert.alert('Error', 'Could not complete face authentication.');
    }
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}>
      {/* Decorative background icons (same vibe as Profile) */}
      <View
        className="absolute inset-0"
        accessible={false}
        importantForAccessibility="no-hide-descendants">
        <MaterialCommunityIcons
          name="pizza"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 40, left: 20, opacity: 0.15 }}
        />
        <MaterialCommunityIcons
          name="french-fries"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 120, right: 20, opacity: 0.15 }}
        />
        <MaterialCommunityIcons
          name="cup"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 220, left: 80, opacity: 0.15 }}
        />
      </View>

      {/* Header */}
      <View className="relative mt-5 px-4 pb-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack?.()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="chevron-left" size={22} color="#9AA3AF" />
          </TouchableOpacity>

          <Text className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-600">
            Personal Info
          </Text>

          {/* spacer to balance header layout */}
          <View style={{ width: 22 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Names */}
        <FieldCard>
          <Label>Basic Info</Label>
          <Row>
            <Text className="mb-1 text-[13px] text-gray-600">First Name</Text>
            <Input
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              autoCapitalize="words"
              textContentType="givenName"
              accessibilityLabel="First name"
            />
          </Row>
          <View className="mx-4 h-[1px] bg-gray-200" />
          <Row>
            <Text className="mb-1 mt-1 text-[13px] text-gray-600">Last Name</Text>
            <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              autoCapitalize="words"
              textContentType="familyName"
              accessibilityLabel="Last name"
            />
          </Row>
        </FieldCard>

        {/* Email w/ verification */}
        <FieldCard>
          <Label>Email</Label>
          <Row>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-[13px] text-gray-600">Email Address</Text>
              {emailVerified ? (
                <Pill color="#16A34A" text="Verified" />
              ) : (
                <Pill color="#DC2626" text="Unverified" />
              )}
            </View>
            <Input
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                // If user edits email, mark as unverified (UI-only; real app should rely on server)
                setEmailVerified(false);
              }}
              placeholder="name@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              accessibilityLabel="Email address"
            />
            {!emailVerified && (
              <TouchableOpacity
                onPress={onSendVerify}
                disabled={sendingLink}
                className="mt-3 self-start rounded-xl px-4 py-2"
                style={{ backgroundColor: '#F07F13' }}
                accessibilityRole="button"
                accessibilityLabel="Send verification link">
                {sendingLink ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="#fff" size="small" />
                    <Text className="ml-2 text-[13px] font-semibold text-white">Sending...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Feather name="send" size={16} color="#fff" />
                    <Text className="ml-2 text-[13px] font-semibold text-white">
                      Send verification link
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {emailVerified && (
              <Text className="mt-2 text-[12px] text-gray-600">
                This email is verified. Changing it will require verification again.
              </Text>
            )}
          </Row>
        </FieldCard>

        {/* Change Password (NEW) */}
        <FieldCard>
          <Label>Password</Label>

          {/* Current password */}
          <Row>
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-[13px] text-gray-600">Current Password</Text>
            </View>

            <View className="relative">
              <Input
                value={currentPwd}
                onChangeText={setCurrentPwd}
                placeholder="Enter current password"
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
                textContentType="password"
                autoComplete="current-password"
                accessibilityLabel="Current password"
              />
              <TouchableOpacity
                onPress={() => setShowCurrent((s) => !s)}
                accessibilityRole="button"
                accessibilityLabel={showCurrent ? 'Hide current password' : 'Show current password'}
                style={{ position: 'absolute', right: 12, top: 12 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name={!showCurrent ? 'eye-off' : 'eye'} size={18} color="#9AA3AF" />
              </TouchableOpacity>
            </View>
          </Row>

          <View className="mx-4 h-[1px] bg-gray-200" />

          {/* New password */}
          <Row>
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-[13px] text-gray-600">New Password</Text>
            </View>

            <View className="relative">
              <Input
                value={newPwd}
                onChangeText={setNewPwd}
                placeholder="Create a new password"
                secureTextEntry={!showNew}
                autoCapitalize="none"
                textContentType="newPassword"
                autoComplete="new-password"
                accessibilityLabel="New password"
              />
              <TouchableOpacity
                onPress={() => setShowNew((s) => !s)}
                accessibilityRole="button"
                accessibilityLabel={showNew ? 'Hide new password' : 'Show new password'}
                style={{ position: 'absolute', right: 12, top: 12 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name={!showNew ? 'eye-off' : 'eye'} size={18} color="#9AA3AF" />
              </TouchableOpacity>
            </View>

            <Text className="mt-2 text-[12px] text-gray-600">
              Use at least 8 characters with letters and numbers.
            </Text>
          </Row>

          {/* Confirm password */}
          <Row>
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-[13px] text-gray-600">Confirm New Password</Text>
            </View>

            <View className="relative">
              <Input
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                placeholder="Re-enter new password"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                textContentType="newPassword"
                autoComplete="new-password"
                accessibilityLabel="Confirm new password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm((s) => !s)}
                accessibilityRole="button"
                accessibilityLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                style={{ position: 'absolute', right: 12, top: 12 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name={!showConfirm ? 'eye-off' : 'eye'} size={18} color="#9AA3AF" />
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={onChangePassword}
              disabled={changingPwd}
              className="mt-3 self-start rounded-xl px-4 py-2"
              style={{ backgroundColor: '#F07F13', opacity: changingPwd ? 0.7 : 1 }}
              accessibilityRole="button"
              accessibilityLabel="Change password">
              {changingPwd ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="ml-2 text-[13px] font-semibold text-white">Updating...</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <AntDesign name="lock" size={16} color="#fff" />
                  <Text className="ml-2 text-[13px] font-semibold text-white">Change Password</Text>
                </View>
              )}
            </TouchableOpacity>
          </Row>
        </FieldCard>

        {/* Mobile */}
        <FieldCard>
          <Label>Phone</Label>
          <Row>
            <Text className="mb-1 text-[13px] text-gray-600">Mobile Number</Text>
            <Input
              value={mobile}
              onChangeText={setMobile}
              placeholder="+63 9xx xxx xxxx"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              accessibilityLabel="Mobile number"
            />
            <Text className="mt-2 text-[12px] text-gray-600">
              Well use this for order updates and account recovery.
            </Text>
          </Row>
        </FieldCard>

        {/* Face Recognition */}
        <FieldCard>
          <Label>Security</Label>

          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-1 pr-3">
              <View className="mb-1 flex-row items-center">
                <MaterialCommunityIcons name="face-recognition" size={18} color="#8B8B8B" />
                <Text className="ml-2 text-[15px] text-text">Face Recognition</Text>
              </View>
              {checkingBio ? (
                <Text className="text-[12px] text-gray-500">Checking device capabilities...</Text>
              ) : faceSupported ? (
                <Text className="text-[12px] text-gray-500">
                  {biometricEnrolled
                    ? 'Face is set up on this device.'
                    : 'Not enrolled yet on this device.'}
                </Text>
              ) : (
                <Text className="text-[12px] text-gray-500">Not supported on this device.</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={onRegisterFace}
              disabled={checkingBio || (!faceSupported && !biometricEnrolled)}
              className="rounded-xl px-4 py-2"
              style={{ backgroundColor: faceSupported ? '#8B5CF6' : '#D1D5DB' }}
              accessibilityRole="button"
              accessibilityLabel={
                biometricEnrolled ? 'Test face recognition' : 'Set up face recognition'
              }>
              <Text className="text-[13px] font-semibold text-white">
                {biometricEnrolled ? 'Test' : 'Set Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </FieldCard>

        {/* Save button */}
        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          className="mt-6 rounded-2xl px-5 py-4"
          style={{ backgroundColor: '#F07F13', opacity: saving ? 0.7 : 1 }}
          accessibilityRole="button"
          accessibilityLabel="Save changes">
          <View className="flex-row items-center justify-center">
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="save-outline" size={18} color="#fff" />
            )}
            <Text className="ml-2 text-base font-semibold text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
