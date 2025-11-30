import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

function formatRole(role = '') {
  if (!role) return '';
  const normalized = role.trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function PendingVerificationScreen({ navigation, route }) {
  const params = route?.params || {};
  const insets = useSafeAreaInsets();
  const { resendVerification, authenticating, clearError } = useAuth();

  const initialEmail =
    params.email ||
    params.user?.email ||
    (typeof params.user?.username === 'string' ? params.user.username : '');

  const [statusMessageVisible, setStatusMessageVisible] = useState(false);
  const [email] = useState(() => (initialEmail || '').trim().toLowerCase());
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const userName = params.user?.name || params.user?.fullName || '';
  const userRole = formatRole(params.user?.role || '');

  useEffect(() => {
    clearError?.();
  }, [clearError]);

  useEffect(() => {
    if (!email) {
      navigation.replace('Login');
    }
  }, [email, navigation]);

  const handleResend = useCallback(async () => {
    if (!email || pending || authenticating) return;
    setError('');
    setInfo('');
    setPending(true);
    try {
      await resendVerification({ email });
      setInfo('If your account still needs verification, a new confirmation email is on the way.');
      setStatusMessageVisible(true);
      AccessibilityInfo.announceForAccessibility?.('Verification email resent. Check your inbox.');
    } catch (err) {
      const message =
        err?.message ||
        err?.data?.message ||
        'Unable to resend the verification email right now. Please try again shortly.';
      setError(message);
    } finally {
      setPending(false);
    }
  }, [authenticating, email, pending, resendVerification]);

  const handleBackToLogin = useCallback(() => {
    navigation.replace('Login');
  }, [navigation]);

  const statusDetails = useMemo(() => {
    if (!statusMessageVisible) return null;
    return (
      <Text style={styles.secondaryText}>
        Already verified? Return to the login screen and sign in again.
      </Text>
    );
  }, [statusMessageVisible]);

  const tokenHint = useMemo(() => {
    if (!params.verifyToken) return null;
    return (
      <View style={styles.tokenBox}>
        <Text style={styles.tokenTitle}>Verification token</Text>
        <Text selectable style={styles.tokenValue}>
          {params.verifyToken}
        </Text>
        <Text style={styles.tokenHint}>
          Share this code with the administrator if they need to validate your access manually.
        </Text>
      </View>
    );
  }, [params.verifyToken]);

  return (
    <AuthLayout>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Thanks for signing in!</Text>
          <Text style={styles.subtitle}>
            We&apos;re reviewing your account details to keep everything secure.
          </Text>

          <View style={styles.statusBox}>
            <Text style={styles.statusHeader}>What happens next?</Text>
            <Text style={styles.statusText}>
              {userName ? `${userName}, ` : ''}
              your access is still pending activation. Once an administrator approves your request,
              you&apos;ll receive an email at <Text style={styles.highlight}>{email}</Text>.
            </Text>
            {userRole ? (
              <Text style={styles.statusText}>
                Assigned role: <Text style={styles.highlight}>{userRole}</Text>
              </Text>
            ) : null}
          </View>

          {(info || error) && (
            <View style={[styles.feedbackBox, error ? styles.feedbackError : styles.feedbackInfo]}>
              <Text style={styles.feedbackText}>{error || info}</Text>
            </View>
          )}

          {statusDetails}
          {tokenHint}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (pending || authenticating) && styles.primaryButtonDisabled,
            ]}
            onPress={handleResend}
            disabled={pending || authenticating}>
            <Text style={styles.primaryButtonText}>
              {pending || authenticating ? 'Sending verification…' : 'Resend verification email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToLogin}>
            <Text style={styles.secondaryButtonText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingVertical: 28,
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  statusBox: {
    marginTop: 24,
    backgroundColor: '#fff7ed',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  statusHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9a3412',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7c2d12',
    marginTop: 4,
  },
  highlight: {
    fontWeight: '600',
    color: '#f07f13',
  },
  feedbackBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  feedbackInfo: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  feedbackError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  feedbackText: {
    fontSize: 13,
    color: '#1f2937',
  },
  secondaryText: {
    marginTop: 16,
    fontSize: 13,
    color: '#4b5563',
  },
  tokenBox: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#eff6ff',
    padding: 14,
  },
  tokenTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  tokenValue: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    color: '#1e3a8a',
  },
  tokenHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#1e3a8a',
  },
  primaryButton: {
    marginTop: 28,
    borderRadius: 16,
    backgroundColor: '#f07f13',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#f8b97d',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#f07f13',
    fontSize: 15,
    fontWeight: '600',
  },
});
