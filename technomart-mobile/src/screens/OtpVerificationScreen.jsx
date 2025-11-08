import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

const DIGIT_COUNT = 6;

function maskEmail(email = '') {
  const trimmed = email.trim();
  if (!trimmed) return '';
  const [local = '', domain = ''] = trimmed.split('@');
  if (!domain) return trimmed;
  if (local.length <= 2) {
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${local.slice(0, 2)}***@${domain}`;
}

function formatRemaining(ms) {
  if (ms == null) return null;
  if (ms <= 0) return 'Expired';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export default function OtpVerificationScreen({ navigation, route }) {
  const params = route?.params || {};
  const insets = useSafeAreaInsets();
  const { verifyLoginOtp, resendLoginOtp, authenticating, clearError } = useAuth();

  const [challenge, setChallenge] = useState(() => ({
    email: params.email || '',
    otpToken: params.otpToken || '',
    remember: Boolean(params.remember),
    user: params.user || null,
    expiresIn: Number(params.expiresIn ?? 0) || 0,
    issuedAt: Number(params.issuedAt ?? Date.now()) || Date.now(),
  }));
  const [digits, setDigits] = useState(() => Array(DIGIT_COUNT).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const inputRefs = useRef(Array(DIGIT_COUNT).fill(null));

  const challengeEmail = challenge.email;
  const challengeToken = challenge.otpToken;
  const challengeRemember = challenge.remember;

  useEffect(() => {
    if (!challengeEmail || !challengeToken) {
      navigation.replace('Login');
    }
  }, [challengeEmail, challengeToken, navigation]);

  useEffect(() => {
    clearError?.();
  }, [clearError]);

  const expiresAt = useMemo(() => {
    if (!challenge.expiresIn) return null;
    return challenge.issuedAt + challenge.expiresIn * 1000;
  }, [challenge]);

  const [remaining, setRemaining] = useState(() => {
    if (!expiresAt) return null;
    return Math.max(0, expiresAt - Date.now());
  });

  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const expired = useMemo(() => {
    if (!expiresAt) return false;
    return Date.now() >= expiresAt;
  }, [expiresAt]);

  const code = useMemo(() => digits.join(''), [digits]);

  useEffect(() => {
    if (!expired && challengeToken) {
      inputRefs.current?.[0]?.focus?.();
    }
  }, [challengeToken, expired]);

  const focusInput = useCallback((index) => {
    const target = inputRefs.current?.[index];
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }, []);

  const resetDigits = useCallback(() => {
    setDigits(Array(DIGIT_COUNT).fill(''));
    focusInput(0);
  }, [focusInput]);

  const handleDigitChange = useCallback(
    (index, value) => {
      if (verifying || resendPending || authenticating || expired) return;
      const sanitized = (value || '').replace(/\D/g, '');
      setDigits((prev) => {
        const next = [...prev];
        next[index] = sanitized ? sanitized.slice(-1) : '';
        return next;
      });
      if (sanitized) {
        focusInput(Math.min(DIGIT_COUNT - 1, index + 1));
      }
    },
    [authenticating, expired, focusInput, resendPending, verifying]
  );

  const handleKeyPress = useCallback(
    (index, event) => {
      if (verifying || resendPending || authenticating || expired) return;
      if (event?.nativeEvent?.key === 'Backspace' && !digits[index]) {
        const previous = Math.max(0, index - 1);
        setDigits((prev) => {
          const next = [...prev];
          next[previous] = '';
          return next;
        });
        focusInput(previous);
      }
    },
    [authenticating, digits, expired, focusInput, resendPending, verifying]
  );

  const handleVerify = useCallback(async () => {
    if (verifying || resendPending || authenticating) return;
    if (code.length !== DIGIT_COUNT) {
      setError('Enter the full 6-digit code to continue.');
      return;
    }
    setError('');
    setInfo('');
    setVerifying(true);
    try {
      await verifyLoginOtp({
        email: challengeEmail,
        otpToken: challengeToken,
        code,
        remember: challengeRemember,
      });
      AccessibilityInfo.announceForAccessibility?.('Verification successful. Logged in.');
      navigation.replace('Home');
    } catch (err) {
      const message =
        err?.message || err?.data?.message || 'Invalid or expired code. Please try again.';
      setError(message);
      resetDigits();
    } finally {
      setVerifying(false);
    }
  }, [
    authenticating,
    challengeEmail,
    challengeRemember,
    challengeToken,
    code,
    navigation,
    resendPending,
    resetDigits,
    verifyLoginOtp,
    verifying,
  ]);

  const handleResend = useCallback(async () => {
    if (resendPending || verifying || authenticating || !challengeToken) return;
    setError('');
    setInfo('');
    setResendPending(true);
    try {
      const result = await resendLoginOtp({
        email: challengeEmail,
        otpToken: challengeToken,
        remember: challengeRemember,
      });
      const nextToken = result?.otpToken || challengeToken;
      const nextExpiresIn =
        Number(result?.expiresIn ?? result?.ttl ?? result?.expiresInSeconds) ||
        challenge.expiresIn ||
        0;
      setChallenge((current) => ({
        ...current,
        otpToken: nextToken,
        expiresIn: nextExpiresIn,
        issuedAt: Date.now(),
      }));
      resetDigits();
      setInfo('A new verification code has been sent to your email.');
      AccessibilityInfo.announceForAccessibility?.('A new verification code was sent.');
    } catch (err) {
      const message =
        err?.message ||
        err?.data?.message ||
        'Unable to resend the verification code. Please try again shortly.';
      setError(message);
    } finally {
      setResendPending(false);
    }
  }, [
    authenticating,
    challengeEmail,
    challengeRemember,
    challengeToken,
    challenge.expiresIn,
    resendLoginOtp,
    resendPending,
    resetDigits,
    verifying,
  ]);

  const handleBack = useCallback(() => {
    navigation.replace('Login');
  }, [navigation]);

  const verifyingState = verifying || authenticating;

  const countdownLabel = useMemo(() => {
    const formatted = formatRemaining(remaining);
    return formatted ? `Code expires in ${formatted}` : null;
  }, [remaining]);

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
          <Text style={styles.headerText}>Verify your login</Text>
          <Text style={styles.subText}>
            Enter the 6-digit code sent to{' '}
            <Text style={styles.emphasis}>{maskEmail(challengeEmail)}</Text>.
          </Text>
          {countdownLabel && !expired && <Text style={styles.countdown}>{countdownLabel}</Text>}
          {expired && (
            <Text style={[styles.countdown, styles.expired]}>
              This code has expired. Request a new one.
            </Text>
          )}

          {(error || info) && (
            <View style={[styles.infoBox, error ? styles.infoError : styles.infoSuccess]}>
              <Text style={styles.infoText}>{error || info}</Text>
            </View>
          )}

          <View style={styles.inputsRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.digitInput, digit ? styles.digitInputActive : null]}
                value={digit}
                keyboardType="number-pad"
                returnKeyType="next"
                placeholder="•"
                placeholderTextColor="#D1D5DB"
                maxLength={1}
                editable={!verifyingState && !resendPending && !expired}
                onChangeText={(value) => handleDigitChange(index, value)}
                onKeyPress={(event) => handleKeyPress(index, event)}
                importantForAutofill="yes"
                textContentType="oneTimeCode"
                autoFocus={index === 0}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (verifyingState || resendPending || expired || code.length !== DIGIT_COUNT) &&
                styles.primaryButtonDisabled,
            ]}
            disabled={verifyingState || resendPending || expired || code.length !== DIGIT_COUNT}
            onPress={handleVerify}>
            <Text style={styles.primaryButtonText}>
              {verifyingState ? 'Verifying…' : 'Verify Code'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={handleBack}
              disabled={verifyingState}>
              <Text style={styles.footerButtonText}>Back to login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={handleResend}
              disabled={verifyingState || resendPending}>
              <Text style={styles.footerButtonText}>
                {resendPending ? 'Sending…' : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
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
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  subText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  emphasis: {
    fontWeight: '600',
    color: '#f07f13',
  },
  countdown: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  expired: {
    color: '#dc2626',
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  infoSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  infoText: {
    fontSize: 13,
    color: '#1f2937',
  },
  inputsRow: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  digitInput: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  digitInputActive: {
    borderColor: '#f07f13',
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 14,
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
  footerActions: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    paddingVertical: 6,
  },
  footerButtonText: {
    color: '#f07f13',
    fontSize: 14,
    fontWeight: '600',
  },
});
