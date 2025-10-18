import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FieldCard = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const Label = ({ text }) => <Text style={styles.label}>{text}</Text>;

const PasswordInput = ({ value, onChangeText, placeholder }) => {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!showPwd}
        style={styles.inputWithIcon}
        placeholderTextColor="#9ca3af"
      />
      <TouchableOpacity
        onPress={() => setShowPwd(!showPwd)}
        style={styles.eyeIcon}
      >
        <Ionicons
          name={showPwd ? 'eye' : 'eye-off'}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>
    </View>
  );
};

const Input = ({ value, onChangeText, placeholder, secureTextEntry }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    secureTextEntry={secureTextEntry}
    style={styles.input}
    placeholderTextColor="#9ca3af"
  />
);

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('Juan');
  const [lastName, setLastName] = useState('Dela Cruz');
  const [email, setEmail] = useState('juan.delacruz@example.com');
  const [phone, setPhone] = useState('+63 912 345 6789');

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [faceSupported, setFaceSupported] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      setFaceSupported(
        compatible &&
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
      );
      setBiometricEnrolled(enrolled);
    })();
  }, []);

  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Weak';
    if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.length >= 8
    )
      return 'Strong';
    return 'Medium';
  };

  const strength = getPasswordStrength(newPwd);
  const strengthColor =
    strength === 'Weak'
      ? '#ef4444'
      : strength === 'Medium'
        ? '#eab308'
        : '#22c55e';

  const handleSave = () => {
    Alert.alert(
      'Profile Updated',
      'Your information has been saved successfully.'
    );
  };

  const handlePasswordChange = () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }
    if (newPwd.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }
    Alert.alert('Success', 'Password changed successfully.');
    setOldPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  const handleFaceRecognition = async () => {
    if (!faceSupported || !biometricEnrolled) {
      Alert.alert(
        'Not Available',
        'Face recognition is not supported on this device.'
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify with Face ID',
    });

    if (result.success) {
      Alert.alert('Verified', 'Identity confirmed!');
    } else {
      Alert.alert('Failed', 'Face recognition failed. Try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#F07F13" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Personal Information</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 40 }}>
        {/* Basic Info */}
        <FieldCard title="Basic Information">
          <Label text="First Name" />
          <Input
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
          />
          <Label text="Last Name" />
          <Input
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
          />
        </FieldCard>

        {/* Contact Info */}
        <FieldCard title="Contact Information">
          <Label text="Email" />
          <Input value={email} onChangeText={setEmail} placeholder="Email" />
          <Label text="Phone" />
          <Input value={phone} onChangeText={setPhone} placeholder="Phone" />
        </FieldCard>

        {/* Change Password */}
        <FieldCard title="Change Password">
          <Label text="Old Password" />
          <PasswordInput
            value={oldPwd}
            onChangeText={setOldPwd}
            placeholder="Old Password"
          />

          <Label text="New Password" />
          <PasswordInput
            value={newPwd}
            onChangeText={setNewPwd}
            placeholder="New Password"
          />
          {newPwd.length > 0 && (
            <Text style={[styles.strengthText, { color: strengthColor }]}>
              Strength: {strength}
            </Text>
          )}

          <Label text="Confirm Password" />
          <PasswordInput
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            placeholder="Confirm Password"
          />

          <TouchableOpacity
            style={styles.btnTeal}
            onPress={handlePasswordChange}
          >
            <Text style={styles.btnText}>Update Password</Text>
          </TouchableOpacity>
        </FieldCard>

        {/* Face Recognition */}
        {faceSupported && (
          <FieldCard title="Face Recognition">
            <Text style={styles.grayText}>
              Use Face ID to enhance account security.
            </Text>
            <TouchableOpacity
              style={styles.btnTeal}
              onPress={handleFaceRecognition}
              disabled={!biometricEnrolled}
            >
              <Text style={styles.btnText}>
                {biometricEnrolled ? 'Test Face ID' : 'No Face Enrolled'}
              </Text>
            </TouchableOpacity>
          </FieldCard>
        )}

        {/* Save Changes */}
        <TouchableOpacity style={styles.btnOrange} onPress={handleSave}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
  },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: '#0f172a',
    fontSize: 14,
  },
  inputWrapper: { position: 'relative', marginBottom: 12 },
  inputWithIcon: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 12,
    paddingRight: 40,
    color: '#0f172a',
    fontSize: 14,
  },
  eyeIcon: { position: 'absolute', right: 12, top: 12 },
  grayText: { color: '#6b7280', marginBottom: 12 },
  strengthText: { marginBottom: 12, fontWeight: '600' },
  btnTeal: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  btnOrange: {
    backgroundColor: '#F07F13',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
