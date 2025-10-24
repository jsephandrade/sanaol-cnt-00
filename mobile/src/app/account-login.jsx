import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
  Roboto_900Black,
} from '@expo-google-fonts/roboto';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const googleConfig = {
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  responseType: 'id_token',
  scopes: ['profile', 'email'],
  selectAccount: true,
};

export default function AccountLoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // Google Auth
  const [request, , promptAsync] = Google.useAuthRequest(googleConfig);

  const validateEmail = useCallback((value) => /\S+@\S+\.\S+/.test(value), []);

  const handleLogin = async () => {
    const errs = {};
    if (!validateEmail(email)) errs.email = 'Invalid email address';
    if (password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    try {
      const result = await signIn({
        email: email.trim(),
        password,
        remember: true,
      });

      if (result.success) {
        Alert.alert('Success', result?.meta?.message || 'Login successful!');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Network error or server is unreachable.'
      );
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    if (!request) {
      Alert.alert(
        'Unavailable',
        'Google Sign-In is not configured for this build. Please install client IDs or try again later.'
      );
      return;
    }
    setGoogleLoading(true);
    try {
      const res = await promptAsync();
      if (!res || res.type !== 'success') {
        if (res?.type === 'error') {
          const description =
            res?.error?.message || res?.params?.error_description;
          Alert.alert(
            'Google Login Failed',
            description || 'Unable to complete Google login.'
          );
        }
        return;
      }
      const idToken = res.authentication?.idToken || res.params?.id_token;
      if (!idToken) {
        throw new Error('Missing Google ID token in response');
      }
      const result = await signInWithGoogle({ credential: idToken });
      if (!result?.success) {
        Alert.alert(
          'Google Login Failed',
          result?.message || 'Unable to authenticate with Google.'
        );
        return;
      }
      if (result.pending) {
        Alert.alert(
          'Awaiting Approval',
          result?.message ||
            'Your profile is pending review. We will notify you once an administrator activates your account.'
        );
        return;
      }
      Alert.alert(
        'Success',
        result?.meta?.message || result?.message || 'Login successful!',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert(
        'Google Login Failed',
        error?.message || 'Unable to authenticate with Google right now.'
      );
    } finally {
      setGoogleLoading(false);
    }
  }, [promptAsync, request, router, signInWithGoogle]);

  const handleGuestEntry = useCallback(async () => {
    setGuestLoading(true);
    try {
      const result = await signInAsGuest();
      if (!result?.success) {
        Alert.alert(
          'Unavailable',
          result?.message || 'Unable to continue without an account.'
        );
        return;
      }
      Alert.alert('Guest Access', 'You are browsing as a guest user.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error) {
      console.error('Guest entry error:', error);
      Alert.alert(
        'Unavailable',
        error?.message || 'Unable to continue without an account.'
      );
    } finally {
      setGuestLoading(false);
    }
  }, [router, signInAsGuest]);

  // Load fonts
  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    Roboto_900Black,
  });

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require('../../assets/drop_3.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.card}>
            {/* Bold Welcome Back */}
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Sign in to enjoy delicious canteen meals
            </Text>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#888"
                style={styles.icon}
              />
              <TextInput
                style={[
                  styles.input,
                  { flex: 1 },
                  errors.email && styles.inputError,
                ]}
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#888"
                style={styles.icon}
              />
              <TextInput
                style={[
                  styles.input,
                  { flex: 1 },
                  errors.password && styles.inputError,
                ]}
                placeholder="Password"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons
                  name={passwordVisible ? 'eye' : 'eye-off'}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            {/* Continue with Google */}
            <TouchableOpacity
              style={styles.googleButton}
              disabled={!request || googleLoading}
              onPress={handleGoogleSignIn}
            >
              {googleLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#4285F4"
                  style={styles.googleSpinner}
                />
              ) : (
                <Image
                  source={require('../../assets/google.png')} // add google.png in assets
                  style={styles.googleIcon}
                />
              )}
              <Text style={styles.googleText}>
                {googleLoading ? 'Connecting...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Guest Access */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestEntry}
              disabled={guestLoading}
            >
              {guestLoading ? (
                <ActivityIndicator size="small" color="#FF8C00" />
              ) : (
                <Text style={styles.guestText}>
                  Continue without an account
                </Text>
              )}
            </TouchableOpacity>

            {/* Links */}
            <TouchableOpacity
              onPress={() => router.push('/account-password-reset')}
            >
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/account-registration')}
            >
              <Text style={styles.linkText}>
                Don’t have an account?{' '}
                <Text style={{ fontFamily: 'Roboto_700Bold' }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 25, paddingVertical: 40 },
  container: { alignItems: 'center', justifyContent: 'flex-start', flex: 1 },
  logo: { width: 180, height: 180, marginTop: 35 },
  title: {
    fontSize: 28,
    fontFamily: 'Roboto_900Black',
    color: '#333',
    marginBottom: 2,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 30,
    textAlign: 'left',
    fontFamily: 'Roboto_400Regular',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
    marginTop: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
  },
  icon: { marginRight: 8 },
  input: {
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto_400Regular',
  },
  inputError: { borderColor: 'red' },
  loginButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#FF8C00',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 2,
  },
  loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  googleSpinner: {
    marginRight: 10,
  },
  googleText: {
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
    color: '#333',
  },
  guestButton: {
    borderWidth: 1,
    borderColor: '#FF8C00',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  guestText: {
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
    color: '#FF8C00',
  },
  linkText: {
    color: '#FF8C00',
    marginTop: 5,
    fontSize: 15,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 5,
    fontSize: 13,
  },
});
